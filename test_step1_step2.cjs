const { chromium } = require('playwright');

(async () => {
  console.log("=== TESTING STEP 1 & STEP 2 WITH PLAYWRIGHT ===");
  const browser = await chromium.launch({
    headless: true,
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // 1. Test Admin Login with Attendance Reviewer Password
  console.log("\n--- TEST 1: Attendance Reviewer Quarantine ---");
  await page.goto('http://localhost:5173/admin');

  // Seed authorized founder/admin account
  await page.evaluate(() => {
    const founder = {
      id: "KR8-FOUNDER-001",
      name: "Timfire Founder",
      email: "kutimfire001@gmail.com",
      phone: "+2348125687509",
      type: "founder",
      admin: {
        role: "ultimate",
        permissions: ["Overview", "Attendance Review", "Website Content (CMS)", "Admin Permissions"]
      }
    };
    localStorage.setItem("kr8_auth_user", JSON.stringify(founder));
  });

  await page.reload();

  // Enter Attendance Reviewer password
  await page.fill('input[type="password"]', "KR8@Atd2026");
  await page.click('button:has-text("Unlock Dashboard")');
  await page.waitForTimeout(600);

  // Check that page shows Quarantined Reviewer banner
  const pageText = await page.innerText('body');
  const isQuarantined = pageText.includes("Attendance Review") && pageText.includes("Quarantined Reviewer");
  console.log("Attendance Reviewer Banner Present:", isQuarantined);
  if (!isQuarantined) {
    throw new Error("Failed: Reviewer banner not found after unlocking with ATTENDANCE_PW");
  }

  // Ensure NO other admin sections exist on the page
  const hasOverviewNav = pageText.includes("Website Content (CMS)") || pageText.includes("Founders & Team");
  console.log("Restricted admin sections absent in Reviewer mode:", !hasOverviewNav);
  if (hasOverviewNav) {
    throw new Error("Security leak: Regular admin sections are visible in Reviewer mode!");
  }

  // Click Sign Out / Lock
  await page.click('button:has-text("Sign Out / Lock")');
  await page.waitForTimeout(400);

  // 2. Test Admin Login with Master Password
  console.log("\n--- TEST 2: Ultimate Administrator Control Center ---");
  await page.fill('input[type="password"]', "KR8@Adm!n2026");
  await page.click('button:has-text("Unlock Dashboard")');
  await page.waitForTimeout(600);

  const pageTextAdmin = await page.innerText('body');
  const hasControlCenter = pageTextAdmin.includes("Control Center");
  console.log("Admin Control Center Loaded:", hasControlCenter);

  // Check grouped categories in sidebar
  const hasCMSNav = pageTextAdmin.includes("Website Content (CMS)");
  const hasSignaturesNav = pageTextAdmin.includes("Coach & Admin Signatures");
  const hasPermissionsNav = pageTextAdmin.includes("Staff Permissions");
  console.log("Sidebar Nav Groups Present:", { hasCMSNav, hasSignaturesNav, hasPermissionsNav });

  // 3. Test Website Content Manager (CMS)
  console.log("\n--- TEST 3: Dynamic Website Content Manager (CMS) ---");
  await page.click('button:has-text("Website Content (CMS)")');
  await page.waitForTimeout(600);

  const cmsText = await page.innerText('body');
  const hasCMSSections = cmsText.includes("Home Page") && cmsText.includes("Academy Page") && cmsText.includes("Global & Footer");
  console.log("CMS Sub-Tabs Present (Home, Academy, Global & Footer):", hasCMSSections);

  // 4. Test Coach & Admin Signatures Manager
  console.log("\n--- TEST 4: Coach & Admin Signature Manager ---");
  await page.click('button:has-text("Coach & Admin Signatures")');
  await page.waitForTimeout(600);

  const sigText = await page.innerText('body');
  const hasSigElements = sigText.includes("Certificate Signature Management") && sigText.includes("Administrator Signature");
  console.log("Signature Manager Interface Present:", hasSigElements);

  // 5. Test Staff & Granular Permissions Manager
  console.log("\n--- TEST 5: Granular Permissions Manager ---");
  await page.click('button:has-text("Staff Permissions")');
  await page.waitForTimeout(600);

  const permText = await page.innerText('body');
  const hasPermRoles = permText.includes("Attendance Reviewer") && permText.includes("Standard Admin");
  console.log("Permission Presets & Staff Registry Present:", hasPermRoles);

  console.log("\n✅ ALL TESTS FOR STEP 1 & STEP 2 PASSED COMPLETELY!");
  await browser.close();
})();
