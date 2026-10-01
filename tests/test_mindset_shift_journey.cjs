/**
 * MINDSET SHIFT 7.0 — FULL JOURNEY E2E (desktop + mobile, v2)
 *
 * The complete real-user loop, on BOTH desktop (1440) and mobile (390):
 *   1. Adaptive onboarding (one honest question at a time) →
 *      "You're in, Journey." + confirmation code
 *   2. Access is LIVE immediately — no admin step, no share gate.
 *      The group link (href + target) is already there.
 *   3. The optional share moment (master copy) is present below the link.
 *   4. Admin revokes → the link disappears, the participant sees the
 *      paused state with a restore path.
 *
 * Existing-site regression is covered separately by
 * test_critical_fixes.cjs + test_full_regression.cjs.
 *
 * Run with dev server on :5173.
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:5173";
const FOUNDER_PW = "KR8@Adm!n2026";
const GROUP_URL = "https://chat.whatsapp.com/STEP16-JOURNEY-GROUP";

let pass = 0;
let fail = 0;
function check(cond, label, detail) {
  if (cond) {
    pass++;
    console.log(`  ✓ ${label}`);
  } else {
    fail++;
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function onboardWizard(page) {
  // curious branch = the shortest honest path (no branch follow-up)
  await page.getByPlaceholder(/Your name/).fill("Journey Jola");
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "I'm just curious (I might be braver than I look)" }).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "It's heavy — and I don't talk about it" }).click();
  await page.waitForTimeout(150);
  await page.getByPlaceholder(/My money never lasts/).fill("Spending before paying myself.");
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Yes, I am" }).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Saving & investing" }).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.waitForTimeout(150);
  await page.getByLabel("Email *").fill("journey@example.com");
  await page.getByLabel("Phone number").fill("8155550001");
  await page.getByLabel("How did you find this? *").selectOption("Friend or family");
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Save My Seat" }).click();
  await page.waitForTimeout(700);
}

(async () => {
  const VIEWPORTS = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 390, height: 844 },
  ];

  for (const vp of VIEWPORTS) {
    const pageErrors = [];
    const browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => pageErrors.push(String(e.message)));
    page.on("dialog", (d) => d.accept());

    console.log(`\n========== ${vp.name.toUpperCase()} (${vp.width}px) ==========`);

    // Seed: live group URL, open registration, clean registrations
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await page.evaluate((url) => {
      const ev = JSON.parse(localStorage.getItem("kr8_mindset_shift_event_v1") || "{}");
      Object.assign(ev, { whatsappGroupUrl: url, accessEnabled: true, regOpen: true, capacity: 0 });
      localStorage.setItem("kr8_mindset_shift_event_v1", JSON.stringify(ev));
      localStorage.removeItem("kr8_mindset_shift_registrations_v1");
    }, GROUP_URL);

    // ---- 1. Adaptive onboarding
    console.log(`\n[${vp.name}: onboard]`);
    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await onboardWizard(page);
    check((await page.getByText("You're in, Journey.", { exact: false }).count()) === 1,
      "onboarding succeeds — 'You're in, Journey.'");
    const codeText = await page.evaluate(() => document.body.innerText.match(/MS7-[A-Z0-9]{6,}/)?.[0] || "");
    check(/^MS7-[A-Z0-9]{6,}$/.test(codeText), `confirmation code issued (${codeText})`);

    // ---- 2. Instant access — no admin step, no share gate
    console.log(`\n[${vp.name}: instant access]`);
    const status = await page.evaluate(() => {
      const regs = JSON.parse(localStorage.getItem("kr8_mindset_shift_registrations_v1") || "[]");
      return regs[0] ? regs[0].status : null;
    });
    check(status === "access_granted", `status is access_granted immediately (got ${status})`);
    const link = page.locator(`a[href="${GROUP_URL}"]`);
    check((await link.count()) === 1, "group link visible with NO verification step");
    const linkHref = await link.first().getAttribute("href");
    const linkTarget = await link.first().getAttribute("target");
    check(linkHref === GROUP_URL && linkTarget === "_blank", "link href + open in new tab");
    check((await page.getByText("One last thing, Journey", { exact: false }).count()) === 1,
      "share moment (master copy) present below the access block");
    check((await page.locator("text=Upload screenshot").count()) === 0, "no proof upload anywhere in the flow");

    // ---- 3. Admin sees the participant + onboarding answers, then revokes
    console.log(`\n[${vp.name}: admin revoke]`);
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
    if (vp.name === "mobile") {
      await page.getByTitle("Toggle Menu").click();
      await page.waitForTimeout(400);
      await page.locator("div.w-80 button").filter({ hasText: "Mindset Shift" }).first().click();
    } else {
      const msNav = page.getByRole("button", { name: /Mindset Shift/ }).first();
      await msNav.waitFor({ timeout: 15000 });
      await msNav.click();
    }
    await page.waitForTimeout(600);
    await page.getByPlaceholder(/Search name, email, phone/i).fill("Jola");
    await page.waitForTimeout(400);
    check((await page.getByText("Journey Jola").count()) === 1, "participant found via search");
    await page.getByText("Journey Jola").click();
    await page.waitForTimeout(400);
    check((await page.getByText("Spending before paying myself.").count()) === 1,
      "admin reads the onboarding answers (speaker context)");
    await page.getByRole("button", { name: /Revoke access/ }).click();
    await page.waitForTimeout(800);
    check((await page.getByText("Access revoked for Journey Jola.").count()) === 1,
      "admin revokes access");

    // ---- 4. Participant side: link gone, paused state + restore path
    console.log(`\n[${vp.name}: post-revoke participant view]`);
    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    check((await page.locator(`a[href="${GROUP_URL}"]`).count()) === 0,
      "revoked participant: link removed from the public page");
    check((await page.locator("text=Your access is paused.").count()) === 1,
      "participant sees the paused state");
    check((await page.getByRole("button", { name: "Complete onboarding again" }).count()) === 1,
      "restore path offered (re-onboarding)");

    // ---- page errors
    const real = pageErrors.filter((m) => !/ipapi|ERR_FAILED|net::|404|supabase/i.test(m));
    check(real.length === 0, `no unexpected page errors (${real.length})`);
    if (real.length) console.log("  errors:", real.slice(0, 3));

    await browser.close();
  }

  console.log("\n------------------------------------------------------------");
  console.log(
    fail === 0 ? "MINDSET SHIFT FULL JOURNEY E2E (V2): ALL CHECKS PASSED" : `MINDSET SHIFT FULL JOURNEY E2E (V2): ${fail} CHECK(S) FAILED`
  );
  console.log(`  passed=${pass} failed=${fail}`);
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
