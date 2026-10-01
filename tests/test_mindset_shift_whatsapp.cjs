/**
 * MINDSET SHIFT 7.0 — WHATSAPP LINK SECRECY (v2)
 *
 * The group link is admin-managed and only rendered for participants
 * whose access is live (onboarding completed + link set + switch on).
 * It must never appear in the page for unregistered visitors, revoked
 * or rejected participants, or when the switch is off / URL empty.
 *
 * Requires the dev server on http://localhost:5173 (npm run dev).
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:5173";
const REGS_KEY = "kr8_mindset_shift_registrations_v1";
const EVENT_KEY = "kr8_mindset_shift_event_v1";
const URL_A = "https://chat.whatsapp.com/MS7-Space-A1";
const URL_B = "https://chat.whatsapp.com/MS7-Space-B2";

let pass = 0, fail = 0;
function check(cond, label, detail) {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`); }
}

async function seed(page, { event, regs }) {
  await page.evaluate(
    ({ ek, rk, ev, rs }) => {
      if (ev !== undefined) {
        const cur = JSON.parse(localStorage.getItem(ek) || "{}");
        localStorage.setItem(ek, JSON.stringify({ ...cur, ...ev }));
      }
      if (rs !== undefined) localStorage.setItem(rk, JSON.stringify(rs));
      window.dispatchEvent(new Event("kr8:ms-event-updated"));
      window.dispatchEvent(new Event("kr8:ms-regs-updated"));
    },
    { ek: EVENT_KEY, rk: REGS_KEY, ev: event, rs: regs }
  );
  await page.waitForTimeout(450);
}

const reg = (over = {}) => ({
  id: "MS7-SEED0001",
  fullName: "Seed Sitter",
  email: "seed@example.com",
  phone: "08000000001",
  edition: "7.0",
  status: "access_granted",
  whatsappGroupUrl: "",
  source: "Friend or family",
  biggestChallenge: "",
  hopingToLearn: "",
  hasFinancialGoal: false,
  areaToImprove: "",
  whyHere: "I'm trying to get out of debt",
  debtExperience: "Loan app or card",
  debtDuration: "A couple of years",
  moneyStress: "It's heavy — and I don't talk about it",
  moneyQuestion: "",
  location: "",
  createdAt: Date.now() - 86400000,
  updatedAt: Date.now() - 3600000,
  ...over,
});

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 140)));

  const domLeak = async (url) => {
    const html = await page.locator("body").innerHTML();
    return html.includes(url);
  };

  /* ============ 1. Unregistered visitor: nothing leaks ============ */
  console.log("\n[whatsapp: unregistered visitor]");
  await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);
  await seed(page, { event: { whatsappGroupUrl: URL_A, accessEnabled: true } });
  check((await page.locator(`a[href='${URL_A}']`).count()) === 0, "no group link for unregistered visitors");
  check((await domLeak(URL_A)) === false, "group URL string absent from the entire DOM");
  check((await page.locator("a[href*='chat.whatsapp.com']").count()) === 0, "no chat.whatsapp.com anchor anywhere");

  /* ============ 2. Access-granted participant: link appears ============ */
  console.log("\n[whatsapp: granted participant]");
  await seed(page, { regs: [reg()] });
  check((await page.locator(`a[href='${URL_A}']`).count()) === 1, "link rendered for the access-granted participant");
  const join = page.getByRole("link", { name: "Join the WhatsApp space" });
  check(await join.isVisible(), "'Join the WhatsApp space' button visible");
  check((await join.getAttribute("target")) === "_blank", "opens in a new tab");

  /* ============ 3. Admin edits the URL: public follows live ============ */
  console.log("\n[whatsapp: admin URL edit]");
  await seed(page, { event: { whatsappGroupUrl: URL_B } });
  check((await page.locator(`a[href='${URL_B}']`).count()) === 1, "link follows the new admin URL live");
  check((await page.locator(`a[href='${URL_A}']`).count()) === 0, "old URL no longer rendered");

  /* ============ 4. Switch off: link disappears even when granted ============ */
  console.log("\n[whatsapp: switch off]");
  await seed(page, { event: { accessEnabled: false } });
  check((await page.locator(`a[href*='chat.whatsapp.com']`).count()) === 0, "switch off hides the link from granted participants");
  check((await page.locator("text=finalising the group invite").count()) === 1, "switch off shows the 'finalising' note");

  /* ============ 5. Empty URL: no link, no leak ============ */
  console.log("\n[whatsapp: empty URL]");
  await seed(page, { event: { accessEnabled: true, whatsappGroupUrl: "" } });
  check((await page.locator("a[href*='whatsapp']").count()) === 0, "empty URL renders no anchor");
  check((await page.locator("text=finalising the group invite").count()) === 1, "empty URL shows the 'finalising' note");

  /* ============ 6. Revoked: link removed immediately ============ */
  console.log("\n[whatsapp: revoked]");
  await seed(page, { event: { whatsappGroupUrl: URL_A, accessEnabled: true } });
  await seed(page, { regs: [reg({ status: "registered" })] });
  check((await page.locator(`a[href*='chat.whatsapp.com']`).count()) === 0, "revoked participant: link gone immediately");
  check((await page.locator("text=Your access is paused.").count()) === 1, "revoked: paused state shown");

  /* ============ 7. Rejected: no link, no re-onboard loophole ============ */
  console.log("\n[whatsapp: rejected]");
  await seed(page, { regs: [reg({ status: "rejected" })] });
  check((await page.locator(`a[href*='chat.whatsapp.com']`).count()) === 0, "rejected participant: no link");
  check((await page.locator("text=This registration was rejected.").count()) === 1, "rejected: final message shown");

  /* ============ 8. Legacy statuses: link only after re-onboarding ============ */
  console.log("\n[whatsapp: legacy rows]");
  for (const st of ["share_submitted", "needs_resubmission", "registered"]) {
    await seed(page, { regs: [reg({ status: st })] });
    check((await page.locator(`a[href*='chat.whatsapp.com']`).count()) === 0,
      `legacy '${st}': no link before re-onboarding`);
  }
  // re-onboard one legacy row through the UI: wizard completes → link back
  await page.getByRole("button", { name: /Complete onboarding/ }).first().click();
  await page.waitForTimeout(300);
  await page.getByPlaceholder(/Your name/).fill("Legacy Legacy");
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(120);
  await page.getByRole("button", { name: "I'm just curious (I might be braver than I look)" }).click();
  await page.waitForTimeout(120);
  await page.getByRole("button", { name: "It's heavy — and I don't talk about it" }).click();
  await page.waitForTimeout(120);
  await page.getByPlaceholder(/My money never lasts/).fill("Re-onboarding to get back in.");
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(120);
  await page.getByRole("button", { name: "Not yet" }).click();
  await page.waitForTimeout(120);
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(120);
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.waitForTimeout(120);
  await page.getByLabel("Email *").fill("seed@example.com");
  await page.getByLabel("Phone number").fill("08000000001");
  await page.getByLabel("How did you find this? *").selectOption("Friend or family");
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(120);
  await page.getByRole("button", { name: "Save My Seat" }).click();
  await page.waitForTimeout(500);
  const regsAfter = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "[]"), REGS_KEY);
  check(regsAfter.length === 1 && regsAfter[0].status === "access_granted",
    "re-onboarding restores access on the SAME record (dedupe)");
  check((await page.locator(`a[href='${URL_A}']`).count()) === 1, "link is live again after re-onboarding");

  /* ============ 9. Unregistered again after wipe ============ */
  console.log("\n[whatsapp: clean state stays clean]");
  await page.evaluate((k) => localStorage.removeItem(k), REGS_KEY);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  check((await page.locator(`a[href*='chat.whatsapp.com']`).count()) === 0, "fresh visitor: still no link");

  check(errors.length === 0, "no page errors", errors.join(" | "));
  console.log("\n------------------------------------------------------------");
  console.log(`MINDSET SHIFT WHATSAPP SECRECY (V2): ${fail === 0 ? "ALL CHECKS PASSED" : fail + " CHECK(S) FAILED"}`);
  console.log(`  passed=${pass} failed=${fail}`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
