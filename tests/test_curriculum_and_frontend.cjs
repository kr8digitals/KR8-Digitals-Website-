const { chromium } = require("playwright");

async function run() {
  console.log("=== TESTING STEP 7 (FRONT-END DEVELOPMENT) & STEP 8 (CURRICULUM MANAGEMENT) ===");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log(`[BROWSER ERROR] ${msg.text()}`);
    }
  });

  // Step 7.1: Guest Academy Page Verification
  console.log("1. Navigating to /academy as guest...");
  await page.goto("http://localhost:5173/academy", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  const headings = await page.$$eval("h3, h4", els => els.map(e => e.textContent.trim()));
  if (!headings.includes("Front-End Development")) {
    throw new Error("Front-End Development track not found on Academy page");
  }
  console.log("✓ Front-End Development track verified on Academy page");

  const pageHtml = await page.content();
  if (!pageHtml.includes("Nonye Mercy")) {
    throw new Error("Instructor Nonye Mercy not found on Academy page");
  }
  console.log("✓ Nonye Mercy verified as instructor for Front-End Development");

  if (!pageHtml.includes("/team/chimnonyerem.jpg")) {
    throw new Error("Nonye Mercy photo (/team/chimnonyerem.jpg) not found in Academy HTML");
  }
  console.log("✓ Nonye Mercy profile photo (/team/chimnonyerem.jpg) properly loaded");

  // Step 7.2: Verify initial syllabus modal fallback for Front-End Development
  const frontendCard = page.locator("div, section").filter({ hasText: "Front-End Development" }).first();
  const viewSyllabusBtn = page.locator("button").filter({ hasText: /Curriculum|Syllabus/i }).nth(3); // 4th track is frontend
  await viewSyllabusBtn.click();
  await page.waitForTimeout(500);

  let modalText = await page.locator("body").innerText();
  console.log("Modal opened. Has Front-End Development:", modalText.includes("Front-End Development"));
  if (modalText.includes("Curriculum Under Final Review") || modalText.includes("8 Weeks")) {
    console.log("✓ Initial curriculum state gracefully handled");
  }

  // Close modal
  const closeBtn = page.getByRole("button", { name: "Close" }).first();
  if (await closeBtn.count() > 0) {
    await closeBtn.click();
    await page.waitForTimeout(300);
  }

  // Step 8: Admin Dynamic Curriculum Manager
  console.log("2. Authenticating as Founder / Admin and testing Curriculum Manager...");
  await page.evaluate(() => {
    const founder = {
      type: "founder",
      executiveRole: "Founder",
      id: "KR8-FOUNDER-TIMFIRE",
      name: "Kenneth Timothy Iziogo (Timfire)",
      email: "kr8digitals01@gmail.com",
      phone: "+2348125687509",
      admin: {
        role: "ultimate",
        permissions: ["all"],
        adminPassword: "KR8@Adm!n2026",
      },
    };
    localStorage.setItem("kr8_current", JSON.stringify(founder));
  });

  await page.goto("http://localhost:5173/admin", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // If password input is present, fill it
  const pwInput = page.locator('input[type="password"]');
  if (await pwInput.count() > 0) {
    await pwInput.fill("KR8@Adm!n2026");
    const unlockBtn = page.getByRole("button", { name: /unlock|sign in|login|enter/i }).first();
    await unlockBtn.click();
    await page.waitForTimeout(800);
  }

  // Click "Academy" tab
  const academyTab = page.getByRole("button", { name: "Academy", exact: true });
  await academyTab.click();
  await page.waitForTimeout(800);

  // Find the Front-End Development row and its "Manage Curriculum" button
  // 4th skill card (index 3) is Front-End Development (graphic, video, web, frontend, ...)
  const manageButtons = page.getByRole("button", { name: /Manage Curriculum/i });
  await manageButtons.nth(3).click();
  await page.waitForTimeout(600);

  const managerModalText = await page.locator("body").innerText();
  if (!managerModalText.includes("Manage Curriculum: Front-End Development")) {
    throw new Error("Curriculum manager modal for Front-End Development failed to open");
  }
  console.log("✓ Dynamic Curriculum Manager modal opened for Front-End Development");

  // Click "+ Initialize 8-Week Template"
  const initTemplateBtn = page.getByRole("button", { name: /Initialize 8-Week Template/i });
  if (await initTemplateBtn.count() > 0) {
    await initTemplateBtn.click();
    await page.waitForTimeout(400);
    console.log("✓ Initialized 8-week curriculum template");
  }

  // Customize Week 1 title to verify dynamic editing
  const week1Input = page.locator('input[placeholder*="Week Topic"]').first();
  await week1Input.fill("HTML5 Semantic Architecture & Responsive CSS Grid");
  console.log("✓ Custom week title entered into visual curriculum editor");

  // Save & publish curriculum
  const saveBtn = page.getByRole("button", { name: /Save & Publish Curriculum/i });
  await saveBtn.click();
  await page.waitForTimeout(1200);
  console.log("✓ Clicked Save & Publish Curriculum");

  // Step 8.2: Verify dynamic curricula in localStorage
  const dynamicStored = await page.evaluate(() => {
    return localStorage.getItem("kr8_dynamic_curricula_v1");
  });
  if (!dynamicStored || !dynamicStored.includes("HTML5 Semantic Architecture")) {
    throw new Error("Dynamic curriculum was not properly saved to localStorage: " + dynamicStored);
  }
  console.log("✓ Verified dynamic curriculum saved in localStorage (kr8_dynamic_curricula_v1)");

  // Step 8.3: Verify in Guest Academy View that the dynamic curriculum renders immediately
  console.log("3. Returning to Academy as guest to verify live dynamic curriculum reflection...");
  await page.evaluate(() => {
    localStorage.removeItem("kr8_current");
  });
  await page.goto("http://localhost:5173/academy", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  const openFedSyllabus = page.locator("button").filter({ hasText: /Curriculum|Syllabus/i }).nth(3);
  await openFedSyllabus.click();
  await page.waitForTimeout(600);

  const fedModalContent = await page.locator("body").innerText();
  if (!fedModalContent.includes("HTML5 Semantic Architecture & Responsive CSS Grid")) {
    throw new Error("Dynamic curriculum did not reflect in Academy guest syllabus modal");
  }
  console.log("✓ Live dynamic curriculum updated and displayed in student syllabus modal!");

  console.log("=== STEP 7 & STEP 8 COMPLETE AND 100% VERIFIED! ===");
  await browser.close();
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
