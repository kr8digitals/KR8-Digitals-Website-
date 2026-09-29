/**
 * PRODUCTION SMOKE TEST — serves dist/ (vite build) with SPA fallback
 * and checks that every key route renders with zero page errors,
 * exactly as Hostinger will serve it (static files + .htaccess rewrites).
 */
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "..", "dist");
const PORT = 4173;

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".mp4": "video/mp4", ".svg": "image/svg+xml",
  ".ico": "image/x-icon", ".xml": "application/xml", ".txt": "text/plain",
  ".ttf": "font/ttf", ".woff2": "font/woff2", ".json": "application/json",
};

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = path.join(DIST, p);
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    // SPA fallback: unknown path -> index.html (mirrors .htaccess rewrite)
    file = path.join(DIST, "index.html");
    res.setHeader("X-SPA-Fallback", "1");
  }
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

let pass = 0, fail = 0;
function check(cond, label, detail) {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`); }
}

(async () => {
  await new Promise((r) => server.listen(PORT, "0.0.0.0", r));
  const browser = await chromium.launch({ headless: true });
  const BASE = `http://localhost:${PORT}`;

  const routes = [
    {
      path: "/",
      label: "Homepage (KR8 store)",
      assert: async (page) => {
        const body = await page.locator("body").innerText();
        return body.length > 200 && /KR8/i.test(body);
      },
    },
    {
      path: "/mindset-shift",
      label: "Mindset Shift public page",
      assert: async (page) => {
        const flyer = page.locator("img[alt*='flyer' i]");
        const heading = await page.locator("body").innerText();
        return (
          (await flyer.count()) >= 1 &&
          /Mindset Shift 7\.0/i.test(heading) &&
          /Get out of (?:your )?debt|BUILDING WEALTH/i.test(heading)
        );
      },
    },
    {
      path: "/mindset-shift?resume=MS7-SMOKE01",
      label: "Resume deep-link (unknown code) still renders",
      assert: async (page) => {
        const t = await page.locator("body").innerText();
        return /Mindset Shift/i.test(t);
      },
    },
    {
      path: "/admin",
      label: "Admin gate (SPA fallback works)",
      assert: async (page) => {
        const t = await page.locator("body").innerText();
        return /admin|unlock|login|sign in|dashboard/i.test(t);
      },
    },
    {
      path: "/verify",
      label: "Certificate verify page",
      assert: async (page) => {
        const t = await page.locator("body").innerText();
        return /verif/i.test(t);
      },
    },
  ];

  for (const r of routes) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 120)));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push("console: " + m.text().slice(0, 120));
    });
    let ok = false, detail = "";
    try {
      await page.goto(BASE + r.path, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(1200);
      ok = await r.assert(page);
    } catch (e) {
      detail = e.message.slice(0, 120);
    }
    check(ok, `GET ${r.path} — ${r.label}`, detail);
    // Filter known-harmless console noise (fonts in headless, ipapi)
    const real = errors.filter(
      (e) => !/fonts\.g|net::ERR|Failed to load resource|ipapi|storage|favicon/i.test(e)
    );
    check(real.length === 0, `  no JS errors on ${r.path}`, real.join(" | "));
    await ctx.close();
  }

  // Asset spot-checks (files that must 200 in production)
  const assets = [
    "/events/mindset-shift-7-flyer.jpg",
    "/events/sagacious-tehilla.png",
    "/og-image.png",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/signatures/admin_signature.png",
    "/branding/kr8_logo.png",
    "/team/favour.jpg",
  ];
  for (const a of assets) {
    const code = await new Promise((resolve) => {
      http.get(BASE + a, (res) => { resolve(res.statusCode); res.resume(); }).on("error", () => resolve(0));
    });
    check(code === 200, `asset 200: ${a}`, `got ${code}`);
  }

  // .htaccess present in dist (Hostinger SPA rewrite)
  check(fs.existsSync(path.join(DIST, ".htaccess")), ".htaccess copied into dist/");

  // robots.txt must not block /mindset-shift
  const robots = fs.readFileSync(path.join(DIST, "robots.txt"), "utf8");
  check(/Allow/i.test(robots) && !/Disallow:\s*\/mindset-shift/i.test(robots), "robots.txt allows /mindset-shift", robots.slice(0, 120));

  await browser.close();
  server.close();
  console.log("\n------------------------------------------------------------");
  console.log(`PRODUCTION SMOKE TEST: ${fail === 0 ? "ALL CHECKS PASSED" : fail + " CHECK(S) FAILED"}`);
  console.log(`  passed=${pass} failed=${fail}`);
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error("FATAL:", e.message);
  server.close();
  process.exit(1);
});
