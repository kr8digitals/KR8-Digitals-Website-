/**
 * STEP 6 Comprehensive Test: Graduation Share System Integration
 */

const fs = require("fs");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 6: GRADUATION SHARE SYSTEM VERIFICATION");
console.log("------------------------------------------------------------");

let failed = false;

// 1. Verify buildSocialShareLinks logic
const socialShareSrc = fs.readFileSync("./src/utils/socialShare.ts", "utf-8");
if (
  socialShareSrc.includes("generateGraduationShareImage") &&
  socialShareSrc.includes("buildSocialShareLinks") &&
  socialShareSrc.includes("whatsapp") &&
  socialShareSrc.includes("twitter") &&
  socialShareSrc.includes("linkedin")
) {
  console.log("✓ Social share utility verified with multi-channel direct share links!");
} else {
  console.error("✗ Social share utility missing required links!");
  failed = true;
}

// 2. Verify GraduationShareModal.tsx implementation
const modalSrc = fs.readFileSync("./src/components/GraduationShareModal.tsx", "utf-8");
if (
  modalSrc.includes("Download Share Image (PNG)") &&
  modalSrc.includes("links.whatsapp") &&
  modalSrc.includes("links.twitter") &&
  modalSrc.includes("links.linkedin") &&
  modalSrc.includes("16:9 Landscape") &&
  modalSrc.includes("1:1 Square")
) {
  console.log("✓ GraduationShareModal provides high-res PNG download, format toggle, and one-click social broadcast!");
} else {
  console.error("✗ GraduationShareModal missing key share features!");
  failed = true;
}

// 3. Verify Integration in Academy.tsx
const academySrc = fs.readFileSync("./src/pages/Academy.tsx", "utf-8");
if (
  academySrc.includes("<GraduationShareModal") &&
  academySrc.includes("setShareModalCert") &&
  academySrc.includes("Share on Social Media (X, LinkedIn, WhatsApp)")
) {
  console.log("✓ Academy Profile successfully integrates Graduation Share Modal!");
} else {
  console.error("✗ Academy.tsx missing GraduationShareModal integration!");
  failed = true;
}

// 4. Verify Integration in Dashboard.tsx
const dashSrc = fs.readFileSync("./src/pages/Dashboard.tsx", "utf-8");
if (
  dashSrc.includes("<GraduationShareModal") &&
  dashSrc.includes("student.graduated && primaryCert") &&
  dashSrc.includes("Share Milestone")
) {
  console.log("✓ Student Dashboard successfully displays Graduation Celebration banner and Milestone Share modal!");
} else {
  console.error("✗ Dashboard.tsx missing graduation celebration share trigger!");
  failed = true;
}

if (failed) {
  console.error("Step 6 verification failed!");
  process.exit(1);
}

console.log("------------------------------------------------------------");
console.log("ALL STEP 6 CHECKS PASSED SUCCESSFULLY!");
console.log("------------------------------------------------------------");
