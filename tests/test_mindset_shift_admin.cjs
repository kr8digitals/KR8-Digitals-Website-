/**
 * MINDSET SHIFT 7.0 — ADMIN (v2: participants & access, no share gate)
 *
 * Real browser flow:
 *   1. Ada completes the adaptive onboarding on the public page → access
 *      is granted immediately (no proof step exists anymore).
 *   2. Bola (granted), Chinedu (legacy share_submitted WITH proof image),
 *      Emeka (revoked) and Ngozi (rejected) are seeded via the data layer.
 *   3. Founder admin opens "Events & Programs → Mindset Shift →
 *      Participants" and verifies:
 *        - chips + search (name, code, city) + edition filter
 *        - onboarding answers in the detail panel (speaker's context)
 *        - moderation: moderation note + Reject participant (granted rows)
 *        - revoke with confirm; legacy rows keep approve/resubmit/reject
 *        - CSV export (BOM + CRLF + new columns) via a real download
 *        - privacy: group link never rendered in the admin list
 *        - participant side reflects the revocation live
 *
 * Requires the dev server on http://localhost:5173 (npm run dev).
 */
const { chromium } = require("playwright");
const fs = require("fs");

const BASE = "http://localhost:5173";
const REGS_KEY = "kr8_mindset_shift_registrations_v1";
const EVENT_KEY = "kr8_mindset_shift_event_v1";
const FOUNDER_PW = "KR8@Adm!n2026";
const PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

