/**
 * MINDSET SHIFT — STEP 11: PARTICIPANT MANAGEMENT
 *
 * Real-user checks on the admin "Verification" panel's participant tools:
 *  1. Search (name/phone) + status chips + edition filter (no giant dropdowns)
 *  2. Full profile in expanded row (financial answers admin-only)
 *  3. Approve from the list
 *  4. Revoke access (granted -> registered; public link disappears)
 *  5. Delete with confirmation (gone from list + resume code dead)
 *  6. CSV export of the filtered view
 *  7. Zero page errors
 *
 * Run with dev server on :5173.
 */
const { chromium } = require("playwright");
const fs = require("fs");

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
    createdAt: now - 86400000,
    updatedAt: now - 86400000,
    syncPending: true,
    deletedAt: null,
    ...patch,
  };
}

const SEED = [
  mk("MS7-AAA111", "Ada Obi", "+2348031111111", "ada@example.com"),
  mk("MS7-BBB222", "Brian Eze", "+2348042222222", "brian@example.com", {
    status: "share_submitted",
    proofData: PROOF,
    proofKey: "idb:proof-b",
    proofSubmittedAt: Date.now() - 3600000,
  }),
  mk("MS7-CCC333", "Chinedu Okafor", "+2348053333333", "chinedu@example.com", {
    status: "access_granted",
    verifiedBy: "Test Admin",
    verifiedAt: Date.now() - 7200000,
  }),
  mk("MS7-DDD444", "Diana Umeh", "+2348064444444", "diana@example.com", {
    status: "needs_resubmission",
    adminNote: "Screenshot too dark.",
  }),
  mk("MS7-EEE555", "Emeka Obi", "+2348075555555", "emeka@example.com", {
    status: "rejected",
    adminNote: "Not the Mindset Shift event.",
  }),
  mk("MS6-OLD123", "Old Edition User", "+2348086666666", "olduser@example.com", {
    edition: "6.0",
  }),
];

