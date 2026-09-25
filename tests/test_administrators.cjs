const { chromium } = require("playwright");

async function run() {
  console.log("=== STARTING STEP 4: THE ADMINISTRATORS SECTION AUDIT ===");
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Test (1280x800)
  console.log("1. Testing Desktop Viewport (1280x800)...");
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto("http://localhost:5173/about", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // Check Heading
  const heading = await page.locator("text=The Administrators").first();
  await heading.waitFor({ state: "visible", timeout: 5000 });
  console.log("✓ Section heading 'The Administrators' is visible.");

  // Check Members
  const expectedMembers = [
    "Odobe Nicodemus C (BioNicz)",
    "Chimnonyerem Mercy",
    "Nwefuru Favour Chizurum",
    "Covenant Afinidi",
  ];

  for (const name of expectedMembers) {
    const el = page.locator(`text=${name}`).first();
    await el.waitFor({ state: "visible", timeout: 5000 });
    console.log(`✓ Administrator '${name}' is visible.`);
  }

  // Check 2-per-row layout on desktop
  const card1 = await page.locator("text=Odobe Nicodemus C (BioNicz)").locator("xpath=ancestor::div[contains(@class, 'group relative')][1]").boundingBox();
  const card2 = await page.locator("text=Chimnonyerem Mercy").locator("xpath=ancestor::div[contains(@class, 'group relative')][1]").boundingBox();
  const card3 = await page.locator("text=Nwefuru Favour Chizurum").locator("xpath=ancestor::div[contains(@class, 'group relative')][1]").boundingBox();

  console.log(`Card 1 (Nicodemus): x=${card1.x.toFixed(0)}, y=${card1.y.toFixed(0)}, w=${card1.width.toFixed(0)}`);
  console.log(`Card 2 (Mercy): x=${card2.x.toFixed(0)}, y=${card2.y.toFixed(0)}, w=${card2.width.toFixed(0)}`);
  console.log(`Card 3 (Favour): x=${card3.x.toFixed(0)}, y=${card3.y.toFixed(0)}, w=${card3.width.toFixed(0)}`);

  // Card 1 and Card 2 must be side by side (same row, card 1 left of card 2)
  if (Math.abs(card1.y - card2.y) > 40 || card1.x >= card2.x) {
    throw new Error(`Expected Card 1 and Card 2 to be side by side on desktop!`);
  }
  console.log("✓ Row 1 has 2 cards side by side (Nicodemus & Mercy).");

  // Card 3 must be in row 2 (y > card 1 y)
  if (card3.y <= card1.y + 100) {
    throw new Error(`Expected Card 3 to be in row 2 below Card 1 on desktop!`);
  }
  console.log("✓ Row 2 starts below Row 1 (2-per-row grid confirmed).");

  // 2. Mobile Test (390x844)
  console.log("\n2. Testing Mobile Viewport (390x844)...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);

  const mCard1 = await page.locator("text=Odobe Nicodemus C (BioNicz)").locator("xpath=ancestor::div[contains(@class, 'group relative')][1]").boundingBox();
  const mCard2 = await page.locator("text=Chimnonyerem Mercy").locator("xpath=ancestor::div[contains(@class, 'group relative')][1]").boundingBox();

  console.log(`Mobile Card 1: x=${mCard1.x.toFixed(0)}, y=${mCard1.y.toFixed(0)}`);
  console.log(`Mobile Card 2: x=${mCard2.x.toFixed(0)}, y=${mCard2.y.toFixed(0)}`);

  if (mCard2.y <= mCard1.y + 100) {
    throw new Error("Expected cards to stack vertically on mobile!");
  }
  console.log("✓ Mobile cards cleanly stack vertically (1 per row).");

  await browser.close();
  console.log("\n=== STEP 4 AUDIT COMPLETE: THE ADMINISTRATORS SECTION CONFIRMED FUNCTIONAL ===");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
