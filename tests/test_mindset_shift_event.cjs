/**
 * MINDSET SHIFT 7.0 — STEP 10: ADMIN EVENT MANAGEMENT
 *
 * The public page is 100% data-driven: every fact the visitor sees is
 * edited in Admin → Events & Programs → Mindset Shift → Event settings.
 * This suite verifies the admin form end-to-end:
 *   - pre-filled from the live config
 *   - basics save -> public page re-renders live (no deploy)
 *   - flyer upload -> media vault key -> public page renders it
 *   - speaker name edit -> public page
 *   - share copy edit -> participant share panel
 *   - WhatsApp access controls -> granted participant sees the link
 *   - validation (empty edition, bad URL) and reset-to-defaults
 *
 * Requires the dev server on http://localhost:5173 (npm run dev).
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:5173";
const FOUNDER_PW = "KR8@Adm!n2026";
const SMALL_PNG = "/tmp/proof-small.png";
const REGS_KEY = "kr8_mindset_shift_registrations_v1";

let pass = 0, fail = 0;
function check(cond, label, detail) {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`); }
}

async function openAdmin(page, sub = "Event settings") {
  if (!page.__msSessionSeeded) {
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await page.evaluate((pw) => {
      const founder = {
        type: "founder", id: "KR8-FOUNDER-TIMFIRE", name: "Kenneth Timothy Iziogo (Timfire)",
        email: "kr8digitals01@gmail.com", phone: "+2348125687509",
        admin: { role: "ultimate", permissions: ["all"], adminPassword: pw },
      };
      localStorage.setItem("kr8_current", JSON.stringify(founder));
    }, FOUNDER_PW);
    page.__msSessionSeeded = true;
  }
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
    /* already unlocked on this page load */
  }
  await page.getByRole("button", { name: /Mindset Shift/ }).first().waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: /Mindset Shift/ }).first().click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: sub }).click();
  await page.waitForTimeout(500);
}