let pass = 0, fail = 0;
function check(cond, label, detail) {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`); }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 140)));
  page.on("dialog", (d) => d.accept()); // auto-confirm revoke/delete

  // Seed the founder session (used by the two-step admin gate).
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
  }, FOUNDER_PW);

  /* ============ 1. Ada: real adaptive onboarding ============ */
  console.log("\n[participant: Ada completes onboarding]");
  {
    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    await page.getByPlaceholder(/Your name/).fill("Ada Obi");
    await page.getByRole("button", { name: "Continue" }).first().click();
    await page.waitForTimeout(120);
    await page.getByRole("button", { name: "I'm trying to get out of debt" }).first().click();
    await page.waitForTimeout(120);
    await page.getByRole("button", { name: "Loan app or card" }).first().click();
    await page.waitForTimeout(120);
    await page.getByRole("button", { name: "A couple of years" }).first().click();
    await page.waitForTimeout(120);
    await page.getByRole("button", { name: "It's heavy — and I don't talk about it" }).first().click();
    await page.waitForTimeout(120);
    await page.getByPlaceholder(/My money never lasts/).fill("Paying interest instead of reducing principal.");
    await page.getByRole("button", { name: "Continue" }).first().click();
    await page.waitForTimeout(120);
    await page.getByRole("button", { name: "Yes, I am" }).click();
    await page.waitForTimeout(120);
    await page.getByRole("button", { name: "Paying off debt" }).first().click();
    await page.waitForTimeout(120);
    await page.getByRole("button", { name: "Skip for now" }).click();
    await page.waitForTimeout(120);
    await page.getByLabel("Email *").fill("ada.admin@example.com");
    await page.getByLabel("Phone number").fill("8025556667");
    await page.getByLabel("How did you find this? *").selectOption("WhatsApp");
    await page.getByRole("button", { name: "Continue" }).first().click();
    await page.waitForTimeout(120);
    await page.getByRole("button", { name: "Save My Seat" }).click();
    await page.waitForTimeout(500);
    check(await page.getByText("You're in, Ada.", { exact: false }).isVisible(), "Ada onboarded — graduation shown");
  }

  /* ============ 2. Seed the rest via the data layer ============ */
  console.log("\n[participant: seed Bola, Chinedu, Emeka, Ngozi]");
  {
    const ok = await page.evaluate(({ rk, png }) => {
      const key = rk;
      const regs = JSON.parse(localStorage.getItem(key) || "[]");
      const now = Date.now();
      const base = {
        id: "",
        edition: "7.0",
        fullName: "", email: "", phone: "", whatsapp: "", location: "",
        heardAbout: "", hopingToLearn: "", moneyQuestion: "", biggestChallenge: "",
        debtExperience: "", financialSituation: "", hasFinancialGoal: false, areaToImprove: "",
        whyHere: "", debtDuration: "", moneyStress: "",
        status: "access_granted",
        proofKey: null, proofData: null, proofSubmittedAt: null,
        adminNote: "", verifiedBy: null, verifiedAt: null,
        createdAt: now - 7200000, updatedAt: now - 3600000, syncPending: true,
      };
      const add = (over) => {
        const r = Object.assign({}, base, over, {
          id: `MS7-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        });
        regs.push(r);
        return r;
      };
      add({
        fullName: "Bola Achebe", email: "bola.admin@example.com", phone: "+2348031112223",
        heardAbout: "Instagram", location: "Port Harcourt", whyHere: "Money never seems to last, no matter how much I make",
        financialSituation: "Steady, but little left at the end of the month",
        moneyStress: "It's okay. I'm mostly in control",
        biggestChallenge: "Irregular income", hopingToLearn: "Budgeting",
        hasFinancialGoal: true, areaToImprove: "Saving consistently",
      });
      add({
        fullName: "Chinedu Okafor", email: "chinedu.admin@example.com", phone: "+2348043334445",
        heardAbout: "TikTok", location: "Abuja", status: "share_submitted",
        proofData: png, proofSubmittedAt: now - 1800000,
        biggestChallenge: "Family expenses", hopingToLearn: "Savings discipline",
      });
      add({
        fullName: "Emeka Eze", email: "emeka.admin@example.com", phone: "+2348055556667",
        status: "registered", adminNote: "Flagged for follow-up.", verifiedBy: "Kenneth",
        verifiedAt: now - 600000, biggestChallenge: "Owning a home feels impossible",
      });
      add({
        fullName: "Ngozi Udo", email: "ngozi.admin@example.com", phone: "+2348066667778",
        status: "rejected", adminNote: "Duplicate of another account.", verifiedBy: "Kenneth",
        verifiedAt: now - 5400000,
      });
      localStorage.setItem(key, JSON.stringify(regs));
      window.dispatchEvent(new Event("kr8:ms-regs-updated"));
      // event config: group link set (privacy target) + on
      const ev = JSON.parse(localStorage.getItem("kr8_mindset_shift_event_v1") || "{}");
      ev.whatsappGroupUrl = "https://chat.whatsapp.com/MS7-SECRET-LINK-XYZ";
      ev.accessEnabled = true;
      localStorage.setItem("kr8_mindset_shift_event_v1", JSON.stringify(ev));
      window.dispatchEvent(new Event("kr8:ms-event-updated"));
      return JSON.parse(localStorage.getItem(key)).length;
    }, { rk: REGS_KEY, png: PNG });
    check(ok === 5, "5 participants present in the store", `got ${ok}`);
  }

  /* ============ 3. Admin: open the Mindset Shift section ============ */
  console.log("\n[admin: section access]");
  {
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
    const tab = page.getByRole("button", { name: /Mindset Shift/ });
    check(await tab.count() > 0, "Mindset Shift appears in admin nav");
    await tab.first().click();
    await page.waitForTimeout(600);
    await page.getByRole("button", { name: "Participants", exact: true }).click();
    await page.waitForTimeout(500);
    check(await page.getByText(/Participants & Access/).isVisible(), "section heading: 'Participants & Access'");
    check(await page.getByText("All · 5").isVisible(), "chip: All · 5");
    check(await page.getByText("Access Granted · 2").isVisible(), "chip: 2 access-granted (Ada + Bola)");
    check(await page.getByText("Awaiting Share Verification · 1").isVisible(), "chip: 1 legacy awaiting (Chinedu)");
    check(await page.getByText("No Access (revoked) · 1").isVisible(), "chip: 1 revoked (Emeka)");
    check(await page.getByText("Rejected · 1").isVisible(), "chip: 1 rejected (Ngozi)");
  }

  const card = (name) => page.getByRole("button").filter({ hasText: name }).first();

  /* ============ 4. List + search + detail (Ada) ============ */
  console.log("\n[admin: list + search + detail]");
  {
    check(await page.getByText("Ada Obi").first().isVisible(), "Ada listed");
    const adaRow = card("Ada Obi");
    check((await adaRow.textContent()).includes("ada.admin@example.com"), "row shows email");

    // Search by name
    await page.locator("input[placeholder*='Search name']").fill("bola");
    await page.waitForTimeout(400);
    check(await page.getByText("Bola Achebe").first().isVisible(), "search finds Bola");
    check((await page.getByText("Ada Obi").count()) === 0, "search hides Ada");
    // Search by confirmation code
    const adaCode = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "[]").find((r) => r.email === "ada.admin@example.com").id, REGS_KEY);
    await page.locator("input[placeholder*='Search name']").fill(adaCode);
    await page.waitForTimeout(400);
    check(await page.getByText("Ada Obi").first().isVisible(), "search finds Ada by confirmation code");
    // Search by city
    await page.locator("input[placeholder*='Search name']").fill("port harcourt");
    await page.waitForTimeout(400);
    check(await page.getByText("Bola Achebe").first().isVisible(), "search finds by city");
    await page.locator("input[placeholder*='Search name']").fill("");
    await page.waitForTimeout(400);

    // Status filter chip
    await page.getByRole("button", { name: /Awaiting Share Verification ·/ }).click();
    await page.waitForTimeout(400);
    check(await page.getByText("Chinedu Okafor").first().isVisible(), "filter shows only the legacy awaiting row");
    check((await page.getByText("Ada Obi").count()) === 0, "filter hides granted rows");
    await page.getByRole("button", { name: /Awaiting Share Verification ·/ }).click();
    await page.waitForTimeout(400);

    // Expand Ada: onboarding answers (speaker's context)
    await card("Ada Obi").click();
    await page.waitForTimeout(400);
    const detail = page.locator("div.space-y-5").first();
    check((await detail.getByText("Why they came").count()) === 1, "detail: 'Why they came' label");
    check((await detail.getByText("I'm trying to get out of debt").count()) === 1, "detail: why answer shown");
    check((await detail.getByText("Money stress at home").count()) === 1, "detail: stress label");
    check((await detail.getByText("It's heavy — and I don't talk about it").count()) === 1, "detail: stress answer shown");
    check((await detail.getByText("Debt experience").count()) === 1 && (await detail.getByText("Loan app or card").count()) === 1,
      "detail: debt type shown");
    check((await detail.getByText("Debt duration").count()) === 1 && (await detail.getByText("A couple of years").count()) === 1,
      "detail: debt duration shown");
    check((await detail.getByText("Paying interest instead of reducing principal.").count()) === 1,
      "detail: challenge verbatim");
    check((await detail.getByText("No proof image stored.").count()) === 1, "detail: no proof (new model)");
    check((await detail.getByRole("button", { name: "Reject participant" }).count()) === 1,
      "granted row offers 'Reject participant' (no approve/resubmit)");
    check((await detail.getByRole("button", { name: "Approve & grant access" }).count()) === 0,
      "granted row has no approve button");
    check((await detail.getByRole("button", { name: "Revoke access" }).count()) === 1,
      "granted row offers 'Revoke access'");
    check((await detail.getByRole("button", { name: "Delete registration" }).count()) === 1,
      "row offers 'Delete registration'");
  }

  /* ============ 5. Revoke Ada (confirm + live badge) ============ */
  console.log("\n[admin: revoke Ada]");
  {
    const detail = page.locator("div.space-y-5").first();
    await detail.locator("textarea").fill("Duplicate sign-in detected from a second device.");
    await detail.getByRole("button", { name: "Revoke access" }).click();
    await page.waitForTimeout(600);
    check(await page.getByText("Access revoked for Ada Obi.").isVisible(), "revoke toast shown");
    check(await page.getByText("No Access (revoked)", { exact: true }).first().isVisible(), "badge flips to No Access (revoked)");
    check((await page.getByText("Duplicate sign-in detected from a second device.").count()) >= 1,
      "moderation note recorded in the history panel");
    check((await page.getByText("only you and other admins can see this").count()) >= 1,
      "note marked internal");
  }

  /* ============ 6. Legacy row: Chinedu keeps the full verification set ============ */
  console.log("\n[admin: legacy proof row]");
  {
    await card("Chinedu Okafor").click();
    await page.waitForTimeout(400);
    const detail = page.locator("div.space-y-5").first();
    const proofImg = detail.locator("img[alt*='proof submitted by Chinedu']");
    check((await proofImg.count()) === 1, "legacy proof image rendered");
    check((await proofImg.getAttribute("src")) === PNG, "proof is the stored data URL");
    check((await detail.getByRole("button", { name: "Approve & grant access" }).count()) === 1, "legacy row: approve available");
    check((await detail.getByRole("button", { name: "Request resubmission" }).count()) === 1, "legacy row: resubmit available");
    check((await detail.getByRole("button", { name: /^Reject$/ }).count()) === 1, "legacy row: reject available");
    await detail.locator("textarea").fill("Screenshot confirmed — full event details visible.");
    await detail.getByRole("button", { name: "Approve & grant access" }).click();
    await page.waitForTimeout(600);
    check(await page.getByText("Access granted to Chinedu Okafor.").isVisible(), "legacy approve toast");
    check(await page.getByText("Last decision · Kenneth").first().isVisible(), "last decision records verifier");
  }

  /* ============ 7. Revoked row (Emeka): no access actions beyond moderation ============ */
  console.log("\n[admin: revoked row Emeka]");
  {
    await card("Emeka Eze").click();
    await page.waitForTimeout(400);
    const detail = page.locator("div.space-y-5").first();
    check((await detail.getByText("This participant currently has no access.").count()) === 1,
      "revoked row explains there is no access to revoke");
    check((await detail.getByRole("button", { name: "Revoke access" }).count()) === 0, "no 'Revoke access' on a revoked row");
    check((await detail.getByText("Flagged for follow-up.").count()) === 1, "previous admin note visible");
    check((await detail.getByRole("button", { name: "Delete registration" }).count()) === 1, "delete still available");
  }

  /* ============ 8. Delete Ngozi ============ */
  console.log("\n[admin: delete]");
  {
    await card("Ngozi Udo").click();
    await page.waitForTimeout(400);
    const detail = page.locator("div.space-y-5").first();
    await detail.getByRole("button", { name: "Delete registration" }).click();
    await page.waitForTimeout(600);
    check(await page.getByText("Ngozi Udo's registration was deleted.").isVisible(), "delete toast");
    // Deletions are tombstoned (deletedAt) for cloud sync — the ACTIVE
    // count is what matters; the raw row stays until the cloud prune.
    const n = await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k) || "[]").filter((r) => !r.deletedAt).length,
      REGS_KEY
    );
    check(n === 4, "active registrations now 4 (tombstone kept for sync)", `got ${n}`);
    check((await card("Ngozi Udo").count()) === 0, "row removed from the list");
  }

  /* ============ 9. Edition filter ============ */
  console.log("\n[admin: edition filter]");
  {
    await page.evaluate(({ rk }) => {
      const regs = JSON.parse(localStorage.getItem(rk) || "[]");
      const old = regs[1];
      old.edition = "6.0";
      localStorage.setItem(rk, JSON.stringify(regs));
      window.dispatchEvent(new Event("kr8:ms-regs-updated"));
    }, { rk: REGS_KEY });
    await page.waitForTimeout(500);
    const sel = page.locator("select[aria-label='Filter by edition']");
    check((await sel.count()) === 1, "edition select appears once a second edition exists");
    await sel.selectOption("6.0");
    await page.waitForTimeout(400);
    check(await page.getByText("Bola Achebe").first().isVisible(), "edition filter keeps the 6.0 row");
    check((await page.getByText("Ada Obi").count()) === 0, "edition filter hides 7.0 rows");
    await sel.selectOption("all");
    await page.waitForTimeout(400);
  }

  /* ============ 10. CSV export (real download) ============ */
  console.log("\n[admin: CSV export]");
  {
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 10000 }),
      page.getByRole("button", { name: /Export CSV/ }).click(),
    ]);
    await page.waitForTimeout(300);
    check(await page.getByText("Exported 4 participants to CSV.").isVisible(), "CSV toast with filtered count");
    const path = await download.path();
    const raw = fs.readFileSync(path);
    const text = raw.toString("utf8");
    check(raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf, "BOM present (Excel-safe)");
    check(text.includes("\r\n"), "CRLF line endings");
    const header = text.split("\r\n")[0];
    for (const col of ["whyHere", "debtDuration", "moneyStress", "biggestChallenge", "status"]) {
      check(header.includes(col), `CSV header includes '${col}'`);
    }
    const rows = text.trim().split("\r\n").length - 1;
    check(rows === 4, "one data row per filtered participant", `got ${rows}`);
    check(text.includes("Paying interest instead of reducing principal."), "CSV carries the onboarding answers");
  }

  /* ============ 11. Privacy: group link never in the admin list ============ */
  console.log("\n[privacy]");
  {
    const adminBody = await page.locator("main").last().textContent();
    check(!/MS7-SECRET-LINK-XYZ/.test(adminBody || ""), "WhatsApp group link not exposed in the admin list");
    check(!/wa\.me\/\d{10,}/.test(adminBody || ""), "no direct wa.me link in the admin list");
  }

  /* ============ 12. Participant side reflects the revocation ============ */
  console.log("\n[participant round-trip]");
  {
    // Make Ada the latest registration on this device so the public page
    // shows HER state (the admin approvals above moved other rows forward).
    await page.evaluate((k) => {
      const regs = JSON.parse(localStorage.getItem(k) || "[]");
      const ada = regs.find((r) => r.email === "ada.admin@example.com");
      ada.updatedAt = Date.now();
      localStorage.setItem(k, JSON.stringify(regs));
    }, REGS_KEY);
    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(900);
    check((await page.locator("text=Welcome back, Ada.").count()) === 1, "Ada's done card on the public page");
    check((await page.locator("text=Your access is paused.").count()) === 1, "revocation visible on the participant side (live)");
    check((await page.getByRole("button", { name: "Complete onboarding again" }).count()) === 1,
      "restore path: 'Complete onboarding again' CTA");
    check(errors.length === 0, "no page errors (round-trip)", errors.join(" | "));
  }

  console.log("\n------------------------------------------------------------");
  console.log(`MINDSET SHIFT ADMIN (V2): ${fail === 0 ? "ALL CHECKS PASSED" : fail + " CHECK(S) FAILED"}`);
  console.log(`  passed=${pass} failed=${fail} pageErrors=${errors.length}`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
