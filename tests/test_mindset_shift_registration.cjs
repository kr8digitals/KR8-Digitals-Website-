/**
 * MINDSET SHIFT 7.0 — STEP 4: REGISTRATION FORM + DB (functional browser test)
 *
 * Real user journey on a real rendered page:
 *   1. Form renders (3 fieldsets + privacy notice)
 *   2. Blank submit → inline validation errors, NOTHING stored
 *   3. Bad email → error
 *   4. Happy path (Nigerian phone via CountryPhone) → confirmation card + MS7- code
 *   5. DB row: canonical phone, normalized email, syncPending, status 'registered'
 *   6. Refresh → "Welcome back" resume (no form, no duplicate)
 *   7. Duplicate email via "different person" → resumes SAME record (no dup)
 *   8. Different-format phone (0801… vs +234…) → SAME record (no dup)
 *   9. Genuinely different person → second record
 *  10. Privacy reflection fields stored on the record
 *  11. WhatsApp-differs checkbox behaviour
 *  12. Goal yes/no logic (area required only when yes)
 *  13. Mobile: fits, no overflow, works
 *
 * Requires the dev server on http://localhost:5173 (npm run dev).
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:5173";
let failures = 0;
const ok = (n) => console.log(`  \u2713 ${n}`);
const bad = (n, d) => { failures++; console.log(`  \u2717 ${n}${d ? " — " + d : ""}`); };
const check = (cond, name, detail) => (cond ? ok(name) : bad(name, detail));

async function newPage(browser, viewport = { width: 1280, height: 900 }) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${BASE}/mindset-shift`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  return { ctx, page, errors };
}

async function regs(page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem("kr8_mindset_shift_registrations_v1");
    return raw ? JSON.parse(raw) : [];
  });
}

async function fillForm(page, over = {}) {
  const f = Object.assign({
    name: "Ada Obi",
    email: "ada.obi@example.com",
    phone: "8012345678",
    heard: "Facebook",
    hoping: "I want to understand how to get out of my card debt and start saving.",
    challenge: "I keep spending on things that don't add value.",
    debt: "Managing consumer debt (card, personal loan)",
    situation: "Tight — living close to my limit",
    goal: "yes",
    area: "Paying off debt",
    moneyQ: "How do I stop living for next month's bill?",
    location: "Umuahia, Abia State",
    whatsappDiffers: false,
    whatsapp: "",
  }, over);

  await page.locator("#ms-fullname").fill(f.name);
  await page.locator("#ms-email").fill(f.email);
  // CountryPhone: country select + phone input
  const countrySel = page.locator('#register select[aria-label="Country"]');
  await countrySel.selectOption("NG");
  await page.locator("#register input[placeholder='Phone number']").fill(f.phone);
  if (f.whatsappDiffers) {
    await page.locator("#register input[type='checkbox']").check();
    await page.locator("#ms-whatsapp").fill(f.whatsapp);
  }
  if (f.location) await page.locator("#ms-location").fill(f.location);
  await page.locator("#ms-heard").selectOption(f.heard);
  await page.locator("#ms-hoping").fill(f.hoping);
  if (f.moneyQ) await page.locator("#ms-money-q").fill(f.moneyQ);
  await page.locator("#ms-challenge").fill(f.challenge);
  if (f.debt) await page.locator("#ms-debt").selectOption(f.debt);
  if (f.situation) await page.locator("#ms-situation").selectOption(f.situation);
  if (f.goal) {
    await page.locator("#register").getByRole("button", { name: f.goal === "yes" ? "Yes" : "Not yet", exact: true }).click();
    if (f.goal === "yes" && f.area) await page.locator("#ms-area").selectOption(f.area);
  }
}

async function submit(page) {
  await page.locator("#register").getByRole("button", { name: /Register Free/ }).click();
  await page.waitForTimeout(600);
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  /* ================= 1-3. Form renders + validation ================= */
  console.log("\n[form + validation]");
  {
    const { page, ctx, errors } = await newPage(browser);
    const reg = page.locator("#register");
    check(await reg.getByText("Your details").isVisible(), "fieldset 1 'Your details' visible");
    check(await reg.getByText("About you & this conversation").isVisible(), "fieldset 2 visible");
    check(await reg.getByText("A private reflection").isVisible(), "fieldset 3 visible");
    check(await reg.getByText("never published", { exact: false }).first().isVisible(), "privacy notice visible in form");

    // Blank submit → errors, nothing stored
    await submit(page);
    check(await reg.getByText("Please enter your full name.").isVisible(), "blank submit: name error");
    check(await reg.getByText("Please enter your email.").isVisible(), "blank submit: email error");
    check(await reg.getByText("Please enter a valid phone number.").isVisible(), "blank submit: phone error");
    check(await reg.getByText("Pick where you heard about us", { exact: false }).isVisible(), "blank submit: source error");
    check(await reg.getByText("Tell us what you're hoping to learn", { exact: false }).isVisible(), "blank submit: hoping error");
    check(await reg.getByText("Tell us the biggest financial challenge you're facing right now.", { exact: false }).isVisible(), "blank submit: challenge error");
    const r = await regs(page);
    check(r.length === 0, "blank submit stores NOTHING", `count=${r.length}`);

    // Bad email
    await page.locator("#ms-email").fill("not-an-email");
    await submit(page);
    check(await reg.getByText("That email doesn't look right.").isVisible(), "invalid email shows error");

    // Goal logic: "yes" without area → error
    await fillForm(page, { area: "" });
    await submit(page);
    check(await reg.getByText("Pick the area you're working toward.").isVisible(), "goal=yes without area → error");

    check(errors.length === 0, "no page errors (validation pass)", errors.join(" | "));
    await ctx.close();
  }

  /* ============ 4-6. Happy path + DB + refresh resume ============ */
  console.log("\n[happy path + DB + refresh]");
  {
    const { page, ctx, errors } = await newPage(browser);
    const reg = page.locator("#register");

    await fillForm(page);
    await submit(page);

    check(await reg.getByText("You're registered, Ada.").isVisible(), "confirmation card shows first name");
    const code = await reg.locator("button[aria-label^='Copy confirmation code']").getAttribute("aria-label");
    const codeVal = String(code).replace("Copy confirmation code ", "");
    check(/^MS7-[A-Z0-9]{6,}$/.test(codeVal), "confirmation code is MS7- format", codeVal);

    const r = await regs(page);
    check(r.length === 1, "exactly one registration stored", `count=${r.length}`);
    if (r[0]) {
      check(r[0].phone === "+2348012345678", "phone stored in canonical form", r[0].phone);
      check(r[0].email === "ada.obi@example.com", "email normalized");
      check(r[0].status === "registered", "status starts at 'registered'", r[0].status);
      check(r[0].syncPending === true, "syncPending=true (cloud push queued)");
      check(r[0].whatsapp === "", "whatsapp empty when same as phone");
      check(r[0].debtExperience === "Managing consumer debt (card, personal loan)", "debt reflection stored");
      check(r[0].financialSituation === "Tight — living close to my limit", "situation reflection stored");
      check(r[0].hasFinancialGoal === true, "financial goal yes stored");
      check(r[0].areaToImprove === "Paying off debt", "area to improve stored");
      check(r[0].heardAbout === "Facebook", "source stored (for analytics)");
      check(r[0].location === "Umuahia, Abia State", "location stored");
    }

    // Refresh → resume, no duplicate
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    check(await reg.getByText("Welcome back, Ada.").isVisible(), "after refresh: 'Welcome back' resume card");
    check((await regs(page)).length === 1, "refresh did not duplicate");
    check(await reg.locator("button[aria-label^='Copy confirmation code']").isVisible(), "resume card shows same code");

    check(errors.length === 0, "no page errors (happy path)", errors.join(" | "));

    /* ============ 7-9. Dedupe: same email, different-format phone, new person ============ */
    console.log("\n[dedupe + multi-person]");
    await reg.getByRole("button", { name: /Different person on this device/ }).click();
    await page.waitForTimeout(300);
    check(await reg.locator("#ms-fullname").isVisible(), "'different person' returns to the form");

    // Same email, different name → must resume, not duplicate
    await fillForm(page, { name: "Ada Chiedozie Obi", phone: "9012345678" });
    await submit(page);
    let r2 = await regs(page);
    check(r2.length === 1, "duplicate EMAIL resumes same record", `count=${r2.length}`);
    check(r2[0].fullName === "Ada Obi", "original record untouched on email dup");

    // Different email, DIFFERENT-FORMAT phone of the same number → must resume
    await reg.getByRole("button", { name: /Different person on this device/ }).click();
    await page.waitForTimeout(300);
    await fillForm(page, { name: "Someone New", email: "new.person@example.com", phone: "08012345678" });
    await submit(page);
    let r3 = await regs(page);
    check(r3.length === 1, "duplicate PHONE (local 0801 vs intl +234 format) resumes same record", `count=${r3.length}`);

    // Genuinely different person → new record
    await reg.getByRole("button", { name: /Different person on this device/ }).click();
    await page.waitForTimeout(300);
    await fillForm(page, {
      name: "Bola Adeyemi",
      email: "bola@example.com",
      phone: "8039876543",
      goal: "no",
      whatsappDiffers: true,
      whatsapp: "09012349876",
    });
    await submit(page);
    let r4 = await regs(page);
    check(r4.length === 2, "different person creates second record", `count=${r4.length}`);
    const bola = r4.find((x) => x.email === "bola@example.com");
    check(!!bola, "Bola's record exists");
    if (bola) {
      check(bola.hasFinancialGoal === false, "goal=no stored as false");
      check(bola.areaToImprove === "", "no area when goal=no");
      check(bola.whatsapp === "+2349012349876", "different WhatsApp stored canonical", bola.whatsapp);
    }
    check(await reg.getByText("You're registered, Bola.").isVisible(), "confirmation for second person");

    check(errors.length === 0, "no page errors (dedupe pass)", errors.join(" | "));
    await page.screenshot({ path: "tests/shots/ms7-registration-done.png", fullPage: false });
    await ctx.close();
  }

  /* ================= 13. Mobile ================= */
  console.log("\n[mobile 390x844]");
  {
    const { page, ctx, errors } = await newPage(browser, { width: 390, height: 844 });
    const reg = page.locator("#register");
    check(await reg.getByText("Your details").isVisible(), "form visible on mobile");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(overflow <= 1, "no horizontal overflow on mobile", `overflow=${overflow}px`);
    await fillForm(page, { goal: "no" });
    await submit(page);
    check(await reg.getByText("You're registered, Ada.").isVisible(), "submit works on mobile");
    const overflow2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(overflow2 <= 1, "no overflow on confirmation (mobile)", `overflow=${overflow2}px`);
    await page.screenshot({ path: "tests/shots/ms7-registration-mobile.png", fullPage: false });
    check(errors.length === 0, "no page errors (mobile)", errors.join(" | "));
    await ctx.close();
  }

  await browser.close();

  console.log("\n" + "-".repeat(60));
  if (failures > 0) {
    console.log(`MINDSET SHIFT REGISTRATION: ${failures} CHECK(S) FAILED`);
    process.exit(1);
  }
  console.log("MINDSET SHIFT REGISTRATION: ALL CHECKS PASSED");
  console.log("-".repeat(60));
})().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
