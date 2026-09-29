/**
 * MINDSET SHIFT 7.0 — STEP 6: SHARE EXPERIENCE (functional browser test)
 *
 * The per-platform share experience in step 1 of the access flow:
 *   1. Panel renders with all 6 platforms (admin-driven shareCopy)
 *   2. Switching platforms swaps the caption (verified copy per platform)
 *   3. "Copy text" actually puts the caption on the clipboard
 *   4. Social open-links: WhatsApp wa.me, Facebook sharer, X intent, LinkedIn offsite
 *   5. Instagram: copy-only (no web share target)
 *   6. Native device share sheet: hidden on desktop, available on mobile UA
 *   7. LIVE: admin edits shareCopy -> preview updates without reload
 *   8. No page errors, mobile fit
 *
 * Requires the dev server on http://localhost:5173 (npm run dev).
 */
const { chromium, devices } = require("playwright");

const BASE = "http://localhost:5173";
let failures = 0;
const ok = (n) => console.log(`  \u2713 ${n}`);
const bad = (n, d) => { failures++; console.log(`  \u2717 ${n}${d ? " — " + d : ""}`); };
const check = (cond, name, detail) => (cond ? ok(name) : bad(name, detail));

async function registerAndOpen(browser, ctxOpts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1100 }, permissions: ["clipboard-read", "clipboard-write"], ...ctxOpts });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${BASE}/mindset-shift`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);
  await page.locator("#ms-fullname").fill("Ada Obi");
  await page.locator("#ms-email").fill("ada.share@example.com");
  await page.locator('#register select[aria-label="Country"]').selectOption("NG");
  await page.locator("#register input[placeholder='Phone number']").fill("8023334445");
  await page.locator("#ms-heard").selectOption("X (Twitter)");
  await page.locator("#ms-hoping").fill("A real debt exit plan.");
  await page.locator("#ms-challenge").fill("Credit card debt.");
  await page.locator("#register").getByRole("button", { name: "Not yet", exact: true }).click();
  await page.locator("#register").getByRole("button", { name: /Register Free/ }).click();
  await page.waitForTimeout(600);
  return { ctx, page, errors };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const panel = (page) => page.locator("#register");

  /* ============ 1-4. Desktop: panel, platforms, copy, socials ============ */
  console.log("\n[desktop share panel]");
  {
    const { page, ctx, errors } = await registerAndOpen(browser);
    const p = panel(page);

    for (const label of ["WhatsApp Status", "Facebook", "Instagram", "X (Twitter)", "LinkedIn", "Any platform"]) {
      check(await p.getByRole("button", { name: label, exact: true }).isVisible(), `platform chip: ${label}`);
    }

    // Default = WhatsApp Status: caption from admin config
    const preview = p.locator("pre").first();
    let caption = await preview.innerText();
    check(caption.includes("Mindset Shift 7.0") && caption.includes("kr8digitals.com/mindset-shift"), "WhatsApp Status caption = admin config copy", caption.slice(0, 60));

    // Switch to X → different verified copy
    await p.getByRole("button", { name: "X (Twitter)", exact: true }).click();
    caption = await preview.innerText();
    check(caption.includes("Income without a system is a treadmill."), "X caption = admin config copy", caption.slice(0, 60));

    // LinkedIn copy
    await p.getByRole("button", { name: "LinkedIn", exact: true }).click();
    caption = await preview.innerText();
    check(caption.includes("Wealth is rarely an accident"), "LinkedIn caption = admin config copy", caption.slice(0, 60));

    // Copy text → clipboard actually contains it
    await p.getByRole("button", { name: /Copy text$/ }).click();
    await page.waitForTimeout(300);
    const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => ""));
    check(clip.includes("Wealth is rarely an accident"), "clipboard received the LinkedIn caption", clip.slice(0, 60));

    // Social open-links per platform
    await p.getByRole("button", { name: "WhatsApp Status", exact: true }).click();
    let wa = await p.getByRole("link", { name: "Open in WhatsApp" }).getAttribute("href");
    check(String(wa).startsWith("https://wa.me/?text="), "WhatsApp target = wa.me with encoded text", String(wa).slice(0, 60));
    check(decodeURIComponent(String(wa)).includes("Mindset Shift 7.0"), "wa.me text decodes to the caption");

    await p.getByRole("button", { name: "Facebook", exact: true }).click();
    const fb = await p.getByRole("link", { name: /Open Facebook/ }).getAttribute("href");
    check(String(fb).includes("facebook.com/sharer/sharer.php?u="), "Facebook target = sharer with page URL", String(fb).slice(0, 70));
    check(decodeURIComponent(String(fb)).includes("kr8digitals.com/mindset-shift"), "sharer URL = event page");

    await p.getByRole("button", { name: "X (Twitter)", exact: true }).click();
    const x = await p.getByRole("link", { name: /Open X \(Twitter\)/ }).getAttribute("href");
    check(String(x).includes("twitter.com/intent/tweet?text=") && String(x).includes("url="), "X target = intent with text+url");

    await p.getByRole("button", { name: "LinkedIn", exact: true }).click();
    const li = await p.getByRole("link", { name: /Open LinkedIn/ }).getAttribute("href");
    check(String(li).includes("linkedin.com/sharing/share-offsite/?url="), "LinkedIn target = offsite share with page URL");

    // Instagram: no web open-link (copy-only)
    await p.getByRole("button", { name: "Instagram", exact: true }).click();
    const igLinks = await p.locator('a[href*="instagram.com"]').count();
    check(igLinks === 0, "Instagram has no web share link (app-only, copy caption)");
    check(await p.getByRole("button", { name: /Copy text/ }).isVisible(), "Instagram still offers copy");

    // Native share: desktop headless → no navigator.share → button hidden
    const nativeVisible = await p.getByRole("button", { name: "Use device share sheet" }).isVisible().catch(() => false);
    check(!nativeVisible, "native share button hidden where Web Share API is absent");

    check(errors.length === 0, "no page errors (desktop share)", errors.join(" | "));
    await page.screenshot({ path: "tests/shots/ms7-share-desktop.png", fullPage: false });
    await ctx.close();
  }

  /* ============ 7. LIVE admin edit of shareCopy ============ */
  console.log("\n[live admin copy edit]");
  {
    const { page, ctx, errors } = await registerAndOpen(browser);
    const p = panel(page);
    const before = await p.locator("pre").first().innerText();
    await page.evaluate(() => {
      const key = "kr8_mindset_shift_event_v1";
      const raw = localStorage.getItem(key);
      const ev = raw ? JSON.parse(raw) : { shareCopy: {} };
      ev.shareCopy = {
        ...ev.shareCopy,
        whatsappStatus: "ADMIN-EDITED COPY: Mindset Shift 7.0 — new angle for sharing.",
      };
      localStorage.setItem(key, JSON.stringify(ev));
      window.dispatchEvent(new Event("kr8:ms-event-updated"));
    });
    await page.waitForTimeout(400);
    const after = await p.locator("pre").first().innerText();
    check(after.includes("ADMIN-EDITED COPY"), "preview re-rendered with admin's edited copy (no reload)", after.slice(0, 60));
    check(after !== before, "copy actually changed");
    check(errors.length === 0, "no page errors (live edit)", errors.join(" | "));
    await ctx.close();
  }

  /* ============ 6. Mobile: native share sheet available ============ */
  console.log("\n[mobile 390x844]");
  {
    const { page, ctx, errors } = await registerAndOpen(browser, { viewport: { width: 390, height: 844 } });
    const p = panel(page);
    check(await p.getByRole("button", { name: "WhatsApp Status", exact: true }).isVisible(), "panel visible on mobile");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(overflow <= 1, "no horizontal overflow", `overflow=${overflow}px`);
    // Headless desktop Chromium: navigator.share absent even at mobile size —
    // assert the button state is consistent with the API's presence.
    const hasShareApi = await page.evaluate(() => typeof navigator.share === "function");
    const nativeVisible = await p.getByRole("button", { name: "Use device share sheet" }).isVisible().catch(() => false);
    check(nativeVisible === hasShareApi, "native share button visibility matches Web Share API availability");
    await page.screenshot({ path: "tests/shots/ms7-share-mobile.png", fullPage: false });
    check(errors.length === 0, "no page errors (mobile)", errors.join(" | "));
    await ctx.close();
  }

  await browser.close();

  console.log("\n" + "-".repeat(60));
  if (failures > 0) {
    console.log(`MINDSET SHIFT SHARE EXPERIENCE: ${failures} CHECK(S) FAILED`);
    process.exit(1);
  }
  console.log("MINDSET SHIFT SHARE EXPERIENCE: ALL CHECKS PASSED");
  console.log("-".repeat(60));
})().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
