const { chromium } = require("playwright");

async function run() {
  console.log("=== STARTING GRADUATION & RECOGNITION AUDIT ===");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Visit website
    console.log("1. Visiting website...");
    await page.goto("http://localhost:5173/");
    await page.waitForLoadState("domcontentloaded");

    // 2. Set up test student in local storage
    const testStudentId = "KR82026TEST001GDVFD";
    const testStudentName = "Chukwuemeka Kingsley Nnamdi";

    console.log("2. Registering student through store...");
    await page.evaluate(({ testStudentId, testStudentName }) => {
      // Create student directly via store
      const raw = localStorage.getItem("kr8_accounts_v3") || "[]";
      const accounts = JSON.parse(raw);
      // Remove any existing test student
      const filtered = accounts.filter(a => a.id !== testStudentId);
      filtered.push({
        id: testStudentId,
        type: "student",
        name: testStudentName,
        email: "kingsley.test@example.com",
        phone: "+2348099887766",
        country: "NG",
        skill: "graphic",
        dob: "2001-04-15",
        password: "testpassword123",
        points: 450,
        attendanceAccepted: 10,
        submissions: 6,
        referrals: 2,
        graduated: false,
        joined: Date.now(),
      });
      localStorage.setItem("kr8_accounts_v3", JSON.stringify(filtered));
      window.dispatchEvent(new Event("kr8:accounts-updated"));
    }, { testStudentId, testStudentName });

    // 3. Log in as Founder Timfire to access Admin Dashboard
    console.log("3. Logging in as Founder Timfire...");
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

    // If password prompt is visible, submit MAIN_ADMIN_PASSWORD
    const passInput = page.locator('input[type="password"]');
    if (await passInput.count() > 0) {
      await passInput.first().fill("KR8@Adm!n2026");
      const submitBtn = page.locator("button:has-text('Enter'), button:has-text('Sign In'), button:has-text('Unlock'), button:has-text('Submit')");
      if (await submitBtn.count() > 0) await submitBtn.first().click();
      await page.waitForTimeout(1000);
    }

    // 4. Navigate to Graduation & Certificates tab
    console.log("4. Opening Graduation & Certificates tab...");
    const certTab = page.locator("button:has-text('Graduation & Certificates')");
    await certTab.click();
    await page.waitForTimeout(1000);

    // 5. Select our test student
    console.log("5. Selecting test student for graduation...");
    const selectStudent = page.locator("select").first();
    await selectStudent.selectOption(testStudentId);
    await page.waitForTimeout(800);

    // 6. Click "Graduate Student Now →"
    console.log("6. Opening Graduation Modal...");
    const graduateBtn = page.locator("button:has-text('Graduate Student Now')");
    await graduateBtn.click();
    await page.waitForTimeout(800);

    // 7. Select "Certificate of Professionalism"
    console.log("7. Selecting Certificate of Professionalism tier...");
    const profTierBtn = page.locator("button:has-text('Certificate of Professionalism')");
    await profTierBtn.click();

    // 8. Add special honors note
    const notesInput = page.locator("input[placeholder*='Best Performer'], textarea");
    if (await notesInput.count() > 0) {
      await notesInput.first().fill("Distinction in Brand Systems & Visual Identity");
    }

    // 9. Click "Issue Certificate"
    console.log("8. Issuing official certificate...");
    const issueBtn = page.locator("button:has-text('Issue Certificate')");
    await issueBtn.click();

    // 10. Verify Admin Confirmation Screen
    console.log("9. Verifying Admin Success & Live Certificate Preview view...");
    await page.waitForSelector("text=Certificate Successfully Issued! 🎓", { timeout: 10000 });
    console.log("✓ Admin confirmation screen visible!");

    // Verify Download button and Public Verification link exist in modal
    const downloadBtn = page.locator("button:has-text('Download Certificate PDF')");
    const verifyLink = page.locator("a:has-text('Test Public Verification')");
    if (await downloadBtn.count() === 0 || await verifyLink.count() === 0) {
      throw new Error("Admin confirmation screen missing Download or Verify action buttons!");
    }
    console.log("✓ Admin modal has direct Download PDF and Public Verification buttons!");

    // Close modal
    const doneBtn = page.locator("button:has-text('Done')");
    await doneBtn.click();
    await page.waitForTimeout(1000);

    // 11. FULL BROWSER RELOAD — Verify persistence in localStorage (test against QuotaExceededError bug!)
    console.log("10. Simulating browser reload to verify persistent localStorage state...");
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    const isGraduatedInStorage = await page.evaluate((id) => {
      const raw = localStorage.getItem("kr8_accounts_v3");
      const accounts = JSON.parse(raw || "[]");
      const target = accounts.find(a => a.id === id);
      return {
        found: !!target,
        graduated: target?.graduated,
        certTier: target?.certTier,
        certsCount: target?.certificates?.length || 0,
        notifsCount: target?.notifications?.length || 0
      };
    }, testStudentId);

    console.log("Persistent storage check:", isGraduatedInStorage);
    if (!isGraduatedInStorage.graduated || isGraduatedInStorage.certsCount === 0 || isGraduatedInStorage.notifsCount === 0) {
      throw new Error("Graduation failed to persist in localStorage! " + JSON.stringify(isGraduatedInStorage));
    }
    console.log("✓ Graduation data perfectly persisted in localStorage across page reload!");

    // 12. SIGN IN AS THE GRADUATED STUDENT
    console.log("11. Signing in as the graduated student...");
    await page.evaluate((id) => {
      const raw = localStorage.getItem("kr8_accounts_v3");
      const accounts = JSON.parse(raw || "[]");
      const target = accounts.find(a => a.id === id);
      localStorage.setItem("kr8_current", JSON.stringify(target));
      window.dispatchEvent(new Event("kr8:accounts-updated"));
    }, testStudentId);

    // 13. AUDIT 1: STUDENT DASHBOARD (/dashboard)
    console.log("12. Auditing Student Dashboard (/dashboard)...");
    await page.goto("http://localhost:5173/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Check Greeting pill
    const pill = await page.textContent("div.rise-in");
    console.log("Dashboard greeting text:", pill?.slice(0, 80));
    if (!pill?.includes("Certified Graduate")) {
      throw new Error("Dashboard greeting does not recognize the student as a Certified Graduate!");
    }
    console.log("✓ Dashboard header recognizes student as '🎓 Certified Graduate'");

    // Check Hero Celebration Card
    const heroCelebration = page.locator("text=OFFICIAL KR8 CERTIFIED GRADUATE");
    await heroCelebration.waitFor({ state: "visible", timeout: 5000 });
    console.log("✓ Prominent 'OFFICIAL KR8 CERTIFIED GRADUATE' celebration card is visible!");

    const certTitle = page.locator("text=Certificate of Professionalism Earned!");
    await certTitle.waitFor({ state: "visible", timeout: 5000 });
    console.log("✓ 'Certificate of Professionalism Earned!' displayed prominently on Dashboard!");

    // Check certificate preview inside dashboard hero
    const certDoc = page.locator("text=Includes verifiable QR code");
    await certDoc.first().waitFor({ state: "visible", timeout: 8000 });
    console.log("✓ Certificate document rendered with verified QR code on Dashboard!");

    // 14. AUDIT 2: NAVBAR NOTIFICATION BELL
    console.log("13. Auditing Navbar Notification Bell...");
    const bellBtn = page.locator("button[title='Notifications']");
    await bellBtn.click();
    await page.waitForTimeout(500);

    const notifText = page.locator("text=Congratulations! Your Certificate of Professionalism has been issued!");
    await notifText.waitFor({ state: "visible", timeout: 5000 });
    console.log("✓ Graduation notification received in Navbar bell dropdown!");

    // 15. AUDIT 3: STUDENT PROFILE ON /academy
    console.log("14. Auditing Student Profile on /academy...");
    await page.goto("http://localhost:5173/academy");
    await page.waitForLoadState("domcontentloaded");

    // Profile header badge
    const headerBadge = page.locator("text=KR8 Certified Graduate · Professionalism");
    await headerBadge.waitFor({ state: "visible", timeout: 5000 });
    console.log("✓ Profile header badge: '🎓 KR8 Certified Graduate · Professionalism' visible!");

    // Official Credential card
    const credTitle = page.locator("text=Certificate of Professionalism");
    await credTitle.first().waitFor({ state: "visible", timeout: 5000 });
    console.log("✓ 'Certificate of Professionalism' active credential displayed!");

    const qrCheck = page.locator("text=Includes verifiable QR code");
    await qrCheck.first().waitFor({ state: "visible", timeout: 5000 });
    console.log("✓ Live certificate document with QR code rendered in student profile!");

    const downloadOfficialPdf = page.locator("button:has-text('Download Official PDF')");
    if (await downloadOfficialPdf.count() === 0) {
      throw new Error("Missing 'Download Official PDF' button on student profile!");
    }
    console.log("✓ 'Download Official PDF →' button present!");

    // 16. AUDIT 4: PUBLIC VERIFICATION PAGE (/verify)
    console.log("15. Auditing Public Verification Portal (/verify)...");
    await page.goto(`http://localhost:5173/verify?id=${encodeURIComponent(testStudentId)}`);
    await page.waitForLoadState("domcontentloaded");

    await page.waitForSelector("text=Active & Valid ✓", { timeout: 8000 });
    console.log("✓ Standing Status: Active & Valid ✓ verified on public portal!");

    const verifiedCert = page.locator("text=Certificate of Professionalism");
    await verifiedCert.first().waitFor({ state: "visible", timeout: 5000 });
    console.log("✓ Certificate Type: Certificate of Professionalism verified!");

    const citation = page.locator("text=demonstrating excellence and proficiency");
    await citation.waitFor({ state: "visible", timeout: 5000 });
    console.log("✓ Official Achievement Citation verified!");

    const honorsNote = page.locator("text=Distinction in Brand Systems & Visual Identity");
    await honorsNote.waitFor({ state: "visible", timeout: 5000 });
    console.log("✓ Special Honors / Recognition verified!");

    const certImg = page.locator("text=Includes verifiable QR code");
    await certImg.first().waitFor({ state: "visible", timeout: 5000 });
    console.log("✓ Verified Certificate document displayed on public verify page!");

    console.log("\n==============================================================");
    console.log("=== GRADUATION & RECOGNITION AUDIT PASSED 100% SUCCESFULLY! ===");
    console.log("==============================================================");
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
