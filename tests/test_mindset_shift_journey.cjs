/**
 * MINDSET SHIFT — STEP 16: FULL JOURNEY E2E (desktop + mobile)
 *
 * The complete real-user loop, on BOTH desktop (1440) and mobile (390):
 *   1. Register on the public page (form → confirmation + code)
 *   2. Share step: upload the screenshot proof → share_submitted
 *   3. Admin verifies (search → approve) → access_granted
 *   4. Public page: the WhatsApp group link appears (correct href)
 *   5. Admin revokes → the link disappears
 *
 * Existing-site regression is covered separately by
 * test_critical_fixes.cjs + test_full_regression.cjs (run in STEP 16).
 *
 * Run with dev server on :5173.
 */
const { chromium } = require("playwright");
const fs = require("fs");

const BASE = "http://localhost:5173";
const FOUNDER_PW = "KR8@Adm!n2026";
const GROUP_URL = "https://chat.whatsapp.com/STEP16-JOURNEY-GROUP";
const PROOF_FILE = "/tmp/proof-small.png";

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

(async () => {
  if (!fs.existsSync(PROOF_FILE)) {
    console.error("FATAL: missing proof image at", PROOF_FILE);
    process.exit(1);
  }

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

    console.log(`\n========== ${vp.name.toUpperCase()} (${vp.width}px) ==========`);

    // Seed: live group URL, open registration
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await page.evaluate((url) => {
      const ev = JSON.parse(localStorage.getItem("kr8_mindset_shift_event_v1") || "{}");
      Object.assign(ev, { whatsappGroupUrl: url, regOpen: true, capacity: 0 });
      localStorage.setItem("kr8_mindset_shift_event_v1", JSON.stringify(ev));
    }, GROUP_URL);
    await page.evaluate(() => localStorage.removeItem("kr8_mindset_shift_registrations_v1"));

    // ---- 1. Register
    console.log(`\n[${vp.name}: register]`);
    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await page.locator("#ms-fullname").fill("Journey Jola");
    await page.locator("#ms-email").fill("journey@example.com");
    await page.getByPlaceholder("Phone number").fill("8155550001");
    await page.locator("#ms-heard").selectOption("Friend or family");
    await page.locator("#ms-hoping").fill("A realistic path out of debt.");
    await page.locator("#ms-challenge").fill("Spending before paying myself.");
    await page.getByRole("button", { name: "Not yet", exact: true }).click();
    await page.getByRole("button", { name: /Register Free/ }).click();
    await page.waitForTimeout(1400);
    check(
      (await page.getByText("You're registered, Journey.").count()) === 1,
      "registration succeeds (confirmation card)"
    );
    const codeText = await page.evaluate(() => document.body.innerText.match(/MS7-[A-Z0-9]{6,}/)?.[0] || "");
    check(/^MS7-[A-Z0-9]{6,}$/.test(codeText), `confirmation code issued (${codeText})`);

    // ---- 2. Upload proof
    console.log(`\n[${vp.name}: share proof]`);
    const fileInput = page.locator('input[type="file"][aria-label="Upload screenshot of your share"]');
    check((await fileInput.count()) === 1, "proof upload control visible in the flow");
    await fileInput.setInputFiles(PROOF_FILE);
    await page.waitForTimeout(900);
    await page.getByRole("button", { name: "Submit proof" }).click();
    await page.waitForTimeout(1600);
    const status = await page.evaluate(() => {
      const regs = JSON.parse(localStorage.getItem("kr8_mindset_shift_registrations_v1") || "[]");
      return regs[0] ? regs[0].status : null;
    });
    check(status === "share_submitted", `status flipped to share_submitted (got ${status})`);
    check(
      (await page.getByText("Done — you shared the event.").count()) === 1,
      "flow marks the share step done"
    );

    // ---- 3. Admin verifies
    console.log(`\n[${vp.name}: admin verification]`);
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
    check(
      (await page.locator("img[alt='Share proof submitted by Journey Jola']").count()) === 1,
      "proof image visible to the admin"
    );
    await page.getByRole("button", { name: /Approve & grant access/ }).click();
    await page.waitForTimeout(800);
    check(
      (await page.getByText("Access granted to Journey Jola.").count()) === 1,
      "admin approves from the list"
    );

    // ---- 4. Link appears on the public page
    console.log(`\n[${vp.name}: WhatsApp link]`);
    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    const link = page.locator(`a[href="${GROUP_URL}"]`);
    check((await link.count()) >= 1, "group link now visible for the granted participant");
    const linkHref = await link.first().getAttribute("href");
    const linkTarget = await link.first().getAttribute("target");
    check(linkHref === GROUP_URL && linkTarget === "_blank", "link href + open in new tab");

    // ---- 5. Revoke → link disappears
    console.log(`\n[${vp.name}: revoke]`);
    await page.goto(BASE + "/admin", { waitUntil: "domcontentloaded" });
    const unlockBtn2 = page.getByRole("button", { name: /unlock dashboard/i });
    try {
      await unlockBtn2.first().waitFor({ timeout: 8000 });
      await unlockBtn2.first().click();
      await page.waitForTimeout(400);
      const admPw = page.locator("input[type=password]");
      if (await admPw.count() > 0) {
        await admPw.last().fill(FOUNDER_PW);
        await unlockBtn2.last().click();
      }
    } catch {
      /* already unlocked */
    }
    if (vp.name === "mobile") {
      await page.getByTitle("Toggle Menu").click();
      await page.waitForTimeout(400);
      await page.locator("div.w-80 button").filter({ hasText: "Mindset Shift" }).first().click();
    } else {
      const msNav2 = page.getByRole("button", { name: /Mindset Shift/ }).first();
      await msNav2.waitFor({ timeout: 15000 });
      await msNav2.click();
    }
    await page.waitForTimeout(600);
    page.on("dialog", (d) => d.accept());
    await page.getByPlaceholder(/Search name, email, phone/i).fill("Jola");
    await page.waitForTimeout(400);
    await page.getByText("Journey Jola").click();
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: /Revoke access/ }).click();
    await page.waitForTimeout(800);
    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    check(
      (await page.locator(`a[href="${GROUP_URL}"]`).count()) === 0,
      "revoked participant: link removed from the public page"
    );

    // ---- page errors
    const real = pageErrors.filter((m) => !/ipapi|ERR_FAILED|net::|404|supabase/i.test(m));
    check(real.length === 0, `no unexpected page errors (${real.length})`);
    if (real.length) console.log("  errors:", real.slice(0, 3));

    await browser.close();
  }

  console.log("\n------------------------------------------------------------");
  console.log(
    fail === 0 ? "MINDSET SHIFT FULL JOURNEY E2E: ALL CHECKS PASSED" : `MINDSET SHIFT FULL JOURNEY E2E: ${fail} CHECK(S) FAILED`
  );
  console.log(`  passed=${pass} failed=${fail}`);
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
