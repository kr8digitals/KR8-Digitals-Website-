/**
 * MINDSET SHIFT 7.0 — STEP 9: WHATSAPP ACCESS
 *
 * The group link is ADMIN-MANAGED (event.whatsappGroupUrl) and must be
 * rendered ONLY for participants whose status is access_granted while
 * accessEnabled is true. Everything else — registered, share_submitted,
 * needs_resubmission, rejected, or granted-but-link-not-live — sees no
 * link at all. The link appears/removes live (no reload) when the admin
 * changes the event config.
 *
 * Requires the dev server on http://localhost:5173 (npm run dev).
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:5173";
const GROUP_URL = "https://chat.whatsapp.com/MS7TestGroupInvite123";
const REGS_KEY = "kr8_mindset_shift_registrations_v1";
const EVENT_KEY = "kr8_mindset_shift_event_v1";

let pass = 0, fail = 0;
function check(cond, label, detail) {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`); }
}

function seedRegistration(page, over) {
  return page.evaluate(([key, over]) => {
    const regs = JSON.parse(localStorage.getItem(key) || "[]");
    const base = regs[0] || {
      id: `MS7-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      edition: "7.0", fullName: "", email: "", phone: "", whatsapp: "", location: "",
      heardAbout: "", hopingToLearn: "", moneyQuestion: "", biggestChallenge: "",
      debtExperience: "", financialSituation: "", hasFinancialGoal: false, areaToImprove: "",
      status: "registered", proofKey: null, proofData: null, proofSubmittedAt: null,
      adminNote: "", verifiedBy: null, verifiedAt: null,
      createdAt: Date.now(), updatedAt: Date.now(), syncPending: true,
    };
    const now = Date.now();
    const r = { ...base, ...over, updatedAt: now };
    r.id = over.id || r.id;
    const list = regs.length ? regs.map((x, i) => (i === 0 ? r : x)) : [r];
    localStorage.setItem(key, JSON.stringify(list));
    window.dispatchEvent(new Event("kr8:ms-regs-updated"));
    return r.id;
  }, [REGS_KEY, over]);
}

function setEventField(page, patch) {
  return page.evaluate(([key, patch]) => {
    const raw = localStorage.getItem(key);
    const ev = raw ? JSON.parse(raw) : {};
    Object.assign(ev, patch);
    localStorage.setItem(key, JSON.stringify(ev));
    window.dispatchEvent(new Event("kr8:ms-event-updated"));
    return true;
  }, [EVENT_KEY, patch]);
}

const joinLink = (page) => page.getByRole("link", { name: /Join the WhatsApp space/ });

(async () => {
  const browser = await chromium.launch({ headless: true });

  /* ============ 1. Granted participant: link secrecy before grant ============ */
  console.log("\n[device A: Ada — before grant]");
  const ctxA = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const page = await ctxA.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 140)));

  await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);
  await seedRegistration(page, { fullName: "Ada Obi", email: "ada.wa@example.com", phone: "+2348025556667", status: "share_submitted", proofData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", proofSubmittedAt: Date.now() - 600e3 });
  await page.waitForTimeout(600);

  check((await page.locator(`a[href="${GROUP_URL}"]`).count()) === 0, "no link before verification (share_submitted)");
  check((await joinLink(page).count()) === 0, "no join button before verification");
  check(await page.locator("#register").getByText(/never shared before verification/).first().isVisible(), "step 3 pending copy shown");

  /* ============ 2. Granted but link not live yet ============ */
  console.log("\n[device A: Ada — granted, link pending]");
  {
    await seedRegistration(page, { status: "access_granted" });
    await page.waitForTimeout(600);
    check((await joinLink(page).count()) === 0, "no link while group URL not set (granted)");
    check(await page.locator("#register").getByText(/finalising the group invite/).first().isVisible(), "'finalising' note shown to granted participant");
    check((await page.locator(`a[href="${GROUP_URL}"]`).count()) === 0, "group URL not rendered while pending");
  }

  /* ============ 3. Admin goes live -> link appears without reload ============ */
  console.log("\n[device A: Ada — admin enables the link]");
  {
    await setEventField(page, { whatsappGroupUrl: GROUP_URL, accessEnabled: true });
    await page.waitForTimeout(600);
    const link = joinLink(page);
    check((await link.count()) === 1, "join link appears LIVE (no reload)");
    check((await link.first().getAttribute("href")) === GROUP_URL, "href is the admin-managed group URL");
    check((await link.first().getAttribute("target")) === "_blank", "opens in a new tab");
    check(((await link.first().getAttribute("rel")) || "").includes("noopener"), "rel=noopener set");
    await page.locator("#register").screenshot({ path: "tests/shots/ms9-whatsapp-granted.png" });

    // Team disables access -> link disappears live
    await setEventField(page, { accessEnabled: false });
    await page.waitForTimeout(500);
    check((await joinLink(page).count()) === 0, "link removed live when accessEnabled=false");
    await setEventField(page, { accessEnabled: true });
    await page.waitForTimeout(500);
    check((await joinLink(page).count()) === 1, "link restored when re-enabled");
  }

  /* ============ 4. Mobile: link visible + tappable ============ */
  console.log("\n[device A: Ada — mobile]");
  {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    const link = joinLink(page);
    check(await link.first().isVisible(), "link visible at 390px");
    const box = await link.first().boundingBox();
    check(!!box && box.height >= 40, "touch target height >= 40px", box ? `${box.height}px` : "no box");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(overflow <= 0, "no horizontal overflow (mobile)");
  }
  await ctxA.close();

  /* ============ 5. Other devices: link never leaks to non-granted ============ */
  console.log("\n[devices B/C: non-granted participants]");
  for (const [label, status] of [
    ["registered (no proof yet)", "registered"],
    ["awaiting verification", "share_submitted"],
    ["needs resubmission", "needs_resubmission"],
    ["rejected", "rejected"],
  ]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
    const p2 = await ctx.newPage();
    const errs2 = [];
    p2.on("pageerror", (e) => errs2.push(String(e.message).slice(0, 120)));
    await p2.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await p2.waitForTimeout(600);
    await setEventField(p2, { whatsappGroupUrl: GROUP_URL, accessEnabled: true }); // link IS live
    await seedRegistration(p2, { fullName: "Other " + label, status, proofData: status === "registered" ? null : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" });
    await p2.waitForTimeout(600);
    const html = await p2.content();
    check((await p2.locator(`a[href="${GROUP_URL}"]`).count()) === 0, `no link for ${label} (link is live for granted users)`);
    check(!html.includes(GROUP_URL), `group URL string not in rendered DOM for ${label}`);
    check(errs2.length === 0, `no page errors for ${label}`, errs2.join(" | "));
    await ctx.close();
  }

  check(errors.length === 0, "no page errors (device A journey)", errors.join(" | "));

  console.log("\n------------------------------------------------------------");
  console.log(`MINDSET SHIFT WHATSAPP ACCESS: ${fail === 0 ? "ALL CHECKS PASSED" : fail + " CHECK(S) FAILED"}`);
  console.log(`  passed=${pass} failed=${fail}`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
