/**
 * MINDSET SHIFT 7.0 — STEP 7: SCREENSHOT PROOF UPLOAD (functional browser test)
 *
 * Manual-verification proof flow:
 *   1. registered → upload dropzone visible
 *   2. non-image file rejected with clear message
 *   3. >10MB file rejected with size message
 *   4. happy path: select → preview → submit → status share_submitted,
 *      proof stored (data URL + idb key + timestamp), syncPending
 *   5. DOUBLE-PROOF guard: no second upload while awaiting verification
 *   6. needs_resubmission → upload reappears ("new screenshot"),
 *      resubmit replaces proof + clears admin note + back to share_submitted
 *   7. downscaling: 2000px PNG stored as JPEG <=1400px wide (small payload)
 *   8. share_submitted/access_granted → stored proof displayed, no upload
 *   9. no page errors; localStorage stays within budget
 *
 * Requires the dev server on http://localhost:5173 (npm run dev).
 */
const { chromium } = require("playwright");
const fs = require("fs");

const BASE = "http://localhost:5173";
const SMALL_PNG = "/tmp/proof-small.png";
const LARGE_PNG = "/tmp/proof-large2.png"; // 2000x1200
const TEXT_FILE = "/tmp/notimage.txt";
const BIG_FILE = "/tmp/bigfake.png"; // 11MB

let failures = 0;
const ok = (n) => console.log(`  \u2713 ${n}`);
const bad = (n, d) => { failures++; console.log(`  \u2717 ${n}${d ? " — " + d : ""}`); };
const check = (cond, name, detail) => (cond ? ok(name) : bad(name, detail));

