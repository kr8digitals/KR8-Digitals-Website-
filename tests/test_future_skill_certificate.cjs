const { chromium } = require("playwright");

async function run() {
  console.log("=== STARTING STEP 1: FUTURE-SKILL CERTIFICATE SYSTEM TEST ===");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Visit website
    console.log("1. Visiting website...");
    await page.goto("http://localhost:5173/", { waitUntil: "domcontentloaded" });

    // 2. Add custom skill "UI/UX Design" via official store function
    console.log("2. Adding custom skill 'UI/UX Design'...");
    await page.evaluate(async () => {
      const { saveCustomSkill } = await import("/src/data/store.ts");
      saveCustomSkill({
        key: "uiux",
        name: "UI/UX Design",
        suffix: "UIUXVFD",
        available: true,
        regOpen: true,
        snippet: "Master wireframing, high-fidelity prototyping, user empathy mapping, and design systems in Figma.",
        icon: "palette",
        instructor: {
          name: "Amaka Chisom",
          photo: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300",
          bio: "Senior Product Designer with 6+ years designing consumer interfaces."
        },
        criteria: "Submit 6 UI prototypes + a complete mobile app case study.",
        curriculum: []
      });
    });

    // 3. Verify that UI/UX Design appears on the Academy page
    console.log("3. Verifying skill visibility on /academy...");
    await page.goto("http://localhost:5173/academy", { waitUntil: "domcontentloaded" });
    const content = await page.content();
    if (!content.includes("UI/UX Design")) {
      throw new Error("UI/UX Design not found on Academy page!");
    }
    console.log("✓ UI/UX Design appears correctly in Academy page!");

    // 4. Register student for UI/UX Design via registerStudent
    console.log("4. Registering student for UI/UX Design...");
    const student = await page.evaluate(async () => {
      const { registerStudent } = await import("/src/data/store.ts");
      const email = `test.uiux.${Date.now()}@example.com`;
      const phone = `+23480${Math.floor(10000000 + Math.random() * 89999999)}`;
      const res = registerStudent({
        name: "David Nnamdi Okon",
        email,
        phone,
        country: "NG",
        skill: "uiux",
        dob: "2000-01-01",
        password: "Password123!"
      });
      if (!res.ok || !res.student) throw new Error("Registration failed: " + res.error);
      
      localStorage.setItem("kr8_current", JSON.stringify(res.student));
      localStorage.setItem("kr8_last_active", String(Date.now()));
      return res.student;
    });
    console.log("✓ Student registered with ID:", student.id, "for skill:", student.skill);

    if (!student.id.includes("UIUX")) {
      throw new Error("Student ID missing UIUX suffix: " + student.id);
    }

    // 5. Test Dynamic Certificate Generation in browser
    console.log("5. Testing Dynamic Certificate Generation in browser...");
    const certTest = await page.evaluate(async (student) => {
      const { getCertificateTemplate } = await import("/src/data/certificateTemplates.ts");
      const { generateAutomaticCertificate } = await import("/src/utils/certificate.ts");

      // Verify template config
      const configProf = getCertificateTemplate("uiux", "Professionalism", "UI/UX Design");
      const configComp = getCertificateTemplate("uiux", "Completion", "UI/UX Design");

      if (!configProf.isDynamicSkillText) throw new Error("configProf must have isDynamicSkillText=true");
      if (!configComp.isDynamicSkillText) throw new Error("configComp must have isDynamicSkillText=true");
      if (configProf.courseName !== "UI/UX Design") throw new Error("Wrong courseName: " + configProf.courseName);
      if (!configProf.templateUrl.includes("professionalism")) throw new Error("Wrong prof template: " + configProf.templateUrl);
      if (!configComp.templateUrl.includes("completion")) throw new Error("Wrong comp template: " + configComp.templateUrl);

      // Generate the certificate with canvas
      const genResult = await generateAutomaticCertificate({
        student,
        skillKey: "uiux",
        tier: "Professionalism",
        courseName: "UI/UX Design",
        origin: window.location.origin,
      });

      return {
        certId: genResult.certId,
        formattedName: genResult.formattedName,
        courseName: genResult.courseName,
        tier: genResult.tier,
        verifyUrl: genResult.verifyUrl,
        hasImage: genResult.imageUrl.startsWith("data:image/jpeg"),
        hasPdf: genResult.pdfBytes.length > 1000,
      };
    }, student);

    console.log("✓ Dynamic Certificate generated successfully:", certTest);

    if (certTest.formattedName !== "DAVID N. OKON") {
      throw new Error("Student name format mismatch: expected DAVID N. OKON, got " + certTest.formattedName);
    }
    if (certTest.courseName !== "UI/UX Design") {
      throw new Error("Course name mismatch: expected UI/UX Design, got " + certTest.courseName);
    }
    if (!certTest.hasImage || !certTest.hasPdf) {
      throw new Error("Missing image or PDF bytes!");
    }

    // 6. Issue the certificate into student record & database via issueCertificate
    console.log("6. Storing certificate record via issueCertificate...");
    await page.evaluate(async ({ certTest, student }) => {
      const { issueCertificate } = await import("/src/data/store.ts");
      const certRecord = {
        id: certTest.certId,
        studentId: student.id,
        studentName: student.name,
        formattedName: certTest.formattedName,
        skill: "uiux",
        skillName: "UI/UX Design",
        tier: "Professionalism",
        templateUrl: "/certificates/reusable_professionalism.png",
        achievementText: "demonstrating excellence and proficiency in turning client requests into client satisfaction.",
        additionalNotes: "Distinguished Figma Prototypes",
        issuedAt: Date.now(),
        issuedBy: "KR8 Administrator",
        status: "active",
        certificateImageUrl: "data:image/jpeg;base64,mock",
      };

      const res = issueCertificate(student.id, certRecord);
      if (!res.ok) throw new Error("issueCertificate failed: " + res.error);
      
      // Update session with updated account
      localStorage.setItem("kr8_current", JSON.stringify(res.account));
      localStorage.setItem("kr8_last_active", String(Date.now()));
    }, { certTest, student });

    // 7. Verify the Certificate on /verify page
    console.log("7. Verifying /verify route for future skill certificate...");
    await page.goto(`http://localhost:5173/verify?id=${encodeURIComponent(student.id)}&cert=${encodeURIComponent(certTest.certId)}`, { waitUntil: "domcontentloaded" });
    const verifyPageText = await page.innerText("body");
    
    if (!verifyPageText.includes("UI/UX Design")) {
      throw new Error("Verification page does not mention 'UI/UX Design'!");
    }
    if (!verifyPageText.includes("Certificate of Professionalism")) {
      throw new Error("Verification page does not state 'Certificate of Professionalism'!");
    }
    if (!verifyPageText.includes("Valid & In Good Standing")) {
      throw new Error("Verification page does not show active badge!");
    }
    console.log("✓ Verification page successfully verified UI/UX Design Certificate of Professionalism!");

    // 8. Test Academy page student profile certificate presentation
    console.log("8. Verifying student certificate section in /academy...");
    await page.goto("http://localhost:5173/academy", { waitUntil: "domcontentloaded" });
    const academyPageText = await page.innerText("body");
    
    if (!academyPageText.includes("David Nnamdi Okon")) {
      throw new Error("Student profile name not displayed on Academy page!");
    }
    if (!academyPageText.includes("Congratulations!")) {
      throw new Error("Student notification banner not displayed!");
    }
    if (!academyPageText.includes("Certificate of Professionalism")) {
      throw new Error("Certificate of Professionalism not displayed in Academy profile!");
    }
    console.log("✓ Student Academy profile displays Congratulations notification, student name, and Certificate!");

    console.log("=== STEP 1 VERIFICATION COMPLETE: ALL 14 CRITERIA PASSED 100% ===");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
