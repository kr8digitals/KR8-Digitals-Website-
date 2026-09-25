const { chromium } = require("playwright");

async function run() {
  console.log("=== STARTING STEP 5: ONE-ON-ONE COACHING CONVERSION & FUNCTIONALITY TEST ===");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto("http://localhost:5173/academy#coaching", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // 1. Verify Core Header & Copy
  const heading = page.locator("text=Why Pay for 1-on-1 Coaching When the General Class Is Completely Free?").first();
  await heading.waitFor({ state: "visible", timeout: 5000 });
  console.log("✓ Core conversion question heading found and visible.");

  // 2. Verify Comparison Table
  const freeCard = page.locator("text=Free Group Cohort").first();
  const paidCard = page.locator("text=Private 1-on-1 Coaching").first();
  await freeCard.waitFor({ state: "visible" });
  await paidCard.waitFor({ state: "visible" });
  console.log("✓ Side-by-side comparison cards (Free Cohort vs 1-on-1 Coaching) rendered.");

  // 3. Verify Value Pillars
  const pillars = [
    "Faster Breakthroughs",
    "Personal Client Work Review",
    "Learn at Your Velocity",
    "Diagnostic on Blind Spots",
    "Real Accountability",
    "Pay-As-You-Learn Freedom",
  ];
  for (const p of pillars) {
    await page.locator(`text=${p}`).first().waitFor({ state: "visible" });
  }
  console.log("✓ All 6 high-conversion value pillars rendered.");

  // 4. Test Booking Modal Interaction & Submission
  const bookBtn = page.locator("button:has-text('Book 1-on-1 Coaching Session')").first();
  await bookBtn.click();
  await page.waitForTimeout(500);

  const modalHeading = page.locator("text=Schedule Your 1-on-1 Coaching");
  await modalHeading.waitFor({ state: "visible", timeout: 3000 });
  console.log("✓ Coaching booking modal opened smoothly.");

  // Fill booking form
  await page.fill("input[placeholder='e.g. Ebuka Okafor']", "Test Coach Applicant");
  await page.fill("input[type='tel']", "+234 812 345 6789");
  await page.fill("input[type='email']", "applicant@test.com");
  await page.fill("textarea", "Need urgent review of fintech dashboard animations before client pitch.");

  // Submit form
  const submitBtn = page.locator("button:has-text('Submit 1-on-1 Coaching Request')");
  await submitBtn.click();
  await page.waitForTimeout(1000);

  // Verify Confirmation
  const confirmed = page.locator("text=Coaching Request Confirmed!");
  await confirmed.waitFor({ state: "visible", timeout: 3000 });
  console.log("✓ Booking request successfully logged with instant visual confirmation.");

  await browser.close();
  console.log("\n=== STEP 5: ONE-ON-ONE COACHING TEST PASSED 100% ===");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
