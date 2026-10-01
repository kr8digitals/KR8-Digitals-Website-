/**
 * MINDSET SHIFT — STEP 14: RESPONSIVE & ACCESSIBILITY
 *
 *  1. No horizontal overflow + core content at mobile 390 / tablet 768 /
 *     laptop 1280 / desktop 1440 (public page AND admin panel).
 *  2. Real mobile registration flow (fill + submit at 390px).
 *  3. Touch targets ≥ 40px on the primary mobile controls.
 *  4. Keyboard: Tab moves focus; focused buttons/links show a visible
 *     outline (the new :focus-visible rule).
 *  5. Form fields all have programmatic labels/aria-labels.
 *  6. Images have alt text; single h1; html lang.
 *  7. Admin sub-tabs usable on mobile.
 *  8. Zero page errors.
 *
 * Run with dev server on :5173.
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:5173";
const FOUNDER_PW = "KR8@Adm!n2026";

const VIEWPORTS = [
  { name: "mobile (390px)", width: 390, height: 844 },
  { name: "tablet (768px)", width: 768, height: 1024 },
  { name: "laptop (1280px)", width: 1280, height: 800 },
  { name: "desktop (1440px)", width: 1440, height: 900 },
];

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

async function seedSession(page) {
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
}

async function unlockAdmin(page) {
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
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const pageErrors = [];

  // ================= 1. Viewport sweep (public page) =================
  console.log("\n[responsive: public page]");
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => pageErrors.push(String(e.message)));
    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1100);
    const m = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
      hero: document.body.innerText.includes("BUILDING WEALTH"),
      speaker: document.body.innerText.includes("Sagacious Tehilla"),
      register: !!document.querySelector("#register"),
    }));
    check(
      m.scrollW <= m.innerW + 1,
      `${vp.name}: no horizontal overflow (scroll ${m.scrollW} / ${m.innerW})`
    );
    check(m.hero && m.speaker && m.register, `${vp.name}: hero, speaker and registration section render`);
    await ctx.close();
  }

  // ================= 2-3. Mobile: real registration flow + touch targets =================
  console.log("\n[mobile: registration flow + touch targets]");
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => pageErrors.push(String(e.message)));
    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    // One question at a time, at 390px
    await page.getByPlaceholder(/Your name/).fill("Mobile Aisha");
    await page.getByRole("button", { name: "Continue" }).first().click();
    await page.waitForTimeout(150);
    check((await page.getByText(/Honest question, Mobile/).count()) === 1,
      "personalised step renders on mobile");
    const firstChoice = page.getByRole("button", { name: /I'm just curious/ }).first();
    const choiceBox = await firstChoice.boundingBox();
    check(choiceBox && choiceBox.height >= 40, `choice button touch target ≥ 40px (got ${choiceBox ? Math.round(choiceBox.height) : "none"}px)`);
    await firstChoice.click();
    await page.waitForTimeout(150);
    await page.getByRole("button", { name: "I'd rather not say" }).click();
    await page.waitForTimeout(150);
    await page.getByPlaceholder(/My money never lasts/).fill("Keeping consistent savings.");
    await page.getByRole("button", { name: "Continue" }).first().click();
    await page.waitForTimeout(150);
    await page.getByRole("button", { name: "Not yet" }).click();
    await page.waitForTimeout(150);
    await page.getByRole("button", { name: "Continue" }).first().click();
    await page.waitForTimeout(150);
    await page.getByRole("button", { name: "Skip for now" }).click();
    await page.waitForTimeout(150);
    await page.getByLabel("Email *").fill("mobile@example.com");
    await page.getByLabel("Phone number").fill("8091234567");
    await page.getByLabel("How did you find this? *").selectOption("WhatsApp");
    await page.getByRole("button", { name: "Continue" }).first().click();
    await page.waitForTimeout(150);
    await page.getByRole("button", { name: "Save My Seat" }).click();
    await page.waitForTimeout(1200);
    check(
      (await page.getByText("You're in, Mobile.", { exact: false }).count()) === 1,
      "mobile end-to-end onboarding succeeds"
    );
    const copyBtn = page.locator("button[aria-label^='Copy confirmation code']");
    const cb = await copyBtn.first().boundingBox().catch(() => null);
    check(cb && cb.height >= 40, `copy-code touch target ≥ 40px (got ${cb ? Math.round(cb.height) : "none"}px)`);
    const m = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
    }));
    check(m.scrollW <= m.innerW + 1, "mobile: no horizontal overflow after registration");
    await ctx.close();
  }

  // ================= 4. Keyboard focus visibility =================
  console.log("\n[a11y: keyboard focus]");
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => pageErrors.push(String(e.message)));
    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(900);

    // Tab until a BUTTON or A is focused, then verify a visible outline
    let focusInfo = null;
    for (let i = 0; i < 25 && !focusInfo; i++) {
      await page.keyboard.press("Tab");
      focusInfo = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        if (!["BUTTON", "A"].includes(el.tagName)) return null;
        const cs = getComputedStyle(el);
        return {
          tag: el.tagName,
          text: (el.innerText || "").slice(0, 30),
          outlineStyle: cs.outlineStyle,
          outlineWidth: cs.outlineWidth,
        };
      });
    }
    check(!!focusInfo, "keyboard: Tab reaches interactive elements");
    check(
      !!focusInfo && focusInfo.outlineStyle === "solid" && parseFloat(focusInfo.outlineWidth) >= 1,
      `focused ${focusInfo ? focusInfo.tag : "?"} shows a visible outline (got ${focusInfo ? focusInfo.outlineStyle + " " + focusInfo.outlineWidth : "none"})`
    );

    // Inputs: focus via keyboard reaches the name field eventually and
    // typing lands in the focused field.
    await page.keyboard.press("Escape");
    let reachedName = false;
    for (let i = 0; i < 40 && !reachedName; i++) {
      await page.keyboard.press("Tab");
      const label = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute("aria-label"));
      if (label === "Your name") reachedName = true;
    }
    check(reachedName, "keyboard: the name field is reachable by Tab");
    await page.keyboard.type("Key User");
    const nameVal = await page.getByLabel("Your name").inputValue();
    check(nameVal === "Key User", "keyboard: typed input lands in the focused field");
    await ctx.close();
  }

  // ================= 5-6. Labels, alt text, headings, lang =================
  console.log("\n[a11y: labels, alt, headings]");
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => pageErrors.push(String(e.message)));
    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    const a11y = await page.evaluate(() => {
      const controls = Array.from(document.querySelectorAll("#register input, #register select, #register textarea"));
      const unlabeled = controls.filter((c) => {
        if (c.getAttribute("aria-label") || c.getAttribute("aria-labelledby")) return false;
        const id = c.id;
        if (id && document.querySelector(`label[for="${id}"]`)) return false;
        const labelEl = c.closest("label");
        if (labelEl) return false;
        return true;
      }).map((c) => (c.id || c.placeholder || c.tagName).toLowerCase());
      const imgsNoAlt = Array.from(document.querySelectorAll("img")).filter((i) => !i.hasAttribute("alt")).length;
      const h1 = document.querySelectorAll("h1").length;
      const lang = document.documentElement.lang;
      return { unlabeled, imgsNoAlt, h1, lang, total: controls.length };
    });
    check(
      a11y.unlabeled.length === 0,
      `all ${a11y.total} form controls have programmatic labels${a11y.unlabeled.length ? " — missing: " + a11y.unlabeled.join(", ") : ""}`
    );
    check(a11y.imgsNoAlt === 0, `every <img> has an alt attribute (${a11y.imgsNoAlt} missing)`);
    check(a11y.h1 === 1, `exactly one h1 (got ${a11y.h1})`);
    check(a11y.lang === "en", `html lang set (got "${a11y.lang}")`);
    await ctx.close();
  }

  // ================= 7. Admin on mobile =================
  console.log("\n[responsive: admin panel on mobile]");
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => pageErrors.push(String(e.message)));
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await seedSession(page);
    await page.goto(BASE + "/admin", { waitUntil: "domcontentloaded" });
    await unlockAdmin(page);
    // Mobile admin uses the hamburger drawer (sidebar is lg+ only)
    await page.getByTitle("Toggle Menu").click();
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: /Mindset Shift/ }).first().click();
    await page.waitForTimeout(600);
    for (const sub of ["Participants", "Event settings", "Analytics"]) {
      await page.getByRole("button", { name: sub, exact: true }).click();
      await page.waitForTimeout(500);
      const m = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
      }));
      check(
        m.scrollW <= m.innerW + 1,
        `admin "${sub}" usable on mobile without horizontal overflow (scroll ${m.scrollW} / ${m.innerW})`
      );
    }
    // Event settings is interactive on mobile: open Basics and type
    await page.getByRole("button", { name: "Event settings", exact: true }).click();
    await page.waitForTimeout(400);
    const basicsSummary = page.locator("summary", { hasText: "Basics & schedule" }).first();
    if (await basicsSummary.evaluate((el) => !el.closest("details").open)) await basicsSummary.click();
    const edition = page.locator('details:has(summary:has-text("Basics & schedule")) input').nth(0);
    await edition.fill("7.1"); // a real change → dirty state
    const saveBtn = page.getByRole("button", { name: /Save changes/ });
    await saveBtn.waitFor({ timeout: 5000 });
    const sb = await saveBtn.boundingBox();
    check(sb && sb.height >= 36, `admin save button usable on mobile (got ${sb ? Math.round(sb.height) : "none"}px)`);
    await saveBtn.click();
    await page.waitForTimeout(700);
    check(
      (await page.getByText(/saved/i).count()) >= 1,
      "admin save completes on mobile"
    );
    await ctx.close();
  }

  // ================= 8. Page errors =================
  console.log("\n[page errors]");
  const real = pageErrors.filter((m) => !/ipapi|ERR_FAILED|net::|404|supabase/i.test(m));
  check(real.length === 0, `no unexpected page errors (${real.length})`);
  if (real.length) console.log("  errors:", real.slice(0, 3));

  console.log("\n------------------------------------------------------------");
  console.log(
    fail === 0
      ? "MINDSET SHIFT RESPONSIVE & A11Y: ALL CHECKS PASSED"
      : `MINDSET SHIFT RESPONSIVE & A11Y: ${fail} CHECK(S) FAILED`
  );
  console.log(`  passed=${pass} failed=${fail}`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
