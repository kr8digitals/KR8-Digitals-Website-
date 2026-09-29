/**
 * STEP 15 Comprehensive Test: KR8 DIGITALS Logo Integration & Overall Branding UI
 */

const fs = require("fs");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 15: LOGO INTEGRATION & BRANDING UI VERIFICATION");
console.log("------------------------------------------------------------");

let failed = false;

// 1. Verify existence of the official high-resolution logo asset
if (fs.existsSync("./public/branding/kr8_logo.png")) {
  const stat = fs.statSync("./public/branding/kr8_logo.png");
  if (stat.size > 10000) {
    console.log(`✓ Official KR8 DIGITALS logo asset verified (${(stat.size / 1024).toFixed(1)} KB)!`);
  } else {
    console.error("✗ Logo file seems too small!");
    failed = true;
  }
} else {
  console.error("✗ Logo file missing at public/branding/kr8_logo.png!");
  failed = true;
}

// 2. Verify Navbar branding integration
const navSrc = fs.readFileSync("./src/components/Navbar.tsx", "utf-8");
if (
  navSrc.includes("/branding/kr8_logo.png") &&
  navSrc.includes("KR8 Digitals Logo") &&
  navSrc.includes("text-gradient font-black text-2xl")
) {
  console.log("✓ Navbar branding integration verified with luminous logo container & elevated typography!");
} else {
  console.error("✗ Navbar branding integration missing!");
  failed = true;
}

// 3. Verify Footer branding integration
const footerSrc = fs.readFileSync("./src/components/Footer.tsx", "utf-8");
if (
  footerSrc.includes("/branding/kr8_logo.png") &&
  footerSrc.includes("KR8 Digitals Logo") &&
  footerSrc.includes("text-gradient font-black text-3xl")
) {
  console.log("✓ Footer branding integration verified!");
} else {
  console.error("✗ Footer branding integration missing!");
  failed = true;
}

// 4. Verify Admin branding integration
const adminSrc = fs.readFileSync("./src/pages/Admin.tsx", "utf-8");
if (adminSrc.includes("/branding/kr8_logo.png")) {
  console.log("✓ Admin header branding integration verified!");
} else {
  console.error("✗ Admin header branding integration missing!");
  failed = true;
}

// 5. Verify SignIn and Verify portals branding integration
const signInSrc = fs.readFileSync("./src/pages/SignInPage.tsx", "utf-8");
const verifySrc = fs.readFileSync("./src/pages/Verify.tsx", "utf-8");
if (signInSrc.includes("/branding/kr8_logo.png") && verifySrc.includes("/branding/kr8_logo.png")) {
  console.log("✓ Member Sign-In and Public Verification portals verified with elevated logo branding!");
} else {
  console.error("✗ Portal branding missing!");
  failed = true;
}

if (failed) {
  console.error("Step 15 verification failed!");
  process.exit(1);
}

console.log("------------------------------------------------------------");
console.log("ALL STEP 15 CHECKS PASSED SUCCESSFULLY!");
console.log("------------------------------------------------------------");
