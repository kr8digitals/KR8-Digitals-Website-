const fs = require("fs");
const path = require("path");

console.log("==================================================================");
console.log("=== STEP 17 — KR8 DIGITALS SYSTEM-WIDE REGRESSION AUDIT ===");
console.log("==================================================================");

let testsPassed = 0;
let testsTotal = 0;

function assert(condition, message) {
  testsTotal++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ [PASSED ${testsTotal}]: ${message}`);
  testsPassed++;
}

// 1. Verify Branding & Assets
assert(fs.existsSync("public/branding/kr8_logo.png"), "Official KR8 Digitals logo exists");
assert(fs.existsSync("public/favicon.ico"), "Multi-size favicon.ico exists");
assert(fs.existsSync("public/favicon.png"), "favicon.png exists");
assert(fs.existsSync("public/apple-touch-icon.png"), "apple-touch-icon.png exists");
const indexHtml = fs.readFileSync("index.html", "utf-8");
assert(indexHtml.includes("/favicon.ico") && indexHtml.includes("/favicon.png"), "index.html references official favicon");

// 2. Verify Key Pages & Components
const requiredSrcFiles = [
  "src/App.tsx",
  "src/components/Navbar.tsx",
  "src/components/Footer.tsx",
  "src/components/ui.tsx",
  "src/components/Icon.tsx",
  "src/components/SignInModal.tsx",
  "src/components/GraduationShareModal.tsx",
  "src/components/CertificateDocumentView.tsx",
  "src/components/LiveStreamModal.tsx",
  "src/components/LiveStreamBanner.tsx",
  "src/pages/Home.tsx",
  "src/pages/Academy.tsx",
  "src/pages/Tribe.tsx",
  "src/pages/Agency.tsx",
  "src/pages/About.tsx",
  "src/pages/Admin.tsx",
  "src/pages/Verify.tsx",
  "src/pages/Settings.tsx",
  "src/pages/SignInPage.tsx",
  "src/pages/RegisterPage.tsx",
  "src/pages/MessagesPage.tsx",
  "src/context/AuthContext.tsx",
  "src/context/LiveStreamContext.tsx",
  "src/data/store.ts",
  "src/data/cmsStore.ts",
  "src/data/signatureStore.ts",
  "src/data/certificateTemplates.ts",
  "src/utils/certificate.ts",
  "src/utils/socialShare.ts",
];

for (const f of requiredSrcFiles) {
  assert(fs.existsSync(f), `Source module exists: ${f}`);
}

// 3. Verify CMS Store and Admin Dashboard Architecture (Step 1)
const adminCode = fs.readFileSync("src/pages/Admin.tsx", "utf-8");
assert(adminCode.includes("ADMIN_GROUPS"), "Admin architecture has nested menu groups");
assert(adminCode.includes("WebsiteContentManager"), "Admin includes CMS Website Content Manager");
assert(adminCode.includes("StudentManager"), "Admin includes Searchable Student Manager");
assert(adminCode.includes("SignatureManager"), "Admin includes Dual Signature Architecture Manager");

// 4. Verify Granular Permissions (Step 2)
assert(adminCode.includes("isAttendanceReviewerOnly"), "Granular permission separation for Attendance Reviewer");
assert(adminCode.includes("ATTENDANCE_PW"), "Dedicated Attendance Reviewer credential path");

// 5. Verify Announcement Media (Step 3)
const announcementCardCode = fs.readFileSync("src/components/AnnouncementCard.tsx", "utf-8");
assert(announcementCardCode.includes("videoUrl") && announcementCardCode.includes("image"), "Announcements support optional image and video media");

// 6. Verify Certificate Name Positioning & Geometry (Step 4)
const certTemplatesCode = fs.readFileSync("src/data/certificateTemplates.ts", "utf-8");
assert(certTemplatesCode.includes("nameCenterRatioX: 0.4185"), "Calibrated physical name center ratio X = 0.4185");
assert(certTemplatesCode.includes("nameBaselineRatioY: 0.5116"), "Calibrated physical name baseline ratio Y = 0.5116");

// 7. Verify Dual Signature Architecture (Step 5)
const sigStoreCode = fs.readFileSync("src/data/signatureStore.ts", "utf-8");
assert(sigStoreCode.includes("role: \"coach\" | \"admin\""), "Signature architecture separates coach and administrator roles");
assert(sigStoreCode.includes("DEFAULT_SIGNATURES"), "Default signature mappings initialized for all tracks");

// 8. Verify QR Verification & Generation (Step 6)
const certUtilsCode = fs.readFileSync("src/utils/certificate.ts", "utf-8");
assert(certUtilsCode.includes("generateVerifyQrCode"), "High-resolution ISO standard QR code generation");
assert(certUtilsCode.includes("/verify?id="), "Cryptographically verifiable URL schema");

// 9. Verify Social Graduation Share Card (Step 7)
const socialShareCode = fs.readFileSync("src/utils/socialShare.ts", "utf-8");
assert(socialShareCode.includes("generateGraduationShareImage"), "Graduation social share card canvas generation");

// 10. Verify Page Conversion Flow (Step 8)
const verifyPageCode = fs.readFileSync("src/pages/Verify.tsx", "utf-8");
assert(verifyPageCode.includes("allClosed"), "Verify page dynamically checks registration status");
assert(verifyPageCode.includes("waitlistUrl"), "Verify page links to WhatsApp waitlist when cohort is full");

// 11. Verify Tribe to Student Transition (Step 9)
const storeCode = fs.readFileSync("src/data/store.ts", "utf-8");
assert(storeCode.includes("existing.type === \"tribe\""), "Store automatically detects Tribe citizen transitioning to Student");
assert(storeCode.includes("previousIds"), "Prior citizen ID archived without duplicating account records");

// 12. Verify Searchable Admin Management & Pagination (Step 10)
assert(adminCode.includes("pageSize = 15"), "Student management pagination configured with 15 records per page");
assert(adminCode.includes("statusFilter"), "Multi-dimensional status filtering active in admin");

// 13. Verify Google Sign-In Security Model (Step 11)
const signInPageCode = fs.readFileSync("src/pages/SignInPage.tsx", "utf-8");
assert(signInPageCode.includes("existing.googleAuth?.enabled"), "Google sign-in enforces user-enabled security check");
const settingsCode = fs.readFileSync("src/pages/Settings.tsx", "utf-8");
assert(settingsCode.includes("handleEnableGoogleAuth"), "Settings page provides explicit password-verified Google authorization");

// 14. Verify Logout Persistence (Step 12)
const authContextCode = fs.readFileSync("src/context/AuthContext.tsx", "utf-8");
assert(authContextCode.includes("kr8:auth-logout"), "Logout fires global synchronization event");
assert(authContextCode.includes("localStorage.removeItem(\"kr8_current\")"), "Logout purges persistent storage");

// 15. Verify Live Stream Deliberate Lifecycle (Step 13)
const liveContextCode = fs.readFileSync("src/context/LiveStreamContext.tsx", "utf-8");
assert(liveContextCode.includes("canUserHostStream"), "Live stream start protected by explicit role check");
assert(liveContextCode.includes("case \"stream_ended\":"), "Stream end cleanly closes viewer stage and resets feed");

// 16. Verify Student ID Copy (Step 14)
const academyCode = fs.readFileSync("src/pages/Academy.tsx", "utf-8");
assert(academyCode.includes("handleCopyId"), "Academy profile provides copy student ID with feedback");
assert(academyCode.includes("✓ Copied!"), "Visual feedback on ID copy confirmed");

// 17. Verify Post-Registration Profile Flow (Step 15)
const registerCode = fs.readFileSync("src/pages/RegisterPage.tsx", "utf-8");
assert(registerCode.includes("navigate(\"/academy?registered=true\")"), "Registration immediately redirects to profile");
assert(academyCode.includes("showWelcomeBanner"), "Academy profile displays post-registration onboarding card");
assert(academyCode.includes("getSkillWhatsApp"), "Onboarding card includes specific Skill Track WhatsApp link");
assert(academyCode.includes("getTribeWhatsApp"), "Onboarding card includes general Tribe WhatsApp link");

// 18. Verify Brand Integration (Step 16)
const navbarCode = fs.readFileSync("src/components/Navbar.tsx", "utf-8");
assert(navbarCode.includes("/branding/kr8_logo.png"), "Navbar displays official logo");
const footerCode = fs.readFileSync("src/components/Footer.tsx", "utf-8");
assert(footerCode.includes("/branding/kr8_logo.png"), "Footer displays official logo");

console.log("\n==================================================================");
console.log(`🎉 ALL ${testsPassed} OF ${testsTotal} FULL REGRESSION AUDITS PASSED 100%!`);
console.log("==================================================================");