const openSection = (page, title) => page.locator("summary", { hasText: title }).first().click();

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 140)));
  page.on("dialog", (d) => d.accept());

  /* ============ 1. Form pre-filled ============ */
  console.log("\n[event settings: pre-filled]");
  await openAdmin(page);
  check(await page.getByText("Event Settings").first().isVisible(), "event settings section renders");
  const basics = page.locator('details:has(summary:has-text("Basics & schedule"))');
  const editionInput = basics.locator("input").nth(0);
  check((await editionInput.inputValue()) === "7.0", "edition pre-filled with 7.0");
  const subtitleInput = basics.locator("input").nth(3);
  const preSub = await subtitleInput.inputValue();
  check(preSub.length > 10, "subtitle pre-filled from live config", preSub);

  /* ============ 2. Edit basics -> public page live ============ */
  console.log("\n[event settings: basics save -> public page]");
  {
    await subtitleInput.fill("TEST EDITION — Live Update Check");
    await page.getByRole("button", { name: /Save changes/ }).click();
    await page.waitForTimeout(700);
    check(await page.getByText("Event saved").isVisible(), "save toast shown");

    // Public page, same context — no reload of the config, live re-render
    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(900);
    check(await page.getByText("TEST EDITION — Live Update Check").first().isVisible(), "public page shows the new subtitle (live, no deploy)");
  }

  /* ============ 3. Flyer upload -> media vault -> public page ============ */
  console.log("\n[event settings: flyer upload]");
  {
    await openAdmin(page);
    await openSection(page, "Flyer");
    await page.waitForTimeout(300);
    await page.locator('input[type="file"]').nth(0).setInputFiles(SMALL_PNG);
    await page.waitForTimeout(1500);
    const flyerVal = await page.locator('input[type="file"]').nth(0).evaluate(() => {
      // the input resets; read the preview image's presence instead
      return true;
    });
    void flyerVal;
    check((await page.locator("img[alt='Current flyer']").count()) === 1, "flyer preview appears after upload");
    await page.getByRole("button", { name: /Save changes/ }).click();
    await page.waitForTimeout(700);

    // Seed a registration so the share card (which renders the flyer) is visible
    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      const now = Date.now();
      const r = { id: "MS7-FLR01", edition: "7.0", fullName: "Flyer Checker", email: "flyer@example.com", phone: "+2348055550002", whatsapp: "", location: "", heardAbout: "Admin", hopingToLearn: "", moneyQuestion: "", biggestChallenge: "", debtExperience: "", financialSituation: "", hasFinancialGoal: false, areaToImprove: "", status: "registered", proofKey: null, proofData: null, proofSubmittedAt: null, adminNote: "", verifiedBy: null, verifiedAt: null, createdAt: now, updatedAt: now, syncPending: true };
      localStorage.setItem("kr8_mindset_shift_registrations_v1", JSON.stringify([r]));
      window.dispatchEvent(new Event("kr8:ms-regs-updated"));
    });
    await page.waitForTimeout(1100);
    const flyerImg = page.locator("img[alt*='flyer — save and share this']");
    check((await flyerImg.count()) === 1, "public page renders the uploaded flyer");
    const src = await flyerImg.first().getAttribute("src");
    check(!!src && src.startsWith("data:image"), "flyer resolves from the media vault");
  }

  /* ============ 4. Speaker name -> public page ============ */
  console.log("\n[event settings: speaker edit]");
  {
    await openAdmin(page);
    await openSection(page, "Speaker");
    await page.waitForTimeout(300);
    const speakerName = page.locator('details:has(summary:has-text("Speaker")) input').first();
    await speakerName.fill("Test Speaker For Edition 8");
    await page.getByRole("button", { name: /Save changes/ }).click();
    await page.waitForTimeout(700);

    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(900);
    check(await page.getByText("Test Speaker For Edition 8").first().isVisible(), "public page shows the new speaker name");
  }

  /* ============ 5. Share copy -> participant share panel ============ */
  console.log("\n[event settings: share copy edit]");
  {
    await openAdmin(page);
    await openSection(page, "Share copy");
    await page.waitForTimeout(300);
    const generalBox = page.locator('details:has(summary:has-text("Share copy")) textarea').last();
    await generalBox.fill("ADMIN-COPY-EDIT-CHECK: share the flyer, this is the test caption.");
    await page.getByRole("button", { name: /Save changes/ }).click();
    await page.waitForTimeout(700);

    // Participant side (same context): registered status -> share panel live
    await page.evaluate(() => {
      const now = Date.now();
      const r = { id: "MS7-EVT01", edition: "7.0", fullName: "Copy Checker", email: "copy@example.com", phone: "+2348055550001", whatsapp: "", location: "", heardAbout: "Admin", hopingToLearn: "", moneyQuestion: "", biggestChallenge: "", debtExperience: "", financialSituation: "", hasFinancialGoal: false, areaToImprove: "", status: "registered", proofKey: null, proofData: null, proofSubmittedAt: null, adminNote: "", verifiedBy: null, verifiedAt: null, createdAt: now, updatedAt: now, syncPending: true };
      localStorage.setItem("kr8_mindset_shift_registrations_v1", JSON.stringify([r]));
    });
    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Any platform" }).click();
    await page.waitForTimeout(400);
    check(await page.getByText(/ADMIN-COPY-EDIT-CHECK/).first().isVisible(), "participant share panel shows the edited copy");
  }

  /* ============ 6. WhatsApp access controls (admin side) ============ */
  console.log("\n[event settings: WhatsApp access controls]");
  {
    await openAdmin(page);
    await openSection(page, "WhatsApp group access");
    await page.waitForTimeout(300);
    check(await page.getByText("admin-managed").first().isVisible(), "admin warning: link is admin-managed");
    const urlInput = page.locator('details:has(summary:has-text("WhatsApp group access")) input[type="url"]');
    await urlInput.fill("https://chat.whatsapp.com/STEP10TESTGROUP");
    const enabledBox = page.locator('details:has(summary:has-text("WhatsApp group access")) input[type="checkbox"]');
    if (!(await enabledBox.isChecked())) await enabledBox.check();
    await page.getByRole("button", { name: /Save changes/ }).click();
    await page.waitForTimeout(700);

    // Granted participant sees the link
    await page.evaluate(() => {
      const regs = JSON.parse(localStorage.getItem("kr8_mindset_shift_registrations_v1") || "[]");
      regs[0] = { ...regs[0], status: "access_granted" };
      localStorage.setItem("kr8_mindset_shift_registrations_v1", JSON.stringify(regs));
      window.dispatchEvent(new Event("kr8:ms-regs-updated"));
    });
    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    const link = page.getByRole("link", { name: /Join the WhatsApp space/ });
    check((await link.count()) === 1, "granted participant can join from the admin-set link");
    check((await link.first().getAttribute("href")) === "https://chat.whatsapp.com/STEP10TESTGROUP", "href matches the admin-set URL");
  }

  /* ============ 7. Validation + reset ============ */
  console.log("\n[event settings: validation + reset]");
  {
    await openAdmin(page);
    const editionInput = page.locator('details:has(summary:has-text("Basics & schedule")) input').nth(0);
    await editionInput.fill("");
    await page.getByRole("button", { name: /Save changes/ }).click();
    await page.waitForTimeout(400);
    check(await page.getByText("Edition is required").isVisible(), "empty edition blocked with a message");

    await openSection(page, "WhatsApp group access");
    await page.waitForTimeout(200);
    const urlInput = page.locator('details:has(summary:has-text("WhatsApp group access")) input[type="url"]');
    await urlInput.fill("not-a-url");
    await editionInput.fill("8.0");
    await page.getByRole("button", { name: /Save changes/ }).click();
    await page.waitForTimeout(400);
    check(await page.getByText("WhatsApp group link must start with https").isVisible(), "invalid group URL blocked");

    // Reset to defaults (dialog auto-accepted)
    await page.getByRole("button", { name: /Reset to defaults/ }).click();
    await page.waitForTimeout(600);
    check((await page.locator('details:has(summary:has-text("Basics & schedule")) input').nth(0).inputValue()) === "7.0", "reset restores default edition");
    await page.getByRole("button", { name: /Save changes/ }).click();
    await page.waitForTimeout(700);
    check(await page.getByText("Event saved").isVisible(), "reset applied via save");

    await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(900);
    const body = await page.locator("#register").textContent();
    check(!String(body).includes("STEP10TESTGROUP"), "public page no longer exposes the test group URL after reset");
  }

  check(errors.length === 0, "no page errors", errors.join(" | "));

  console.log("\n------------------------------------------------------------");
  console.log(`MINDSET SHIFT EVENT SETTINGS: ${fail === 0 ? "ALL CHECKS PASSED" : fail + " CHECK(S) FAILED"}`);
  console.log(`  passed=${pass} failed=${fail}`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
