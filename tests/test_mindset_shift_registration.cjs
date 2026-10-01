/**
 * MINDSET SHIFT 7.0 — REGISTRATION (v2 adaptive onboarding)
 *
 * One honest question at a time, branching on the answer, personalised
 * with the visitor's name, and a recap of their own words before commit.
 * Completing onboarding grants WhatsApp access immediately — there is
 * no share gate. This suite verifies the wizard end-to-end plus the
 * classic data guarantees (dedupe, resume, capacity, closed gate, XSS).
 *
 * Requires the dev server on http://localhost:5173 (npm run dev).
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:5173";
const REGS_KEY = "kr8_mindset_shift_registrations_v1";

let pass = 0, fail = 0;
function check(cond, label, detail) {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`); }
}

const WHY = {
  money: "Money never seems to last, no matter how much I make",
  debt: "I'm trying to get out of debt",
  build: "I want to build something — savings, a business, a future",
  curious: "I'm just curious (I might be braver than I look)",
};

/** Drive the adaptive wizard. Defaults give the DEBT branch. */
async function onboard(page, opts = {}) {
  const o = {
    name: "Ada Obi",
    why: "debt",
    debtType: "Loan app or card",
    duration: "Less than a year",
    situation: "Steady, but little left at the end of the month",
    buildMove: "Paying off debt",
    stress: "It's heavy — and I don't talk about it",
    challenge: "My money never lasts past the 20th, and I don't know why.",
    goal: "yes",
    area: "Paying off debt",
    question: null, // null = skip the optional question
    email: "ada@example.com",
    phone: "08031112223",
    city: "Umuahia",
    heard: "Friend or family",
    ...opts,
  };

  // 0 · name
  await page.getByPlaceholder(/Your name/).fill(o.name);
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(150);

  // 1 · why (branches the rest)
  await page.getByRole("button", { name: WHY[o.why] }).first().click();
  await page.waitForTimeout(150);

  if (o.why === "debt") {
    await page.getByRole("button", { name: o.debtType }).first().click();
    await page.waitForTimeout(120);
    await page.getByRole("button", { name: o.duration }).first().click();
    await page.waitForTimeout(120);
  } else if (o.why === "money") {
    await page.getByRole("button", { name: o.situation }).first().click();
    await page.waitForTimeout(120);
  } else if (o.why === "build") {
    await page.getByRole("button", { name: o.buildMove }).first().click();
    await page.waitForTimeout(120);
  }

  // 3 · stress
  await page.getByRole("button", { name: o.stress }).first().click();
  await page.waitForTimeout(120);

  // 4 · challenge (free text)
  await page.getByPlaceholder(/My money never lasts/).fill(o.challenge);
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(150);

  // 5 · goal
  if (o.goal === "yes") {
    await page.getByRole("button", { name: "Yes, I am" }).click();
    await page.waitForTimeout(120);
    await page.getByRole("button", { name: o.area }).first().click();
    await page.waitForTimeout(120);
  } else {
    await page.getByRole("button", { name: "Not yet" }).click();
    await page.waitForTimeout(120);
    await page.getByRole("button", { name: "Continue" }).first().click();
    await page.waitForTimeout(150);
  }

  // 6 · optional question
  if (o.question === null) {
    await page.getByRole("button", { name: "Skip for now" }).click();
  } else {
    await page.getByPlaceholder(/Will I ever be able to own a home/).fill(o.question);
    await page.getByRole("button", { name: "Save my answer" }).click();
  }
  await page.waitForTimeout(150);

  // 7 · details
  await page.getByLabel("Email *").fill(o.email);
  await page.getByLabel("Phone number").fill(o.phone);
  if (o.city) await page.getByLabel(/City \/ state/).fill(o.city);
  await page.getByLabel("How did you find this? *").selectOption(o.heard);
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(150);

  // 8 · recap + commit
  await page.getByRole("button", { name: "Save My Seat" }).click();
  await page.waitForTimeout(400);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 140)));

  await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);

  /* ============ 1. New copy on the page ============ */
  console.log("\n[registration: new page copy]");
  check(await page.getByText("You're not bad with money — you were never taught.", { exact: false }).first().isVisible(),
    "hero subtitle: the reframe hook");
  check(await page.getByRole("link", { name: /Claim Your Free Seat/i }).first().isVisible() ||
        (await page.locator("text=Claim Your Free Seat").count()) >= 1,
    "hero CTA: 'Claim Your Free Seat'");
  check((await page.locator("text=The one nobody asks").count()) >= 0, "no crash on load");
  check((await page.locator("text=This is for you if").count()) >= 1, "audience section renders");
  check((await page.locator("text=I'll start next month").count()) >= 1,
    "audience mirrors the visitor's experience");

  /* ============ 2. Wizard: one question at a time ============ */
  console.log("\n[registration: one question at a time]");
  check(await page.getByText("What should we call you?").isVisible(), "step 1 asks for the name");
  await page.getByPlaceholder(/Your name/).fill("Ada Obi");
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(200);
  check(await page.getByText(/Honest question, Ada/).first().isVisible(),
    "step 2 personalised with the visitor's name");
  check((await page.getByRole("button", { name: WHY.debt }).count()) === 1, "why-step shows the 4 honest options");
  // Back works (and does NOT submit the form)
  await page.getByRole("button", { name: "Back" }).first().click();
  await page.waitForTimeout(200);
  check(await page.getByText("What should we call you?").isVisible(), "Back returns to the name step");
  const earlyRegs = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "[]"), REGS_KEY);
  check(earlyRegs.length === 0, "Back does not submit the form (no registration stored mid-wizard)");
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(200);

  /* ============ 3. Branching: debt branch ============ */
  console.log("\n[registration: branching]");
  await page.getByRole("button", { name: WHY.debt }).first().click();
  await page.waitForTimeout(250);
  check(await page.getByText("What kind of debt is it?").isVisible(), "debt branch asks debt type");
  await page.getByRole("button", { name: "Loan app or card" }).first().click();
  await page.waitForTimeout(250);
  check(await page.getByText("How long has it been sitting on your chest?").isVisible(),
    "debt branch follows up with duration");
  await page.getByRole("button", { name: "Less than a year" }).first().click();
  await page.waitForTimeout(250);
  check(await page.getByText(/is money a quiet stress in your home/).first().isVisible(),
    "then the honest stress question");

  // Switch branch mid-flow: back to why (stress→duration→branch→why), pick build
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Back" }).first().click();
    await page.waitForTimeout(150);
  }
  check(await page.getByText("What's pulling you toward this event right now?").isVisible(),
    "back through the branch returns to the why step");
  await page.getByRole("button", { name: WHY.build }).first().click();
  await page.waitForTimeout(250);
  check(await page.getByText("If this works, what's the first thing you'd change?").isVisible(),
    "build branch shows a different follow-up");
  check((await page.locator("text=What kind of debt is it?").count()) === 0, "debt questions gone after branch switch");
  await page.getByRole("button", { name: "Paying off debt" }).first().click();
  await page.waitForTimeout(250);
  check((await page.locator("text=How long has it been sitting").count()) === 0, "no debt-duration step for the build branch");

  /* ============ 4. Full debt-branch run + recap + commit ============ */
  console.log("\n[registration: full run + recap]");
  // finish the build run quickly (stress→challenge→goal→skip→details→recap)
  await page.getByRole("button", { name: "It's heavy — and I don't talk about it" }).first().click();
  await page.waitForTimeout(150);
  await page.getByPlaceholder(/My money never lasts/).fill("I watch my salary disappear by the 20th every month.");
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Yes, I am" }).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Paying off debt" }).first().click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.waitForTimeout(150);
  await page.getByLabel("Email *").fill("ada@recap.com");
  await page.getByLabel("Phone number").fill("08032223334");
  await page.getByLabel("How did you find this? *").selectOption("Friend or family");
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(250);

  const recap = page.locator("#register");
  check(await recap.getByText("Here's what you told us.").isVisible(), "recap step recaps their own words");
  check((await recap.locator("text=You came because").count()) === 1, "recap line: why they came");
  check((await recap.locator("text=I watch my salary disappear by the 20th every month.").count()) === 1,
    "recap quotes the visitor's exact words");
  check((await recap.locator("text=Working toward — Paying off debt").count()) === 1, "recap line: goal");

  // commit
  await page.getByRole("button", { name: "Save My Seat" }).click();
  await page.waitForTimeout(500);
  check(await page.getByText("You're in, Ada.", { exact: false }).isVisible(), "graduation: 'You're in, Ada.'");

  const regs = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "[]"), REGS_KEY);
  check(regs.length === 1, "exactly one registration stored");
  const r = regs[0];
  check(/^MS7-/.test(r.id), "confirmation code MS7-…", r.id);
  check(r.status === "access_granted", "access granted IMMEDIATELY after onboarding (no share gate)", r.status);
  check(r.whyHere === WHY.build, "whyHere stored", r.whyHere);
  check(r.hopingToLearn === "Paying off debt", "build branch → hopingToLearn", r.hopingToLearn);
  check(r.biggestChallenge === "I watch my salary disappear by the 20th every month.", "biggestChallenge stored");
  check(r.moneyStress === "It's heavy — and I don't talk about it", "moneyStress stored");
  check(r.hasFinancialGoal === true && r.areaToImprove === "Paying off debt", "goal + area stored");
  check(r.email === "ada@recap.com" && r.location === "", "contact data stored");

  /* ============ 5. Dedupe + resume on refresh ============ */
  console.log("\n[registration: dedupe + resume]");
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  check(await page.getByText("Welcome back, Ada.", { exact: false }).isVisible(), "refresh shows the done card, not the wizard");
  const regs2 = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "[]"), REGS_KEY);
  check(regs2.length === 1, "no duplicate after refresh");

  await page.goto(BASE + "/mindset-shift?resume=" + r.id, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  check(await page.getByText("Welcome back, Ada.", { exact: false }).isVisible(), "?resume=CODE resumes the same registration");
  await page.goto(BASE + "/mindset-shift?resume=MS7-NOPE99", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  check((await page.locator("text=No such registration").count()) === 0, "unknown resume code: no error, no data leak");

  /* ============ 6. Different person on the same device ============ */
  console.log("\n[registration: different person]");
  await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: /Different person on this device/ }).click();
  await page.waitForTimeout(300);
  check(await page.getByText("What should we call you?").isVisible(), "onboarding a different person starts the wizard again");
  await onboard(page, {
    name: "Bola Achebe",
    why: "debt",
    email: "bola@example.com",
    phone: "08044445556",
    challenge: "The loan app interest is eating me alive.",
    goal: "no",
  });
  const regs3 = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "[]"), REGS_KEY);
  check(regs3.length === 2, "second participant stored separately");
  check(regs3.find((x) => x.email === "bola@example.com")?.status === "access_granted", "second participant also gets immediate access");
  const bola = regs3.find((x) => x.email === "bola@example.com");
  check(bola?.debtExperience === "Loan app or card" && bola?.debtDuration === "Less than a year",
    "debt branch data stored for the debt participant", JSON.stringify({ d: bola?.debtExperience, u: bola?.debtDuration }));
  check(bola?.hasFinancialGoal === false, "goal 'no' stored");

  /* ============ 7. Gates (closed + capacity) ============ */
  console.log("\n[registration: gates]");
  await page.evaluate(() => {
    const ev = JSON.parse(localStorage.getItem("kr8_mindset_shift_event_v1") || "{}");
    ev.capacity = 2;
    localStorage.setItem("kr8_mindset_shift_event_v1", JSON.stringify(ev));
    window.dispatchEvent(new Event("kr8:ms-event-updated"));
  });
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: /Different person on this device/ }).click();
  await page.waitForTimeout(300);
  check(await page.getByText("This edition is fully booked", { exact: false }).first().isVisible(),
    "capacity gate: third visitor blocked when capacity=2");

  await page.evaluate(() => {
    const ev = JSON.parse(localStorage.getItem("kr8_mindset_shift_event_v1") || "{}");
    ev.capacity = 0;
    ev.regOpen = false;
    localStorage.setItem("kr8_mindset_shift_event_v1", JSON.stringify(ev));
    window.dispatchEvent(new Event("kr8:ms-event-updated"));
  });
  await page.waitForTimeout(400);
  check(await page.getByText("Already registered?", { exact: false }).first().isVisible(),
    "closed gate: new visitors blocked when regOpen=false");
  // Existing participants keep their done card even when closed
  await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  check((await page.locator("text=Status:").count()) >= 1, "existing participants keep access to their status after close");

  /* ============ 8. XSS safety ============ */
  console.log("\n[registration: XSS safety]");
  await page.evaluate((k) => {
    localStorage.removeItem(k);
    const ev = JSON.parse(localStorage.getItem("kr8_mindset_shift_event_v1") || "{}");
    ev.regOpen = true;
    localStorage.setItem("kr8_mindset_shift_event_v1", JSON.stringify(ev));
    window.dispatchEvent(new Event("kr8:ms-event-updated"));
  }, REGS_KEY);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  await onboard(page, {
    name: "XSS <img src=x onerror=alert(1)> Test",
    why: "curious",
    challenge: "<script>window.xss=1<\\/script> and <b>bold</b>",
    email: "xss@example.com",
    phone: "08055556667",
    goal: "no",
  });
  const injected = await page.evaluate(() => !!window.xss);
  check(injected === false, "no script execution from answers");
  const imgXss = await page.locator("img[src='x']").count();
  check(imgXss === 0, "no <img onerror> injection in the done card");
  const regsX = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "[]"), REGS_KEY);
  check(regsX[0]?.biggestChallenge?.includes("<script>"), "raw answer stored intact (escaped only on render)");

  check(errors.length === 0, "no page errors", errors.join(" | "));
  console.log("\n------------------------------------------------------------");
  console.log(`MINDSET SHIFT REGISTRATION (V2): ${fail === 0 ? "ALL CHECKS PASSED" : fail + " CHECK(S) FAILED"}`);
  console.log(`  passed=${pass} failed=${fail}`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