async function registerAndOpen(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1100 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${BASE}/mindset-shift`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);
  await page.locator("#ms-fullname").fill("Ada Obi");
  await page.locator("#ms-email").fill("ada.proof@example.com");
  await page.locator('#register select[aria-label="Country"]').selectOption("NG");
  await page.locator("#register input[placeholder='Phone number']").fill("8025556667");
  await page.locator("#ms-heard").selectOption("WhatsApp");
  await page.locator("#ms-hoping").fill("Debt clarity.");
  await page.locator("#ms-challenge").fill("Card debt.");
  await page.locator("#register").getByRole("button", { name: "Not yet", exact: true }).click();
  await page.locator("#register").getByRole("button", { name: /Register Free/ }).click();
  await page.waitForTimeout(600);
  return { ctx, page, errors };
}

const flow = (page) => page.locator("#register");
const setStatus = (page, status, extra = {}) =>
  page.evaluate(
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

(async () => {
  const browser = await chromium.launch({ headless: true });

  /* ============ 1-4. Upload happy path + validation ============ */
  console.log("\n[upload + validation]");
  {
    const { page, ctx, errors } = await registerAndOpen(browser);
    const f = flow(page);

    check(await f.getByRole("button", { name: "Upload your screenshot" }).isVisible(), "dropzone visible when registered");

    // Non-image rejected
    await page.setInputFiles("#ms-proof-file", TEXT_FILE);
    await page.waitForTimeout(400);
    check(await f.getByText("Please upload a screenshot image", { exact: false }).isVisible(), "non-image rejected with message");
    check((await page.locator("#register img[alt='Screenshot preview before submission']").count()) === 0, "no preview after rejected file");

    // Oversize rejected
    await page.setInputFiles("#ms-proof-file", BIG_FILE);
    await page.waitForTimeout(400);
    check(await f.getByText("maximum is 10 MB", { exact: false }).isVisible(), ">10MB rejected with size message");

    // Happy path with the 2000px image (tests downscaling too)
    await page.setInputFiles("#ms-proof-file", LARGE_PNG);
    await page.waitForTimeout(900);
    const preview = page.locator("img[alt='Screenshot preview before submission']");
    check(await preview.isVisible(), "preview shown after valid image");
    const prevW = await preview.evaluate((el) => el.naturalWidth);
    check(prevW <= 1400, "preview is downscaled to <=1400px", `w=${prevW}`);

    await page.getByRole("button", { name: "Submit proof" }).click();
    await page.waitForTimeout(800);

    const r = await page.evaluate(() => JSON.parse(localStorage.getItem("kr8_mindset_shift_registrations_v1"))[0]);
    check(r.status === "share_submitted", "status → share_submitted after proof submit", r.status);
    check(String(r.proofData).startsWith("data:image/jpeg"), "proof stored as compressed JPEG data URL");
    check(String(r.proofKey).startsWith("idb:img-"), "media-vault key stored", String(r.proofKey).slice(0, 14));
    check(typeof r.proofSubmittedAt === "number" && r.proofSubmittedAt > 0, "proof timestamp stored");
    check(r.syncPending === true, "syncPending (cloud push queued)");

    // Proof payload is small (downscaled JPEG, not the raw 12MB PNG)
    const dataLen = (r.proofData || "").length;
    check(dataLen < 1_500_000, "proof payload compact (downscaled)", `${(dataLen / 1024).toFixed(0)}KB base64`);

    // UI now shows submitted state + stored proof, NO upload control
    check(await f.getByText("Your screenshot is with the team.").isVisible(), "UI shows awaiting-verification state");
    check(await f.locator("img[alt='Share proof screenshot submitted by you']").isVisible(), "stored proof displayed");
    check((await f.getByRole("button", { name: "Upload your screenshot" }).count()) === 0, "NO second upload while awaiting (double-proof guard)");
    check((await f.getByRole("button", { name: "Submit proof" }).count()) === 0, "no stray submit button");

    check(errors.length === 0, "no page errors (upload pass)", errors.join(" | "));
    await page.screenshot({ path: "tests/shots/ms7-proof-submitted.png", fullPage: false });

    /* ============ 6. needs_resubmission → resubmit ============ */
    console.log("\n[resubmission]");
    await setStatus(page, "needs_resubmission", { adminNote: "screenshot too blurry (internal)" });
    await page.waitForTimeout(500);
    check(await f.getByRole("button", { name: "Upload a new screenshot" }).isVisible(), "resubmission upload control visible");
    check(await f.getByText("Previous screenshot").isVisible(), "previous screenshot still shown for context");

    await page.setInputFiles("#ms-proof-file", SMALL_PNG);
    await page.waitForTimeout(600);
    await page.getByRole("button", { name: "Submit proof" }).click();
    await page.waitForTimeout(700);
    const r2 = await page.evaluate(() => JSON.parse(localStorage.getItem("kr8_mindset_shift_registrations_v1"))[0]);
    check(r2.status === "share_submitted", "resubmit returns status to share_submitted", r2.status);
    check(r2.proofData !== r.proofData, "proof replaced with the new screenshot");
    check(r2.adminNote === "", "internal admin note cleared on resubmit");
    check(await f.getByText("Your screenshot is with the team.").isVisible(), "UI back to awaiting state");
    check(errors.length === 0, "no page errors (resubmission)", errors.join(" | "));
    await ctx.close();
  }

  /* ============ 8. access_granted → verified proof view ============ */
  console.log("\n[verified view]");
  {
    const { page, ctx, errors } = await registerAndOpen(browser);
    const f = flow(page);
    // Register a proof first
    await page.setInputFiles("#ms-proof-file", SMALL_PNG);
    await page.waitForTimeout(600);
    await page.getByRole("button", { name: "Submit proof" }).click();
    await page.waitForTimeout(600);
    // Admin approves
    await setStatus(page, "access_granted", { verifiedBy: "admin-test", verifiedAt: Date.now() });
    await page.waitForTimeout(500);
    check(await f.getByText("Verified proof").isVisible(), "verified proof label shown");
    check(await f.locator("img[alt='Share proof screenshot submitted by you']").isVisible(), "proof image shown when granted");
    check((await f.getByRole("button", { name: /Upload/ }).count()) === 0, "no upload after grant");
    check(errors.length === 0, "no page errors (verified)", errors.join(" | "));
    await ctx.close();
  }

  /* ============ 9. localStorage budget sanity ============ */
  console.log("\n[storage budget]");
  {
    const { page, ctx, errors } = await registerAndOpen(browser);
    await page.setInputFiles("#ms-proof-file", LARGE_PNG);
    await page.waitForTimeout(900);
    await page.getByRole("button", { name: "Submit proof" }).click();
    await page.waitForTimeout(600);
    // Scope: Mindset-Shift keys only. The site-wide `kr8_accounts_v3` store
    // (Supabase-hydrated avatars, ~9.7MB) lands asynchronously and is not
    // this feature's responsibility; media assets live in IndexedDB.
    const totalBytes = await page.evaluate(() => {
      let t = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k.startsWith("kr8_mindset_shift_")) continue;
        t += (localStorage.getItem(k) || "").length * 2;
      }
      return t;
    });
    check(totalBytes < 1 * 1024 * 1024, "mindset-shift localStorage stays well under budget after proof upload", `${(totalBytes / 1024).toFixed(0)}KB`);
    check(errors.length === 0, "no page errors (budget)", errors.join(" | "));
    await ctx.close();
  }

  await browser.close();

  console.log("\n" + "-".repeat(60));
  if (failures > 0) {
    console.log(`MINDSET SHIFT PROOF UPLOAD: ${failures} CHECK(S) FAILED`);
    process.exit(1);
  }
  console.log("MINDSET SHIFT PROOF UPLOAD: ALL CHECKS PASSED");
  console.log("-".repeat(60));
})().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
