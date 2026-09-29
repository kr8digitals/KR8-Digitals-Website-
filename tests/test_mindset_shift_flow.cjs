/**
 * MINDSET SHIFT 7.0 — STEP 5: POST-REGISTRATION ACCESS FLOW (functional browser test)
 *
 * The share-before-WhatsApp journey, rendered live from registration status:
 *   1. registered           → step 1 active (flyer card + save hint), 2/3 locked
 *   2. share_submitted      → step 1 done, step 2 "with the team", 3 locked
 *   3. needs_resubmission   → step 2 active, "fresh screenshot needed"
 *   4. rejected             → step 2 error state
 *   5. access_granted       → all done, "You're in"
 *   6. LIVE: status change from admin (localStorage + event) re-renders w/o reload
 *   7. SECURITY: admin's WhatsApp group link NEVER appears while unverified
 *   8. Mobile: fits, no overflow
 *
 * Requires the dev server on http://localhost:5173 (npm run dev).
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:5173";
let failures = 0;
const ok = (n) => console.log(`  \u2713 ${n}`);
const bad = (n, d) => { failures++; console.log(`  \u2717 ${n}${d ? " — " + d : ""}`); };
const check = (cond, name, detail) => (cond ? ok(name) : bad(name, detail));

async function openFlow(browser, viewport = { width: 1280, height: 1100 }) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${BASE}/mindset-shift`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  // Register Ada via the form (real flow)
  await page.locator("#ms-fullname").fill("Ada Obi");
  await page.locator("#ms-email").fill("ada.flow@example.com");
  await page.locator('#register select[aria-label="Country"]').selectOption("NG");
  await page.locator("#register input[placeholder='Phone number']").fill("8021112223");
  await page.locator("#ms-heard").selectOption("Instagram");
  await page.locator("#ms-hoping").fill("Clearing my debt with a real plan.");
  await page.locator("#ms-challenge").fill("Debt is eating my savings.");
  await page.locator("#register").getByRole("button", { name: "Not yet", exact: true }).click();
  await page.locator("#register").getByRole("button", { name: /Register Free/ }).click();
  await page.waitForTimeout(600);
  return { ctx, page, errors };
}

async function setStatus(page, status, extra = {}) {
  return page.evaluate(
    ([status, extra]) => {
      const key = "kr8_mindset_shift_registrations_v1";
      const regs = JSON.parse(localStorage.getItem(key) || "[]");
      if (!regs.length) return false;
      Object.assign(regs[0], { status }, extra);
      localStorage.setItem(key, JSON.stringify(regs));
      window.dispatchEvent(new Event("kr8:ms-regs-updated"));
      return true;
    },
    [status, extra]
  );
}

async function setEventField(page, patch) {
  return page.evaluate((patch) => {
    const key = "kr8_mindset_shift_event_v1";
    const raw = localStorage.getItem(key);
    const ev = raw ? JSON.parse(raw) : { whatsappGroupUrl: "", accessEnabled: true };
    Object.assign(ev, patch);
    localStorage.setItem(key, JSON.stringify(ev));
    window.dispatchEvent(new Event("kr8:ms-event-updated"));
    return true;
  }, patch);
}

const flow = (page) => page.locator("#register");

(async () => {
  const browser = await chromium.launch({ headless: true });

  /* ============ 1. registered: step 1 active ============ */
  console.log("\n[status: registered]");
  {
    const { page, ctx, errors } = await openFlow(browser);
    const f = flow(page);
    check(await f.getByText("Your path to WhatsApp access").isVisible(), "flow header visible");
    check(await f.getByText("Share the event").first().isVisible(), "step 1 'Share the event' visible");
    const flyer = f.locator("img[alt*='save and share']");
    const flyerOk = await flyer.evaluate((el) => el.naturalWidth > 50 && el.complete).catch(() => false);
    check(flyerOk, "flyer share card renders in step 1");
    check(await f.getByText("Long-press (mobile) or right-click (desktop)", { exact: false }).isVisible(), "save-the-flyer hint shown");
    check(await f.getByText("upload a screenshot of your share below", { exact: false }).isVisible(), "step 2 pending copy shown");
    check(await f.getByText("never shared before", { exact: false }).isVisible(), "step 3 pending copy shown");
    check(errors.length === 0, "no page errors", errors.join(" | "));
    await ctx.close();
  }

  /* ============ 2. share_submitted ============ */
  console.log("\n[status: share_submitted]");
  {
    const { page, ctx, errors } = await openFlow(browser);
    const f = flow(page);
    check(await setStatus(page, "share_submitted", { proofSubmittedAt: Date.now() }), "status set to share_submitted");
    await page.waitForTimeout(500);
    check(await f.getByText("Done — you shared the event.").isVisible(), "step 1 marked done");
    check(await f.getByText("Your screenshot is with the team.").isVisible(), "step 2 awaiting copy shown");
    check(await f.getByText("never shared before", { exact: false }).isVisible(), "step 3 still locked copy");
    check(errors.length === 0, "no page errors", errors.join(" | "));
    await ctx.close();
  }

  /* ============ 3. needs_resubmission ============ */
  console.log("\n[status: needs_resubmission]");
  {
    const { page, ctx, errors } = await openFlow(browser);
    const f = flow(page);
    await setStatus(page, "needs_resubmission");
    await page.waitForTimeout(500);
    check(await f.getByText("Done — you shared the event.").isVisible(), "share still marked done");
    check(await f.getByText("a fresh one is needed", { exact: false }).isVisible(), "resubmission copy shown");
    check(errors.length === 0, "no page errors", errors.join(" | "));
    await ctx.close();
  }

  /* ============ 4. rejected ============ */
  console.log("\n[status: rejected]");
  {
    const { page, ctx, errors } = await openFlow(browser);
    const f = flow(page);
    await setStatus(page, "rejected");
    await page.waitForTimeout(500);
    check(await f.getByText("registration was rejected", { exact: false }).isVisible(), "rejection copy shown");
    check(errors.length === 0, "no page errors", errors.join(" | "));
    await ctx.close();
  }

  /* ============ 5. access_granted + SECURITY: link hidden ============ */
  console.log("\n[status: access_granted + link secrecy]");
  {
    const { page, ctx, errors } = await openFlow(browser);
    const f = flow(page);
    // Admin has set the group link — it must NOT be visible while unverified
    await setEventField(page, { whatsappGroupUrl: "https://chat.whatsapp.com/SECRET-TEST-LINK", accessEnabled: true });
    await page.waitForTimeout(400);
    let html = await page.content();
    check(!html.includes("SECRET-TEST-LINK"), "SECURITY: WhatsApp group link hidden while status=registered");

    await setStatus(page, "access_granted", { verifiedAt: Date.now(), verifiedBy: "admin-test" });
    await page.waitForTimeout(500);
    check(await f.getByText("You're in.").isVisible(), "access granted copy shown");
    check(await f.getByText("Verified — share confirmed by the team.").isVisible(), "step 2 done copy");
    check(await f.getByText("Done — you shared the event.").isVisible(), "step 1 done copy");
    html = await page.content();
    // STEP 9: the admin-managed link now IS delivered to granted participants.
    check(html.includes("https://chat.whatsapp.com/SECRET-TEST-LINK"), "STEP 9: link delivered to granted participant (admin-managed URL rendered)");
    check(errors.length === 0, "no page errors", errors.join(" | "));

    await page.screenshot({ path: "tests/shots/ms7-flow-granted.png", fullPage: false });
    await ctx.close();
  }

  /* ============ 6. LIVE re-render without reload ============ */
  console.log("\n[live status change]");
  {
    const { page, ctx, errors } = await openFlow(browser);
    const f = flow(page);
    check(await f.getByText("Share the event").first().isVisible(), "starts at step 1 active");
    check(await setStatus(page, "share_submitted"), "admin sets share_submitted live");
    await page.waitForTimeout(500);
    check(await f.getByText("Your screenshot is with the team.").isVisible(), "UI re-rendered live (no reload)");
    check(await f.getByText("Done — you shared the event.").isVisible(), "step 1 now done (live)");
    check(errors.length === 0, "no page errors", errors.join(" | "));
    await ctx.close();
  }

  /* ============ 8. Mobile ============ */
  console.log("\n[mobile 390x844]");
  {
    const { page, ctx, errors } = await openFlow(browser, { width: 390, height: 844 });
    const f = flow(page);
    check(await f.getByText("Your path to WhatsApp access").isVisible(), "flow visible on mobile");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(overflow <= 1, "no horizontal overflow", `overflow=${overflow}px`);
    await page.screenshot({ path: "tests/shots/ms7-flow-mobile.png", fullPage: false });
    check(errors.length === 0, "no page errors (mobile)", errors.join(" | "));
    await ctx.close();
  }

  await browser.close();

  console.log("\n" + "-".repeat(60));
  if (failures > 0) {
    console.log(`MINDSET SHIFT ACCESS FLOW: ${failures} CHECK(S) FAILED`);
    process.exit(1);
  }
  console.log("MINDSET SHIFT ACCESS FLOW: ALL CHECKS PASSED");
  console.log("-".repeat(60));
})().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
