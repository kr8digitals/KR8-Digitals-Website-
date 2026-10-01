/**
 * MINDSET SHIFT — STEP 15: SEO & SOCIAL
 *
 *  1. /mindset-shift: title, description, canonical, og:type=event,
 *     og:image + twitter:image = the flyer, Event JSON-LD.
 *  2. Admin edits SEO title/description/start date → public head
 *     updates live (single source of truth).
 *  3. Admin-uploaded (idb:) flyer → social image falls back to the
 *     site OG image (an IndexedDB key is not a shareable URL).
 *  4. SPA navigation away resets og:type/og:image to site defaults.
 *  5. /admin stays noindexed.
 *  6. Zero page errors.
 *
 * Run with dev server on :5173.
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:5173";
const FOUNDER_PW = "KR8@Adm!n2026";

let pass = 0;
let fail = 0;
function check(cond, label) {
  if (cond) {
    pass++;
    console.log(`  ✓ ${label}`);
  } else {
    fail++;
    console.log(`  ✗ ${label}`);
  }
}

function meta(page, attr, key) {
  return page.evaluate(
    ([a, k]) => {
      const el = document.head.querySelector(`meta[${a}="${k}"]`);
      return el ? el.getAttribute("content") : null;
    },
    [attr, key]
  );
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e.message)));

  // ================= 1. Default head on /mindset-shift =================
  console.log("\n[seo: public page head]");
  await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1100);

  const title = await page.title();
  check(title.includes("Mindset Shift 7.0"), `title is the event SEO title (got "${title}")`);
  const desc = await meta(page, "name", "description");
  check(
    !!desc && desc.includes("You're not bad with money"),
    "meta description is the event SEO description (new reframe copy)"
  );
  const canonical = await page.evaluate(
    () => document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")
  );
  check(canonical === "https://kr8digitals.com/mindset-shift", `canonical is the event URL (got ${canonical})`);
  check((await meta(page, "property", "og:type")) === "event", "og:type = event");
  check(
    (await meta(page, "property", "og:title"))?.includes("Mindset Shift 7.0"),
    "og:title set"
  );
  check(
    (await meta(page, "property", "og:description"))?.includes("You're not bad with money"),
    "og:description set"
  );
  const ogImage = await meta(page, "property", "og:image");
  check(
    ogImage === "https://kr8digitals.com/events/mindset-shift-7-flyer.jpg",
    `og:image is the flyer (got ${ogImage})`
  );
  check(
    (await meta(page, "name", "twitter:image")) === ogImage,
    "twitter:image matches og:image"
  );

  // Event JSON-LD
  const jsonld = await page.evaluate(() => {
    const el = document.getElementById("kr8-route-jsonld");
    return el ? JSON.parse(el.textContent) : null;
  });
  check(!!jsonld && jsonld["@type"] === "Event", "route JSON-LD is a schema.org Event");
  check(
    !!jsonld && jsonld.name?.includes("Mindset Shift 7.0") && jsonld.name?.includes("BUILDING WEALTH"),
    "Event name = program + edition + theme"
  );
  check(
    !!jsonld && jsonld.startDate === "2026-10-04T21:00:00+01:00",
    "Event startDate from the admin-managed field"
  );
  check(!!jsonld && jsonld.isAccessibleForFree === true, "Event marked free (registrationFree)");
  check(
    !!jsonld && jsonld.location?.["@type"] === "VirtualLocation" && !!jsonld.location.url,
    "Event location = the online URL"
  );
  check(
    !!jsonld && jsonld.performer?.name === "Sagacious Tehilla",
    "Event performer = the speaker"
  );
  check(
    !!jsonld && jsonld.organizer?.name === "KR8 Digitals",
    "Event organizer = KR8 Digitals"
  );

  // ================= 2. Admin edits → live head update =================
  console.log("\n[seo: admin edits propagate]");
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.evaluate((pw) => {
    const founder = {
      type: "founder",
      id: "KR8-FOUNDER-TIMFIRE",
      name: "Kenneth Timothy Iziogo (Timfire)",
      email: "kr8digitals01@gmail.com",
      phone: "+2348125687509",
      admin: { role: "ultimate", permissions: ["all"], adminPassword: pw },
    };
    localStorage.setItem("kr8_current", JSON.stringify(founder));
  }, FOUNDER_PW);
  await page.goto(BASE + "/admin", { waitUntil: "domcontentloaded" });
  const unlockBtn = page.getByRole("button", { name: /unlock dashboard/i });
  try {
    await unlockBtn.first().waitFor({ timeout: 8000 });
    await unlockBtn.first().click();
    await page.waitForTimeout(400);
    const admPw = page.locator("input[type=password]");
    if (await admPw.count() > 0) {
      await admPw.last().fill(FOUNDER_PW);
      await unlockBtn.last().click();
    }
  } catch {
    /* already unlocked */
  }
  await page.getByRole("button", { name: /Mindset Shift/ }).first().click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Event settings" }).click();
  await page.waitForTimeout(500);
  await page.locator("summary", { hasText: "Privacy note & SEO" }).first().click();
  await page.waitForTimeout(300);

  const seoSection = page.locator('details:has(summary:has-text("Privacy note & SEO"))');
  const seoTitleInput = seoSection.locator("input").nth(0); // SEO title
  await seoTitleInput.fill("Mindset Shift 7.0 — SEO TEST TITLE");
  const seoDescInput = seoSection.locator("textarea").nth(1); // SEO description
  await seoDescInput.fill("SEO TEST DESCRIPTION with BUILDING WEALTH.");
  const startDateInput = seoSection.locator("input").nth(1); // start date
  await startDateInput.fill("2026-10-04T20:00:00+01:00");
  await page.getByRole("button", { name: /Save changes/ }).click();
  await page.waitForTimeout(700);

  await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  check(
    (await page.title()).includes("SEO TEST TITLE"),
    "edited SEO title appears as the page <title>"
  );
  check(
    (await meta(page, "property", "og:description"))?.includes("SEO TEST DESCRIPTION"),
    "edited description appears in og:description"
  );
  const jsonld2 = await page.evaluate(() => {
    const el = document.getElementById("kr8-route-jsonld");
    return el ? JSON.parse(el.textContent) : null;
  });
  check(
    jsonld2?.startDate === "2026-10-04T20:00:00+01:00",
    "edited start date appears in the Event JSON-LD"
  );

  // ================= 3. idb: flyer → OG fallback =================
  console.log("\n[seo: social image fallback]");
  await page.evaluate(() => {
    const ev = JSON.parse(localStorage.getItem("kr8_mindset_shift_event_v1") || "{}");
    ev.flyer = "idb:img-admin-upload";
    localStorage.setItem("kr8_mindset_shift_event_v1", JSON.stringify(ev));
    window.dispatchEvent(new Event("kr8:ms-event-updated"));
  });
  await page.waitForTimeout(800);
  const ogImage2 = await meta(page, "property", "og:image");
  check(
    ogImage2 === "https://kr8digitals.com/og-image.png",
    `idb: flyer falls back to the site OG image (got ${ogImage2})`
  );

  // ================= 4. Navigation resets social tags =================
  console.log("\n[seo: SPA navigation resets]");
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);
  check(
    (await meta(page, "property", "og:type")) === "website",
    "home resets og:type to website"
  );
  check(
    (await meta(page, "property", "og:image")) === "https://kr8digitals.com/og-image.png",
    "home resets og:image to the site image"
  );

  // ================= 5. /admin noindexed =================
  console.log("\n[seo: admin noindex]");
  await page.goto(BASE + "/admin", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  check(
    (await meta(page, "name", "robots")) === "noindex, nofollow",
    "/admin emits noindex, nofollow"
  );

  // ================= 6. Page errors =================
  console.log("\n[page errors]");
  const real = pageErrors.filter((m) => !/ipapi|ERR_FAILED|net::|404|supabase/i.test(m));
  check(real.length === 0, `no unexpected page errors (${real.length})`);
  if (real.length) console.log("  errors:", real.slice(0, 3));

  console.log("\n------------------------------------------------------------");
  console.log(
    fail === 0 ? "MINDSET SHIFT SEO & SOCIAL: ALL CHECKS PASSED" : `MINDSET SHIFT SEO & SOCIAL: ${fail} CHECK(S) FAILED`
  );
  console.log(`  passed=${pass} failed=${fail}`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