async function openAdmin(page) {
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
  await page.getByRole("button", { name: "Verification", exact: true }).click();
  await page.waitForTimeout(500);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e.message)));
  page.on("dialog", (d) => d.accept());

  // ---- Seed participants + a live WhatsApp group URL
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    (seed) => {
      localStorage.setItem("kr8_mindset_shift_registrations_v1", JSON.stringify(seed));
      const ev = JSON.parse(localStorage.getItem("kr8_mindset_shift_event_v1") || "{}");
      ev.whatsappGroupUrl = "https://chat.whatsapp.com/STEP11-LIVE-GROUP";
      localStorage.setItem("kr8_mindset_shift_event_v1", JSON.stringify(ev));
    },
    SEED
  );

  // ================= 1. Filters (no giant dropdowns) =================
  console.log("\n[participant list: filters]");
  await openAdmin(page);
  const listCard = page.locator("main").last();
  check(
    (await page.getByRole("button", { name: /All · 6/ }).count()) === 1,
    "stats chip shows 6 active participants (tombstones excluded)"
  );
  check(
    (await page.locator('select[aria-label="Filter by edition"]').count()) === 1,
    "edition filter appears only when multiple editions exist"
  );
  await page.locator('select[aria-label="Filter by edition"]').selectOption("6.0");
  await page.waitForTimeout(300);
  check(
    (await page.getByText("Old Edition User").count()) === 1 &&
      (await page.getByText("Ada Obi").count()) === 0,
    "edition 6.0 filter isolates the prior-edition participant"
  );
  await page.locator('select[aria-label="Filter by edition"]').selectOption("all");
  await page.waitForTimeout(300);

  // Search by name
  const searchInput = page.getByPlaceholder(/Search name, email, phone/i);
  await searchInput.fill("diana");
  await page.waitForTimeout(300);
  check(
    (await page.getByText("Diana Umeh").count()) === 1 &&
      (await page.getByText("Ada Obi").count()) === 0,
    "name search narrows to the matching participant"
  );
  // Search by phone fragment
  await searchInput.fill("3333333");
  await page.waitForTimeout(300);
  check(
    (await page.getByText("Chinedu Okafor").count()) === 1 &&
      (await page.getByText("Diana Umeh").count()) === 0,
    "phone-fragment search finds the right row"
  );
  await searchInput.fill("");
  await page.waitForTimeout(300);

  // Status chip
  await page.getByRole("button", { name: "Awaiting Share Verification · 1" }).click();
  await page.waitForTimeout(300);
  check(
    (await page.getByText("Brian Eze").count()) === 1 &&
      (await page.getByText("Chinedu Okafor").count()) === 0,
    "status chip isolates share-verification queue"
  );
  await page.getByRole("button", { name: /Awaiting Share Verification ·/ }).click();
  await page.waitForTimeout(300);

  // ================= 2. Profile (admin-only data) =================
  console.log("\n[participant profile]");
  await page.getByText("Brian Eze").click();
  await page.waitForTimeout(400);
  check(
    (await page.getByText("Impulse spending").first().isVisible()),
    "financial challenge visible in expanded profile"
  );
  check(
    (await page.getByText("Managing month to month").first().isVisible()),
    "financial situation visible in expanded profile"
  );
  check(
    (await page.locator("img[alt='Share proof submitted by Brian Eze']").count()) === 1,
    "share proof image renders in the profile"
  );
  await page.getByText("Diana Umeh").click();
  await page.waitForTimeout(400);
  check(
    (await page.getByText("Screenshot too dark.").first().isVisible()),
    "previous admin decision note visible"
  );
  check(
    (await page.getByText("Internal note — only you and other admins can see this.").first().count()) === 1,
    "admin-only note labelled as internal"
  );

  // ================= 3. Approve from the list =================
  console.log("\n[approve from list]");
  await page.getByText("Brian Eze").click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: /Approve & grant access/ }).first().click();
  await page.waitForTimeout(600);
  check(
    (await page.getByText("Access granted to Brian Eze.").count()) === 1,
    "approve toast confirms the decision"
  );
  check(
    (await page.getByRole("button", { name: /Brian Eze MS7-BBB222.*Access Granted/ }).count()) === 1,
    "Brian's row badge flips to Access Granted"
  );

  // ================= 4. Revoke (granted -> registered, link gone) =================
  console.log("\n[revoke access]");
  // Public page resumes the most-recently-updated registration — bump
  // Chinedu (the granted one) so he is the resumed participant.
  await page.evaluate(() => {
    const regs = JSON.parse(localStorage.getItem("kr8_mindset_shift_registrations_v1"));
    const c = regs.find((r) => r.id === "MS7-CCC333");
    c.updatedAt = Date.now();
    localStorage.setItem("kr8_mindset_shift_registrations_v1", JSON.stringify(regs));
  });
  // First: the granted participant sees the live link on the public page
  await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  check(
    (await page.locator('a[href*="STEP11-LIVE-GROUP"]').count()) >= 1,
    "granted participant sees the group link on the public page"
  );
  await openAdmin(page);
  await page.getByText("Chinedu Okafor").click();
  await page.waitForTimeout(400);
  check(
    (await page.getByRole("button", { name: /Revoke access/ }).count()) === 1,
    "revoke action offered only for granted participants"
  );
  await page.getByRole("button", { name: /Revoke access/ }).click();
  await page.waitForTimeout(700);
  check(
    (await page.getByText("Access revoked for Chinedu Okafor.").count()) === 1,
    "revoke toast confirms (confirm dialog accepted)"
  );
  await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  check(
    (await page.locator('a[href*="STEP11-LIVE-GROUP"]').count()) === 0,
    "revoked participant no longer sees the group link"
  );

  // ================= 5. Delete with confirmation =================
  console.log("\n[delete registration]");
  await openAdmin(page);
  const before = await page.locator("main").last().getByText(/of 6 participants/).count();
  check(before === 1, "list shows 6 participants before delete");
  await page.getByText("Ada Obi").click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: /Delete registration/ }).click();
  await page.waitForTimeout(700);
  check(
    (await page.getByText("Ada Obi's registration was deleted.").count()) === 1,
    "delete toast confirms (confirm dialog accepted)"
  );
  check(
    (await page.getByRole("button", { name: /Ada Obi MS7-AAA111/ }).count()) === 0,
    "deleted participant gone from the list"
  );
  check(
    (await page.locator("main").last().getByText(/of 5 participants/).count()) === 1,
    "count decrements after delete"
  );

  // Dead resume code
  await page.goto(BASE + "/mindset-shift?resume=MS7-AAA111", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  check(
    (await page.getByText(/Welcome back, Ada/i).count()) === 0,
    "deleted participant's resume code no longer restores their session"
  );

  // ================= 6. CSV export =================
  console.log("\n[CSV export]");
  await openAdmin(page);
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 10000 }),
    page.getByRole("button", { name: /Export CSV/ }).click(),
  ]);
  const path = await download.path();
  const csv = fs.readFileSync(path, "utf8");
  const lines = csv.replace(/^\uFEFF/, "").split("\r\n").filter(Boolean);
  check(
    lines[0].startsWith("id,edition,fullName,email,phone,whatsapp,location,status,"),
    "CSV header has the expected columns"
  );
  check(lines.length === 6, "CSV contains the 5 remaining participants (header + 5 rows)");
  check(csv.includes("Impulse spending"), "CSV includes financial answers (admin artifact)");
  check(csv.includes("Old Edition User"), "CSV includes prior-edition participants");
  check(!csv.includes("Ada Obi"), "CSV excludes the deleted participant");

  // Export respects the active filter
  await page.getByPlaceholder(/Search name, email, phone/i).fill("diana");
  await page.waitForTimeout(300);
  const [download2] = await Promise.all([
    page.waitForEvent("download", { timeout: 10000 }),
    page.getByRole("button", { name: /Export CSV/ }).click(),
  ]);
  const csv2 = fs.readFileSync(await download2.path(), "utf8");
  const lines2 = csv2.replace(/^\uFEFF/, "").split("\r\n").filter(Boolean);
  check(lines2.length === 2, "filtered export contains only the matching participant");
  check(csv2.includes("Diana Umeh"), "filtered export contains the match");

  // ================= 7. Page errors =================
  console.log("\n[page errors]");
  const real = pageErrors.filter(
    (m) => !/ipapi|ERR_FAILED|net::|404|supabase/i.test(m)
  );
  check(real.length === 0, `no unexpected page errors (${real.length})`);
  if (real.length) console.log("  errors:", real.slice(0, 3));

  console.log("\n------------------------------------------------------------");
  console.log(
    fail === 0
      ? "MINDSET SHIFT PARTICIPANT MANAGEMENT: ALL CHECKS PASSED"
      : `MINDSET SHIFT PARTICIPANT MANAGEMENT: ${fail} CHECK(S) FAILED`
  );
  console.log(`  passed=${pass} failed=${fail}`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
