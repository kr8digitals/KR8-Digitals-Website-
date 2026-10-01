/**
 * MINDSET SHIFT 7.0 — PARTICIPANTS (v2: records, moderation, sync)
 *
 * Complements the admin suite:
 *   - per-row answer completeness (every field the speaker reads)
 *   - Reject on an access-granted row (v2 moderation) + public round-trip
 *   - cross-tab live sync (storage event, no reload)
 *   - CSV escaping for answers containing commas/quotes
 *   - deleted codes can't be resumed on the public page
 *
 * Requires the dev server on http://localhost:5173 (npm run dev).
 */
const { chromium } = require("playwright");
const fs = require("fs");

const BASE = "http://localhost:5173";
const REGS_KEY = "kr8_mindset_shift_registrations_v1";
const EVENT_KEY = "kr8_mindset_shift_event_v1";
const FOUNDER_PW = "KR8@Adm!n2026";

let pass = 0, fail = 0;
function check(cond, label, detail) {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`); }
}

async function openAdmin(page) {
  await page.goto(BASE + "/admin", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const unlockBtn = page.getByRole("button", { name: /unlock dashboard/i });
  if (await unlockBtn.count() > 0) {
    await unlockBtn.first().click();
    await page.waitForTimeout(400);
    const admPw = page.locator("input[type=password]");
    if (await admPw.count() > 0) {
      await admPw.last().fill(FOUNDER_PW);
      await unlockBtn.last().click();
      await page.waitForTimeout(900);
    }
  }
  await page.getByRole("button", { name: /Mindset Shift/ }).first().click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Participants", exact: true }).click();
  await page.waitForTimeout(400);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 140)));
  page.on("dialog", (d) => d.accept());

  // Founder session + seeded records (varied statuses & answers).
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.evaluate((pw) => {
    const founder = {
      type: "founder",
      executiveRole: "Founder",
      id: "KR8-FOUNDER-TIMFIRE",
      name: "Kenneth Timothy Iziogo (Timfire)",
      email: "kr8digitals01@gmail.com",
      phone: "+2348125687509",
      admin: { role: "ultimate", permissions: ["all"], adminPassword: pw },
    };
    localStorage.setItem("kr8_current", JSON.stringify(founder));
    const regs = [
      {
        id: "MS7-PART0001", edition: "7.0",
        fullName: "Diana Umeh", email: "diana@example.com", phone: "08011110001",
        whatsapp: "2348011110001", location: "Port Harcourt, Rivers",
        heardAbout: "Word of mouth", hopingToLearn: "Debt strategy",
        moneyQuestion: "How do I, when I have three debts, pay one first?",
        biggestChallenge: "Salary lands, disappears — 'no visible pattern'",
        debtExperience: "Multiple (3+)", debtDuration: "Longer than I want to admit",
        moneyStress: "We argue about money at home",
        financialSituation: "", hasFinancialGoal: true, areaToImprove: "Debt repayment plan",
        whyHere: "I'm trying to get out of debt",
        status: "access_granted",
        proofKey: null, proofData: null, proofSubmittedAt: null,
        adminNote: "", verifiedBy: null, verifiedAt: null,
        createdAt: Date.now() - 90000000, updatedAt: Date.now() - 86000000, syncPending: false,
      },
      {
        id: "MS7-PART0002", edition: "7.0",
        fullName: "Tunde Bakare", email: "tunde@example.com", phone: "08022220002",
        whatsapp: "", location: "Lagos",
        heardAbout: "YouTube", hopingToLearn: "",
        moneyQuestion: "", biggestChallenge: "No savings at all",
        debtExperience: "", debtDuration: "",
        moneyStress: "I'd rather not say",
        financialSituation: "Money comes in bursts",
        hasFinancialGoal: false, areaToImprove: "",
        whyHere: "Money never seems to last, no matter how much I make",
        status: "access_granted",
        proofKey: null, proofData: null, proofSubmittedAt: null,
        adminNote: "", verifiedBy: null, verifiedAt: null,
        createdAt: Date.now() - 50000000, updatedAt: Date.now() - 40000000, syncPending: false,
      },
      {
        id: "MS6-OLD0001", edition: "6.0",
        fullName: "Old Edition User", email: "old@example.com", phone: "08033330003",
        whatsapp: "", location: "",
        heardAbout: "Facebook", hopingToLearn: "Mindset",
        moneyQuestion: "", biggestChallenge: "",
        debtExperience: "", debtDuration: "",
        moneyStress: "", financialSituation: "",
        hasFinancialGoal: false, areaToImprove: "",
        whyHere: "I'm just curious (I might be braver than I look)",
        status: "access_granted",
        proofKey: null, proofData: null, proofSubmittedAt: null,
        adminNote: "", verifiedBy: null, verifiedAt: null,
        createdAt: Date.now() - 900000000, updatedAt: Date.now() - 800000000, syncPending: false,
      },
    ];
    localStorage.setItem("kr8_mindset_shift_registrations_v1", JSON.stringify(regs));
    const ev = JSON.parse(localStorage.getItem("kr8_mindset_shift_event_v1") || "{}");
    ev.whatsappGroupUrl = "https://chat.whatsapp.com/MS7-PART-LINK";
    ev.accessEnabled = true;
    localStorage.setItem("kr8_mindset_shift_event_v1", JSON.stringify(ev));
  }, FOUNDER_PW);

  /* ============ 1. Rows: answers completeness ============ */
  console.log("\n[rows: every field the speaker reads]");
  await openAdmin(page);
  const card = (name) => page.getByRole("button").filter({ hasText: name }).first();
  {
    await card("Diana Umeh").click();
    await page.waitForTimeout(350);
    const detail = page.locator("div.space-y-5").first();
    for (const [label, value] of [
      ["Location", "Port Harcourt, Rivers"],
      ["Heard about us via", "Word of mouth"],
      ["Why they came", "I'm trying to get out of debt"],
      ["Money stress at home", "We argue about money at home"],
      ["Hoping to learn", "Debt strategy"],
      ["Money question", "How do I, when I have three debts, pay one first?"],
      ["Biggest financial challenge", "Salary lands, disappears — 'no visible pattern'"],
      ["Debt experience", "Multiple (3+)"],
      ["Debt duration", "Longer than I want to admit"],
      ["Working toward a goal", "Yes — Debt repayment plan"],
    ]) {
      check((await detail.getByText(label, { exact: true }).count()) === 1 &&
            (await detail.getByText(value).count()) >= 1, `Diana: '${label}' = '${value}'`);
    }
    check((await detail.getByText("WA 2348011110001").count()) >= 1, "row header shows the WhatsApp number");
  }

  /* ============ 2. Reject a granted row (v2 moderation) ============ */
  console.log("\n[moderation: reject a granted participant]");
  {
    await card("Tunde Bakare").click();
    await page.waitForTimeout(350);
    const detail = page.locator("div.space-y-5").first();
    await detail.locator("textarea").fill("Reported as a duplicate — same device as another account.");
    await detail.getByRole("button", { name: "Reject participant" }).click();
    await page.waitForTimeout(600);
    check(await page.getByText("Tunde Bakare was rejected.").isVisible(), "reject toast");
    check(await page.getByText("Rejected", { exact: true }).first().isVisible(), "badge flips to Rejected");
    check((await page.locator("text=Reported as a duplicate").count()) >= 1, "moderation note recorded");

    // Public round-trip: Tunde's code shows the rejected state, no link.
    await page.goto(BASE + "/mindset-shift?resume=MS7-PART0002", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    check((await page.locator("text=This registration was rejected.").count()) === 1, "rejected state on the public page");
    check((await page.locator("a[href*='chat.whatsapp.com']").count()) === 0, "no group link for the rejected participant");
    check(errors.length === 0, "no page errors (moderation round-trip)", errors.join(" | "));
  }

  /* ============ 3. Storage-event live sync (no reload) ============ */
  console.log("\n[sync: storage event live update]");
  {
    await openAdmin(page); // page was on the public page after the round-trip
    // Simulate exactly what the browser does when ANOTHER tab (a public
    // device) writes registrations: the storage event fires in this tab
    // and the list must refresh without a reload. (A second full app tab
    // is not used: two 2.7MB app instances OOM the 2GB sandbox.)
    await page.evaluate(() => {
      const key = "kr8_mindset_shift_registrations_v1";
      const regs = JSON.parse(localStorage.getItem(key) || "[]");
      regs.push({
        id: "MS7-PART0004", edition: "7.0",
        fullName: "Cross Taber", email: "crosstab@example.com", phone: "08044440004",
        whatsapp: "", location: "", heardAbout: "Other", hopingToLearn: "",
        moneyQuestion: "", biggestChallenge: "Just trying to find my footing.",
        debtExperience: "", debtDuration: "", moneyStress: "I'd rather not say",
        financialSituation: "", hasFinancialGoal: false, areaToImprove: "",
        whyHere: "I'm just curious (I might be braver than I look)",
        status: "access_granted",
        proofKey: null, proofData: null, proofSubmittedAt: null,
        adminNote: "", verifiedBy: null, verifiedAt: null,
        createdAt: Date.now(), updatedAt: Date.now(), syncPending: false,
      });
      localStorage.setItem(key, JSON.stringify(regs));
      window.dispatchEvent(new Event("storage"));
    });
    await page.waitForTimeout(900);
    check(await page.getByText("Cross Taber").first().isVisible(), "new registration appears in the admin list live (storage sync)");
    check(await page.getByText("All · 4").isVisible(), "chip count updates live to 4");
  }

  /* ============ 4. CSV escaping ============ */
  console.log("\n[csv: escaping]");
  {
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 10000 }),
      page.getByRole("button", { name: /Export CSV/ }).click(),
    ]);
    await page.waitForTimeout(300);
    const text = fs.readFileSync(await download.path(), "utf8");
    // moneyQuestion has commas + apostrophes; biggestChallenge has an em dash & quotes
    check(text.includes('"How do I, when I have three debts, pay one first?"'),
      "comma-bearing answer is quoted");
    check(text.includes('"Salary lands, disappears — \'no visible pattern\'"'),
      "answer with quotes/commas escaped");
    // Minimal CSV line parser (quoted fields, doubled inner quotes).
    const parseCsvLine = (line) => {
      const out = []; let cur = ""; let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQ) {
          if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
          else cur += ch;
        } else if (ch === '"') inQ = true;
        else if (ch === ",") { out.push(cur); cur = ""; }
        else cur += ch;
      }
      out.push(cur);
      return out;
    };
    const header = parseCsvLine(text.split("\r\n")[0]);
    const diRow = parseCsvLine(text.split("\r\n").find((l) => l.startsWith("MS7-PART0001,")) || "");
    check(diRow[header.indexOf("whyHere")] === "I'm trying to get out of debt", "whyHere column populated");
    check(diRow[header.indexOf("moneyStress")] === "We argue about money at home", "moneyStress column populated");
    check(diRow[header.indexOf("debtDuration")] === "Longer than I want to admit", "debtDuration column populated");
  }

  /* ============ 5. Edition filter + delete + unresumable code ============ */
  console.log("\n[editions + delete]");
  {
    const sel = page.locator("select[aria-label='Filter by edition']");
    check((await sel.count()) === 1, "edition select present (7.0 + 6.0)");
    await sel.selectOption("6.0");
    await page.waitForTimeout(400);
    check(await page.getByText("Old Edition User").first().isVisible(), "6.0 row visible");
    check((await page.getByText("Diana Umeh").count()) === 0, "7.0 rows hidden under 6.0 filter");
    await sel.selectOption("all");
    await page.waitForTimeout(400);

    await card("Old Edition User").click();
    await page.waitForTimeout(350);
    const detail = page.locator("div.space-y-5").first();
    await detail.getByRole("button", { name: "Delete registration" }).click();
    await page.waitForTimeout(600);
    check(await page.getByText("Old Edition User's registration was deleted.").isVisible(), "delete toast");
    check(await page.getByText("All · 3").isVisible(), "chip count drops to 3");

    // The deleted code can no longer resume on the public page.
    await page.goto(BASE + "/mindset-shift?resume=MS6-OLD0001", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    check((await page.locator("text=Welcome back, Old").count()) === 0, "deleted code: no done card on resume");
    // Unknown codes fall back to this device's latest registration (done
    // card) — or a fresh wizard on a clean device. Either way: usable, no error.
    const usable =
      (await page.locator("text=What should we call you?").count()) +
      (await page.locator("text=Welcome back, ").count()) +
      (await page.locator("text=You're in.").count());
    check(usable >= 1, "deleted code: page falls back to a usable state");
  }

  check(errors.length === 0, "no page errors (full run)", errors.join(" | "));
  console.log("\n------------------------------------------------------------");
  console.log(`MINDSET SHIFT PARTICIPANTS (V2): ${fail === 0 ? "ALL CHECKS PASSED" : fail + " CHECK(S) FAILED"}`);
  console.log(`  passed=${pass} failed=${fail}`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
