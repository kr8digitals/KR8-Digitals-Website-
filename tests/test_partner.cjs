const { chromium } = require("playwright");

async function run() {
  console.log("=== STARTING STEP 6: PARTNER WITH US SECTION & PAGE AUDIT ===");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  // 1. Visit /partner
  console.log("1. Visiting /partner page...");
  await page.goto("http://localhost:5173/partner", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // Verify Main Proposition Header
  const heading = page.locator("text=Turn Raw African Potential Into").first();
  await heading.waitFor({ state: "visible", timeout: 5000 });
  console.log("✓ Hero proposition heading is visible.");

  // 2. Verify all 6 distinct pathways
  console.log("2. Verifying all 6 distinct partnership pathways...");
  const expectedPathways = [
    "Support Tuition-Free Training",
    "Hire Pre-Vetted KR8 Graduates",
    "Sponsor a Student or Cohort",
    "Provide Equipment, Tech & Hub Resources",
    "Industry Mentorship & Masterclasses",
    "Strategic CSR & Agency Co-Building",
  ];

  for (const pw of expectedPathways) {
    const el = page.locator(`h3:has-text("${pw}")`).first();
    await el.waitFor({ state: "visible" });
    console.log(`  ✓ Pathway '${pw}' is visible.`);
  }

  // 3. Test Pathway interaction (Clicking "Hire Pre-Vetted KR8 Graduates" action button)
  console.log("3. Testing interactive pathway selection...");
  const hireBtn = page.locator("button:has-text('Request Candidate Portfolios')").first();
  await hireBtn.click();
  await page.waitForTimeout(500);

  // Check form has selected the pathway
  const selectedInForm = await page.inputValue("select >> nth=0");
  if (!selectedInForm.includes("Hire")) {
    throw new Error(`Expected form pathway to be updated to Hire Pre-Vetted Graduates, got: ${selectedInForm}`);
  }
  console.log(`✓ Pathway selection successfully synced to form: ${selectedInForm}`);

  // 4. Test Proposal Form Submission
  console.log("4. Testing proposal form submission...");
  await page.fill("input[placeholder='e.g. Dr. Adaobi Okon']", "Global Tech Ventures");
  await page.fill("input[placeholder='e.g. Acme Tech Africa or Individual Patron']", "GTV Africa");
  await page.fill("input[placeholder='adaobi@organization.com']", "partnerships@gtv.africa");
  await page.fill("textarea", "We are looking to hire 5 remote junior designers and sponsor a full graphic design cohort this quarter.");

  const submitBtn = page.locator("button:has-text('Submit Partnership Proposal')");
  await submitBtn.click();
  await page.waitForTimeout(1000);

  // Check success screen
  const successTitle = page.locator("text=Proposal Received!");
  await successTitle.waitFor({ state: "visible", timeout: 5000 });
  console.log("✓ Proposal successfully submitted and confirmed!");

  // 5. Verify Navigation Links
  console.log("5. Testing Navbar & Footer navigation links to Partner...");
  await page.goto("http://localhost:5173/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);

  const navPartnerLink = page.locator("nav a[href='/partner']").first();
  await navPartnerLink.waitFor({ state: "visible" });
  console.log("✓ Navbar 'Partner' link exists and is visible.");

  const footerPartnerLink = page.locator("footer a[href='/partner']").first();
  await footerPartnerLink.waitFor({ state: "attached" });
  console.log("✓ Footer 'Partner With Us' link exists.");

  await browser.close();
  console.log("\n=== STEP 6 AUDIT COMPLETE: PARTNER WITH US TEST PASSED 100% ===");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
