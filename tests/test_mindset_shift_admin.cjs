/**
 * MINDSET SHIFT 7.0 — STEP 8: ADMIN VERIFICATION
 *
 * Real browser flow:
 *   1. Ada registers on the public page + uploads a real screenshot proof
 *      (full participant journey end-to-end).
 *   2. Bola + Chinedu are seeded through the same data-layer functions the
 *      app uses (registration suite covers the form itself).
 *   3. Admin (founder session + password unlock) opens the new
 *      "Events & Programs → Mindset Shift" section and verifies:
 *        - stats chips, search, status filter
 *        - participant detail (answers + proof image + timestamp)
 *        - approve / request-resubmission / reject with notes
 *        - live re-render (no reload), last-decision record, syncPending
 *        - re-verification (admin changes their mind)
 *        - WhatsApp group link never exposed in the admin list
 *        - participant side reflects the granted state live
 *
 * Requires the dev server on http://localhost:5173 (npm run dev).
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:5173";
const SMALL_PNG = "/tmp/proof-small.png";
const FOUNDER_PW = "KR8@Adm!n2026";

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
  const netErrors = [];
  const httpErrors = [];
  page.on("response", (r) => { if (r.status() >= 400) httpErrors.push(r.status() + " " + r.url()); });
  page.on("console", (m) => {
    const t = m.text();
    if (m.type() !== "error") return;
    // Environment artifacts (no external network in sandbox + unprovisioned
    // Supabase tables, see httpErrors check below):
    if (t.includes("ipapi.co") || t.includes("Failed to load resource: net::ERR_FAILED")) return;
    // HTTP-status resource failures are audited by URL in the final check
    // (supabase.co 4xx/5xx are expected pre-provisioning / offline sandbox).
    if (/Failed to load resource: the server responded with a status of \d{3}/.test(t)) return;
    netErrors.push(t);
  });

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

  /* ============ 1. Ada: real registration + real proof upload ============ */
  console.log("\n[participant: Ada registers + uploads proof]");
  {
    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    const f = (o, v) => page.locator(o).fill(v);
    await f("#ms-fullname", "Ada Obi");
    await f("#ms-email", "ada.admin@example.com");
    await page.locator('#register select[aria-label="Country"]').selectOption("NG");
    await f("#register input[placeholder='Phone number']", "8025556667");
    await page.locator("#ms-heard").selectOption("WhatsApp");
    await f("#ms-hoping", "How to get out of my loan debt");
    await f("#ms-challenge", "Paying interest instead of reducing principal");
    await page.locator("#register").getByRole("button", { name: "Not yet", exact: true }).click();
    await page.locator("#register").getByRole("button", { name: /Register Free/ }).click();
    await page.locator("#register").getByText("You're registered, Ada.").waitFor({ timeout: 10000 });
    check(true, "Ada registered via the public form");
    await page.setInputFiles("#ms-proof-file", SMALL_PNG);
    await page.waitForTimeout(900);
    await page.getByRole("button", { name: "Submit proof" }).click();
    await page.waitForTimeout(700);
    const awaiting = await page.locator("#register").getByText("Awaiting", { exact: false }).count();
    check(awaiting > 0, "Ada's flow shows awaiting-verification state");
  }

  /* ============ 2. Seed Bola + Chinedu via the data layer ============ */
  console.log("\n[participant: Bola + Chinedu seeded]");
  {
    // The bundle is not exposed on window; seed through the same localStorage
    // format the data layer writes (mirrors rows arriving from the cloud).
    const ok = await page.evaluate(() => {
      const key = "kr8_mindset_shift_registrations_v1";
      const regs = JSON.parse(localStorage.getItem(key) || "[]");
      const mk = (over) => {
        const now = Date.now();
        const base = regs[0];
        return Object.assign(
          {
            id: `MS7-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
            edition: base.edition,
            fullName: "", email: "", phone: "", whatsapp: "", location: "",
            heardAbout: "", hopingToLearn: "", moneyQuestion: "", biggestChallenge: "",
            debtExperience: "", financialSituation: "", hasFinancialGoal: false, areaToImprove: "",
            status: "registered", proofKey: null, proofData: null, proofSubmittedAt: null,
            adminNote: "", verifiedBy: null, verifiedAt: null,
            createdAt: now, updatedAt: now, syncPending: true,
          },
          over
        );
      };
      const b = mk({ fullName: "Bola Achebe", email: "bola.admin@example.com", phone: "+2348031112223", heardAbout: "Instagram", hopingToLearn: "Budgeting", biggestChallenge: "Irregular income", status: "share_submitted", proofData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", proofSubmittedAt: Date.now() - 3600e3 });
      const c = mk({ fullName: "Chinedu Okafor", email: "chinedu.admin@example.com", phone: "+2348043334445", heardAbout: "TikTok", hopingToLearn: "Savings discipline", biggestChallenge: "Family expenses", status: "share_submitted", proofData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", proofSubmittedAt: Date.now() - 1800e3 });
      regs.push(b, c);
      localStorage.setItem(key, JSON.stringify(regs));
      window.dispatchEvent(new Event("kr8:ms-regs-updated"));
      return getRegsCount();
      function getRegsCount() { return JSON.parse(localStorage.getItem(key)).length; }
    });
    check(ok === 3, "3 participants present in the store", `got ${ok}`);
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
    check(await page.getByText(/Registration & Proof Verification/).isVisible(), "section heading renders");
    check(await page.getByText("All · 3").isVisible(), "stats: All · 3");
    check(await page.getByText("Awaiting Share Verification · 3").isVisible(), "stats: 3 awaiting verification");
  }

  /* ============ 4. List, search, detail ============ */
  console.log("\n[admin: list + detail]");
  const card = (name) => page.getByRole("button").filter({ hasText: name }).first();
  {
    check(await page.getByText("Ada Obi").first().isVisible(), "Ada listed");
    check(await page.getByText("Bola Achebe").first().isVisible(), "Bola listed");
    check(await page.getByText("Chinedu Okafor").first().isVisible(), "Chinedu listed");
    const adaRow = card("Ada Obi");
    check((await adaRow.textContent()).includes("ada.admin@example.com"), "card shows email");

    // Search
    await page.locator("input[placeholder*='Search name']").fill("bola");
    await page.waitForTimeout(400);
    check(await page.getByText("Bola Achebe").first().isVisible(), "search finds Bola");
    check((await page.getByText("Ada Obi").count()) === 0, "search hides Ada");
    await page.locator("input[placeholder*='Search name']").fill("");
    await page.waitForTimeout(400);

    // Status filter
    await page.getByRole("button", { name: /Awaiting Share Verification ·/ }).click();
    await page.waitForTimeout(400);
    check(await page.getByText("Ada Obi").first().isVisible(), "filter keeps Ada (awaiting)");
    await page.getByRole("button", { name: /Awaiting Share Verification ·/ }).click(); // toggle off
    await page.waitForTimeout(400);

    // Expand Ada: detail + proof image
    await card("Ada Obi").click();
    await page.waitForTimeout(400);
    check(await page.getByText("How to get out of my loan debt").isVisible(), "detail shows hoping-to-learn answer");
    const proofImg = page.locator("img[alt*='proof submitted by Ada']");
    check(await proofImg.count() === 1, "proof image rendered");
    const src = await proofImg.getAttribute("src");
    check(!!src && src.startsWith("data:image"), "proof is the stored data URL");
    check(await page.getByText(/submitted \d{1,2}/).first().isVisible(), "proof timestamp shown");
  }

  /* ============ 5. Approve Ada ============ */
  console.log("\n[admin: approve Ada]");
  {
    // Note textarea inside Ada's expanded panel
    const noteArea = page.locator("textarea").first();
    await noteArea.fill("Screenshot confirmed — full event details visible.");
    await page.getByRole("button", { name: /Approve & grant access/ }).first().click();
    await page.waitForTimeout(600);
    check(await page.getByText("Access granted to Ada").isVisible(), "approve toast shown");
    check(await page.getByText("Access Granted", { exact: true }).first().isVisible(), "status badge now Access Granted (live)");
    check(await page.getByText("Last decision · Kenneth").first().isVisible(), "last decision records verifier");
    check(await page.getByText("Screenshot confirmed").first().isVisible(), "admin note stored + displayed");
    check(await page.getByText("only you and other admins can see this").isVisible(), "note marked internal");
    const syncBadge = await page.getByText("Sync pending").count();
    check(syncBadge > 0, "syncPending queued for cloud push");
    await page.screenshot({ path: "tests/shots/ms8-admin-approved.png", fullPage: false });
  }

  /* ============ 6. Request resubmission from Bola ============ */
  console.log("\n[admin: resubmission request]");
  {
    await card("Bola Achebe").click();
    await page.waitForTimeout(400);
    await page.locator("textarea").first().fill("Please re-upload — the screenshot is cut off at the top.");
    await page.getByRole("button", { name: /Request resubmission/ }).first().click();
    await page.waitForTimeout(600);
    check(await page.getByText("Resubmission requested from Bola").isVisible(), "resubmit toast shown");
    check(await page.getByText("Needs Resubmission", { exact: true }).first().isVisible(), "status badge now Needs Resubmission");
    check(await page.getByText("cut off at the top").first().isVisible(), "resubmit note recorded");
  }

  /* ============ 7. Reject Chinedu, then change the decision ============ */
  console.log("\n[admin: reject + re-verify]");
  {
    await card("Chinedu Okafor").click();
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: /^Reject$/ }).first().click();
    await page.waitForTimeout(600);
    check(await page.getByText("Chinedu Okafor was rejected").isVisible(), "reject toast shown");
    check(await page.getByText("Rejected", { exact: true }).first().isVisible(), "status badge now Rejected");
    // Admin changes their mind — verification controls remain available.
    await page.getByRole("button", { name: /Approve & grant access/ }).first().click();
    await page.waitForTimeout(600);
    check(await page.getByText("Access granted to Chinedu Okafor").isVisible(), "re-verification (approve after reject) works");
  }

  /* ============ 8. Privacy + participant round-trip ============ */
  console.log("\n[privacy + participant round-trip]");
  {
    const adminBody = await page.locator("main").last().textContent();
    check(!/wa\.me\/\d{10,}/.test(adminBody || ""), "WhatsApp group link not exposed in admin list");

    // Ada's participant view now reflects the grant (same localStorage, no reload needed).
    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(900);
    check(await page.locator("#register").getByText("Access Granted", { exact: false }).first().isVisible(), "participant side shows granted state");
    check(errors.length === 0, "no page errors (round-trip)", errors.join(" | "));
    // 404s from supabase.co are EXPECTED in this environment: the cloud
    // tables are provisioned by the admin running MS_SUPABASE_SQL (same
    // pre-existing condition as the `streams` table). What must never
    // happen: a 404 from the app itself.
    const local404s = httpErrors.filter((e) => !e.includes("supabase.co"));
    check(local404s.length === 0, "no 4xx/5xx responses from the app (cloud 404s expected pre-provisioning)", local404s.slice(0, 3).join(" | "));
    check(netErrors.length === 0, "no network console errors (round-trip)", netErrors.slice(0, 2).join(" | "));
  }

  console.log("\n------------------------------------------------------------");
  console.log(`MINDSET SHIFT ADMIN VERIFICATION: ${fail === 0 ? "ALL CHECKS PASSED" : fail + " CHECK(S) FAILED"}`);
  console.log(`  passed=${pass} failed=${fail} pageErrors=${errors.length}`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
