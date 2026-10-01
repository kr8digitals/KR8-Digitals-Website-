/**
 * MINDSET SHIFT — STEP 12: ANALYTICS
 *
 * Checks the admin Analytics sub-tab:
 *  1. KPI cards match seeded data (edition-scoped)
 *  2. Conversion figure is computed, not hardcoded
 *  3. Verification pipeline funnel
 *  4. Daily registrations chart (14 bars, today highlighted)
 *  5. Acquisition sources ranked
 *  6. Live update: a verification decision in another sub-tab changes the numbers
 *  7. Zero page errors
 *
 * Run with dev server on :5173.
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:5173";
const FOUNDER_PW = "KR8@Adm!n2026";
const PROOF =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

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

function mk(id, name, phone, email, patch = {}) {
  const now = Date.now();
  return {
    id,
    edition: "7.0",
    fullName: name,
    email,
    phone,
    whatsapp: "",
    location: "Umuahia",
    heardAbout: "WhatsApp",
    hopingToLearn: "Debt freedom",
    moneyQuestion: "How do I stop living paycheck to paycheck?",
    biggestChallenge: "Impulse spending",
    debtExperience: "Car/loan debt",
    financialSituation: "Managing month to month",
    hasFinancialGoal: true,
    areaToImprove: "Saving consistently",
    status: "registered",
    proofKey: null,
    proofData: null,
    proofSubmittedAt: null,
    adminNote: "",
    verifiedBy: null,
    verifiedAt: null,
    createdAt: now,
    updatedAt: now,
    syncPending: true,
    deletedAt: null,
    ...patch,
  };
}

const DAY = 86400000;
const now = Date.now();

const SEED = [
  // 3 registered today (exact-timestamp "now" so the today-bar is robust
  // across the local-day boundary, whenever the suite runs)
  mk("MS7-AN1001", "Ada Obi", "+2348031111111", "an1@example.com", { createdAt: now }),
  mk("MS7-AN1002", "Baraka Eze", "+2348042222222", "an2@example.com", {
    createdAt: now,
    heardAbout: "Instagram",
  }),
  mk("MS7-AN1003", "Chidi Okafor", "+2348053333333", "an3@example.com", {
    createdAt: now - 2 * DAY,
    heardAbout: "Friend",
  }),
  // 2 awaiting share verification
  mk("MS7-AN1004", "Doris Umeh", "+2348064444444", "an4@example.com", {
    status: "share_submitted",
    proofData: PROOF,
    proofKey: "idb:proof-a4",
    proofSubmittedAt: now - DAY,
    createdAt: now - 3 * DAY,
    heardAbout: "YouTube",
  }),
  mk("MS7-AN1005", "Emeka Obi", "+2348075555555", "an5@example.com", {
    status: "needs_resubmission",
    adminNote: "Blurry screenshot.",
    createdAt: now - 4 * DAY,
    heardAbout: "Instagram",
  }),
  // 2 granted
  mk("MS7-AN1006", "Fola Balogun", "+2348086666666", "an6@example.com", {
    status: "access_granted",
    verifiedBy: "Test Admin",
    verifiedAt: now - 2 * DAY,
    createdAt: now - 5 * DAY,
    heardAbout: "WhatsApp",
  }),
  mk("MS7-AN1007", "Gbenga Ade", "+2348097777777", "an7@example.com", {
    status: "access_granted",
    verifiedBy: "Test Admin",
    verifiedAt: now - DAY,
    createdAt: now - 6 * DAY,
    heardAbout: "WhatsApp",
  }),
  // 1 rejected
  mk("MS7-AN1008", "Hauwa Yusuf", "+2348108888888", "an8@example.com", {
    status: "rejected",
    adminNote: "Wrong event.",
    createdAt: now - 7 * DAY,
    heardAbout: "Friend",
  }),
  // 1 prior edition — must NOT count toward edition 7.0 analytics
  mk("MS6-AN0999", "Old User", "+2348119999999", "old@example.com", {
    edition: "6.0",
    createdAt: now - 20 * DAY,
  }),
];

async function openAdmin(page, sub) {
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
  await page.getByRole("button", { name: /Mindset Shift/ }).first().waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: /Mindset Shift/ }).first().click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: sub, exact: true }).click();
  await page.waitForTimeout(500);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e.message)));

  // ---- Seed
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.evaluate((seed) => {
    localStorage.setItem("kr8_mindset_shift_registrations_v1", JSON.stringify(seed));
  }, SEED);

  // ================= 1. KPI cards =================
  console.log("\n[analytics: KPI cards]");
  await openAdmin(page, "Analytics");
  check(
    (await page.getByText("Mindset Shift 7.0 — Analytics").count()) === 1,
    "analytics panel renders with the edition"
  );
  const kpiVal = (label) =>
    page.locator(`[data-kpi="${label}"]`).locator("p").nth(1).textContent();
  check((await kpiVal("Total registrations")).includes("8"), "total registrations KPI = 8 (prior edition excluded)");
  check((await kpiVal("Access live")).includes("2"), "access live KPI = 2");
  check((await kpiVal("Revoked or rejected")).includes("6"), "revoked/rejected KPI = 6 (3 registered + 1 legacy×2 + 1 rejected)");
  check((await kpiVal("Access conversion")).includes("25%"), "access conversion KPI = 25%");

  // ================= 2. Conversion =================
  console.log("\n[analytics: conversion]");
  const convKpi = page.locator('[data-kpi="Access conversion"]');
  const conv = await convKpi.textContent();
  check(conv.includes("25%") && conv.includes("2 of 8 participants"), "conversion computed as 25% (2 of 8)");

  // ================= 3. Access pipeline funnel =================
  console.log("\n[analytics: access pipeline funnel]");
  check(
    (await page.locator("div.rounded-xl", { hasText: "Access pipeline" }).count()) === 1,
    "funnel section renders"
  );
  const funnelCard = page.locator("div.rounded-xl", { hasText: "Access pipeline" }).first();
  const funnelText = await funnelCard.textContent();
  check(
    funnelText.includes("Completed onboarding") && funnelText.includes("Access live") &&
      funnelText.includes("Revoked or rejected"),
    "funnel stages present (onboarding → live access → exits)"
  );
  // Completed = 8; live = 2; exits = 6
  check(funnelText.includes(": 8") || funnelText.includes("8"), "funnel shows 8 completed onboarding");
  check(funnelText.includes("no share gate"), "funnel note explains the no-share-gate model");

  // ================= 4. Daily chart =================
  console.log("\n[analytics: daily chart]");
  check(
    (await page.getByText("Registrations — last 14 days").count()) === 1,
    "daily chart section renders"
  );
  const bars = page.locator('div[title*=":"]');
  const barCount = await bars.count();
  check(barCount === 14, `chart has 14 day bars (got ${barCount})`);
  const titles = [];
  for (let i = 0; i < barCount; i++) titles.push(await bars.nth(i).getAttribute("title"));
  // Seed created 2 today (AN1001 1h ago, AN1002 2h ago) → last bar ": 2"
  check(titles[13] && titles[13].endsWith(": 2"), `today's bar shows 2 (got "${titles[13]}")`);
  check(titles.slice(0, 7).some((t) => t.endsWith(": 1")), "earlier days show their single registrations");

  // ================= 5. Sources =================
  console.log("\n[analytics: sources]");
  const sourcesCard = page.locator("div.rounded-xl", { hasText: "Where participants heard about the event" }).first();
  const srcText = await sourcesCard.textContent();
  check(srcText.includes("WhatsApp") && srcText.includes("3"), "WhatsApp ranked with its count (3)");
  check(srcText.includes("Instagram") && srcText.includes("2"), "Instagram shown (2)");
  // Ranked: WhatsApp (3) must appear before Instagram (2)
  check(
    srcText.indexOf("WhatsApp") < srcText.indexOf("Instagram"),
    "sources ranked by count (WhatsApp before Instagram)"
  );

  // ================= 6. Live update =================
  console.log("\n[analytics: live update]");
  // Approve legacy row Doris (share_submitted) from the Participants sub-tab,
  // then re-open Analytics.
  await page.getByRole("button", { name: "Participants", exact: true }).click();
  await page.waitForTimeout(500);
  await page.getByText("Doris Umeh").click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: /Approve & grant access/ }).first().click();
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: "Analytics", exact: true }).click();
  await page.waitForTimeout(600);
  check(
    (await kpiVal("Access live")).includes("3"),
    "KPI updates live after the decision (2 → 3)"
  );
  const conv2 = await convKpi.textContent();
  check(conv2.includes("38%") && conv2.includes("3 of 8 participants"), "conversion recalculates (38%, 3 of 8)");
  const exits = await kpiVal("Revoked or rejected");
  check(exits.includes("5"), "exits count drops to 5 after the grant");

  // ================= 7. Page errors =================
  console.log("\n[page errors]");
  const real = pageErrors.filter((m) => !/ipapi|ERR_FAILED|net::|404|supabase/i.test(m));
  check(real.length === 0, `no unexpected page errors (${real.length})`);
  if (real.length) console.log("  errors:", real.slice(0, 3));

  console.log("\n------------------------------------------------------------");
  console.log(
    fail === 0 ? "MINDSET SHIFT ANALYTICS: ALL CHECKS PASSED" : `MINDSET SHIFT ANALYTICS: ${fail} CHECK(S) FAILED`
  );
  console.log(`  passed=${pass} failed=${fail}`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
