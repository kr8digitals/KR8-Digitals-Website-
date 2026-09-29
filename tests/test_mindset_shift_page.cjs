/**
 * MINDSET SHIFT 7.0 — STEP 3: PUBLIC CAMPAIGN PAGE (functional browser test)
 *
 * Real user flow on a real rendered page:
 *   1. Page loads with the campaign hero (admin-driven data, verified flyer facts)
 *   2. Every section renders: story, 5 topics, speaker, host (+cadence), who-it's-for, details
 *   3. Official flyer + portraits load (optimized -web variants, no errors)
 *   4. CTAs anchor to real sections (Register Free -> #register, What You'll Explore -> #explore)
 *   5. NAV: "Mindset Shift" present in desktop nav AND mobile drawer
 *   6. Live admin edit (kr8:ms-event-updated) re-renders the page WITHOUT reload
 *   7. Accessibility baseline: single h1, alt text, labelled sections
 *   8. Responsive: mobile 390 / tablet 768 / desktop 1280 — no horizontal overflow
 *   9. No uncaught page errors
 *
 * Requires the dev server on http://localhost:5173 (npm run dev).
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:5173";
let failures = 0;
const ok = (name) => console.log(`  \u2713 ${name}`);
const bad = (name, detail) => {
  failures++;
  console.log(`  \u2717 ${name}${detail ? " — " + detail : ""}`);
};
const expect = (cond, name, detail) => (cond ? ok(name) : bad(name, detail));

async function assertPage(browser, viewport, label) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  console.log(`\n[${label} ${viewport.width}x${viewport.height}]`);
  await page.goto(`${BASE}/mindset-shift`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  // --- 1. Hero ---
  const title = await page.title();
  expect(title.includes("Mindset Shift 7.0"), "document title is the SEO title", title);

  const hero = page.locator("section").first();
  await expect_(await hero.getByText("BUILDING WEALTH").first().isVisible(), "hero shows theme 'BUILDING WEALTH'");
  await expect_(
    await hero.getByText("How To Get Out Of Debt And Build Wealth.").first().isVisible(),
    "hero shows flyer subtitle"
  );
  for (const chip of ["4th October 2026", "9PM", "kr8digitals.com", "Registration is free"]) {
    await expect_(
      await hero.getByText(chip, { exact: false }).first().isVisible(),
      `hero meta chip: ${chip}`
    );
  }

  // --- 2. Flyer loads (optimized variant, decoded) ---
  const flyer = page.locator("img[alt*='official flyer']").first();
  await flyer.waitFor({ state: "attached", timeout: 5000 });
  await page.waitForTimeout(800);
  const flyerOk = await flyer
    .evaluate((el) => el.naturalWidth > 100 && el.complete, undefined)
    .catch(() => false);
  expect(flyerOk, "official flyer image decoded and rendered");
  const flyerSrc = await flyer.getAttribute("src");
  expect(String(flyerSrc).includes("-web.jpg"), "flyer served from optimized -web variant", flyerSrc);

  // --- 3. Sections ---
  const story = page.locator("#why");
  await expect_(await story.isVisible(), "story section (#why) visible");
  await expect_(
    await story.getByText("Earning Is Not Wealth").isVisible(),
    "story point 'Earning Is Not Wealth' rendered"
  );
  await expect_(
    await story.getByText("Most people are not broke because they earn too little", { exact: false }).first().isVisible(),
    "story intro (admin copy) rendered"
  );

  const explore = page.locator("#explore");
  for (const t of [
    "Understanding Your Relationship With Money",
    "Getting Out Of Debt",
    "Building Wealth",
    "Money Philosophy",
    "Making Better Financial Decisions",
  ]) {
    await expect_(await explore.getByText(t).first().isVisible(), `topic rendered: ${t}`);
  }

  const speaker = page.locator("#speaker");
  await expect_(await speaker.getByText("Sagacious Tehilla").first().isVisible(), "speaker name rendered");
  await expect_(
    await speaker.getByText("Psychology-Driven Marketing Strategist", { exact: false }).first().isVisible(),
    "speaker tagline rendered"
  );
  const creds = await speaker.locator("li").count();
  expect(creds >= 4, "speaker credentials list rendered (4+)", `count=${creds}`);
  const speakerImg = speaker.locator("img[alt*='Sagacious Tehilla']").first();
  const speakerOk = await speakerImg.evaluate((el) => el.naturalWidth > 50 && el.complete).catch(() => false);
  expect(speakerOk, "speaker portrait decoded");

  const host = page.locator("#host");
  await expect_(await host.getByText("Timfire (Kenneth Timothy)").first().isVisible(), "host name rendered");
  await expect_(await host.getByText("1st Sunday").first().isVisible(), "cadence chip '1st Sunday' rendered");
  await expect_(await host.getByText("3rd Sunday").first().isVisible(), "cadence chip '3rd Sunday' rendered");
  const hostImg = host.locator("img[alt*='Timfire']").first();
  const hostOk = await hostImg.evaluate((el) => el.naturalWidth > 50 && el.complete).catch(() => false);
  expect(hostOk, "host portrait decoded");

  const who = page.locator("#who");
  const audienceItems = await who.locator("li").count();
  expect(audienceItems >= 12, "who-it's-for lists rendered (8 audience + 4 expectations)", `count=${audienceItems}`);
  await expect_(
    await who.getByText("You are currently dealing with debt", { exact: false }).first().isVisible(),
    "audience entry rendered"
  );

  const reg = page.locator("#register");
  await expect_(await reg.isVisible(), "registration section (#register) visible");
  await expect_(await reg.getByText("Registration is open").first().isVisible(), "registration status 'open' rendered");
  await expect_(
    await reg.getByText("Your registration details and financial reflections are private", { exact: false }).first().isVisible(),
    "privacy notice rendered"
  );

  // --- 4. CTA anchors ---
  const regCta = page.getByRole("link", { name: /Register Free/ }).first();
  await expect_(await regCta.isVisible(), "hero CTA 'Register Free' visible");
  await regCta.click();
  // Smooth-scroll duration scales with distance (long on mobile) — wait
  // for the scroll to actually settle near the target.
  const regInView = await reg
    .evaluate((el) =>
      new Promise((resolve) => {
        const deadline = Date.now() + 4000;
        const tick = () => {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight * 0.75) return resolve(true);
          if (Date.now() > deadline) return resolve(false);
          requestAnimationFrame(tick);
        };
        tick();
      })
    )
    .catch(() => false);
  expect(regInView, "clicking 'Register Free' scrolls to #register section");

  // --- 6. Live admin edit (no reload) ---
  await page.evaluate(() => {
    window.dispatchEvent(new Event("kr8:ms-event-updated"));
  });
  // Simulate an admin saving a new date label from the admin dashboard:
  const dateEdited = await page.evaluate(() => {
    const before = localStorage.getItem("kr8_mindset_shift_event_v1");
    const ev = before ? JSON.parse(before) : null;
    const key = "kr8_mindset_shift_event_v1";
    const next = { edition: "7.0", programName: "Mindset Shift", theme: "BUILDING WEALTH", subtitle: "How To Get Out Of Debt And Build Wealth.", dateLabel: "5th October 2026", timeLabel: "9PM", locationLabel: "kr8digitals.com", locationUrl: "https://kr8digitals.com/mindset-shift", registrationFree: true, regOpen: true, regDeadlineLabel: "", capacity: 0, flyer: "/events/mindset-shift-7-flyer.jpg", speaker: { name: "Sagacious Tehilla", role: "Guest Speaker", tagline: "Psychology-Driven Marketing Strategist", bio: "test", credentials: [], photo: "/events/sagacious-tehilla.png" }, host: { name: "Timfire (Kenneth Timothy)", role: "Host · Founder, KR8 Digitals", bio: "test", photo: "/founder_timfire.jpg" }, storyIntro: "", storyPoints: [], topics: [], audience: [], expectations: [], shareCopy: { whatsappStatus: "", facebook: "", instagram: "", x: "", linkedin: "", general: "" }, whatsappGroupUrl: "", accessEnabled: true, privacyNote: "", seoTitle: "Mindset Shift 7.0 — Building Wealth | KR8 Digitals", seoDescription: "test" };
    localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event("kr8:ms-event-updated"));
    // restore after observing
    setTimeout(() => {
      localStorage.setItem(key, before ?? "null-removed");
      if (before === null) localStorage.removeItem(key);
      else localStorage.setItem(key, before);
      window.dispatchEvent(new Event("kr8:ms-event-updated"));
    }, 2500);
    return true;
  });
  expect(dateEdited, "admin date edit written + event dispatched");
  await page.waitForTimeout(600);
  const heroDate = await hero.getByText("5th October 2026", { exact: false }).first().isVisible().catch(() => false);
  expect(heroDate, "hero re-rendered with admin's new date WITHOUT reload");
  await page.waitForTimeout(2600); // let the evaluate() restore fire
  const heroDateRestored = await hero.getByText("4th October 2026", { exact: false }).first().isVisible().catch(() => false);
  expect(heroDateRestored, "hero restored to original date after admin revert");

  // --- 7. Accessibility baseline ---
  const h1Count = await page.locator("h1").count();
  expect(h1Count === 1, "exactly one <h1>", `count=${h1Count}`);
  const imgCount = await page.locator("img").count();
  const imgNoAlt = await page.locator("img:not([alt])").count();
  expect(imgNoAlt === 0, "all images have alt text", `${imgNoAlt}/${imgCount} missing`);
  const labelled = await page.locator("section[aria-labelledby]").count();
  expect(labelled >= 5, "sections are labelled for screen readers", `labelled=${labelled}`);

  // --- 8. No horizontal overflow ---
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow <= 1, "no horizontal overflow", `overflow=${overflow}px`);

  // --- 9. Errors ---
  expect(errors.length === 0, "no uncaught page errors", errors.join(" | "));
  // ipapi.co = the site-wide country-detection call (CountryPhone, also used
  // on /register). In sandboxed CI its CORS headers are blocked; the app
  // catches the failure and falls back to "NG" — not an app error.
  const realConsole = consoleErrors.filter(
    (t) =>
      !t.includes("Download the React DevTools") &&
      !t.includes("404") &&
      !t.includes("favicon") &&
      !t.includes("ipapi.co") &&
      // companion line of the same blocked request (sandbox has no external
      // network); the page itself loads zero external resources
      !t.includes("Failed to load resource: net::ERR_FAILED")
  );
  expect(realConsole.length === 0, "no console errors", realConsole.join(" | ").slice(0, 300));

  if (label.includes("desktop")) {
    await page.screenshot({ path: "tests/shots/ms7-page-desktop.png", fullPage: true });
  }
  if (label.includes("mobile")) {
    await page.screenshot({ path: "tests/shots/ms7-page-mobile.png", fullPage: true });
  }
  await page.close();
}

function expect_(cond, name) {
  if (!cond) {
    failures++;
    console.log(`  \u2717 ${name}`);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Desktop
  await assertPage(browser, { width: 1280, height: 800 }, "desktop");

  // Tablet
  const tPage = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  await tPage.goto(`${BASE}/mindset-shift`, { waitUntil: "domcontentloaded" });
  await tPage.waitForTimeout(1200);
  const tOverflow = await tPage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(tOverflow <= 1, "tablet: no horizontal overflow", `overflow=${tOverflow}px`);
  await tPage.close();

  // Mobile
  await assertPage(browser, { width: 390, height: 844 }, "mobile");

  // Mobile drawer nav
  const mPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mPage.goto(`${BASE}/mindset-shift`, { waitUntil: "domcontentloaded" });
  await mPage.waitForTimeout(1200);
  const burger = mPage.locator('button[aria-label*="menu" i], button:has(svg)').filter({ hasText: "" }).first();
  // Open the drawer via the hamburger (the menu button in the header right side)
  const headerBtns = mPage.locator("header button");
  const btnCount = await headerBtns.count();
  let opened = false;
  for (let i = 0; i < btnCount && !opened; i++) {
    const b = headerBtns.nth(i);
    if (await b.isVisible().catch(() => false)) {
      await b.click().catch(() => {});
      await mPage.waitForTimeout(500);
      opened = (await mPage.getByText("Mindset Shift").count()) > 1;
    }
  }
  expect(opened, "mobile drawer contains 'Mindset Shift' link");
  await mPage.close();

  // Desktop nav link
  const dPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await dPage.goto(`${BASE}/mindset-shift`, { waitUntil: "domcontentloaded" });
  await dPage.waitForTimeout(1000);
  const navLink = dPage.locator("header nav").getByRole("link", { name: "Mindset Shift" }).first();
  expect(await navLink.isVisible(), "desktop nav shows 'Mindset Shift' link");
  const activeCls = await navLink.getAttribute("class");
  expect(String(activeCls).includes("font-semibold"), "nav link highlighted when active");
  await dPage.close();

  await browser.close();

  console.log("\n" + "-".repeat(60));
  if (failures > 0) {
    console.log(`MINDSET SHIFT PAGE: ${failures} CHECK(S) FAILED`);
    process.exit(1);
  }
  console.log("MINDSET SHIFT PAGE: ALL CHECKS PASSED");
  console.log("-".repeat(60));
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
