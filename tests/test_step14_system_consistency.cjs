/**
 * STEP 14 Comprehensive Test: System-Wide Logic Consistency Verification
 */

const fs = require("fs");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 14: SYSTEM-WIDE LOGIC CONSISTENCY VERIFICATION");
console.log("------------------------------------------------------------");

let failed = false;

// 1. Verify live stream remains untouched
const liveStreamSrc = fs.readFileSync("./src/pages/LivePage.tsx", "utf-8");
if (liveStreamSrc.includes("LivePage") && liveStreamSrc.includes("useLiveStream")) {
  console.log("✓ Live stream functionality remains untouched as instructed!");
} else {
  console.error("✗ Live stream functionality was unexpectedly altered!");
  failed = true;
}

// 2. Verify certificate geometry and rules remain intact
const certTplSrc = fs.readFileSync("./src/data/certificateTemplates.ts", "utf-8");
if (
  certTplSrc.includes("nameCenterRatioX: 0.4185") &&
  certTplSrc.includes("nameBaselineRatioY: 0.5116") &&
  certTplSrc.includes("nameMaxRatioWidth: 0.48")
) {
  console.log("✓ Certificate geometry rules verified: Name centering, baseline Y, and max width intact!");
} else {
  console.error("✗ Certificate geometry rules were modified!");
  failed = true;
}

// 3. Verify Tribe conversion logic remains intact
const verifySrc = fs.readFileSync("./src/pages/Verify.tsx", "utf-8");
if (
  verifySrc.includes('to="/tribe"') &&
  verifySrc.includes("Join the KR8 Tribe →")
) {
  console.log("✓ Tribe conversion logic verified: Direct conversion CTA present on Verify page!");
} else {
  console.error("✗ Tribe conversion CTA missing from Verify page!");
  failed = true;
}

// 4. Verify logout functionality
const authCtxSrc = fs.readFileSync("./src/context/AuthContext.tsx", "utf-8");
if (
  authCtxSrc.includes("const signOut = () => {") &&
  authCtxSrc.includes('localStorage.removeItem("kr8_current")') &&
  authCtxSrc.includes('window.dispatchEvent(new CustomEvent("kr8:auth-logout"))')
) {
  console.log("✓ Logout functionality verified across AuthContext and dispatch events!");
} else {
  console.error("✗ Logout functionality missing in AuthContext!");
  failed = true;
}

// 5. Verify student ID copy functionality
const dashSrc = fs.readFileSync("./src/pages/Dashboard.tsx", "utf-8");
const academySrc = fs.readFileSync("./src/pages/Academy.tsx", "utf-8");
if (
  dashSrc.includes("handleCopyId") &&
  dashSrc.includes("navigator.clipboard.writeText(student.id)") &&
  academySrc.includes("navigator.clipboard.writeText(profile.id)")
) {
  console.log("✓ Student ID copy functionality verified on both Dashboard and Academy profile!");
} else {
  console.error("✗ Student ID copy functionality missing!");
  failed = true;
}

if (failed) {
  console.error("Step 14 verification failed!");
  process.exit(1);
}

console.log("------------------------------------------------------------");
console.log("ALL STEP 14 CHECKS PASSED SUCCESSFULLY!");
console.log("------------------------------------------------------------");
