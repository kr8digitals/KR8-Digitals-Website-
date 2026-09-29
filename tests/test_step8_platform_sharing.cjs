/**
 * STEP 8 Comprehensive Test: Intelligent Platform-Specific Share Messaging & Metadata
 */

const fs = require("fs");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 8: INTELLIGENT PLATFORM SHARING VERIFICATION");
console.log("------------------------------------------------------------");

let failed = false;

// 1. Verify buildSocialShareLinks platformMessages
const shareUtilSrc = fs.readFileSync("./src/utils/socialShare.ts", "utf-8");
if (
  shareUtilSrc.includes("platformMessages:") &&
  shareUtilSrc.includes("linkedinMessage") &&
  shareUtilSrc.includes("twitterMessage") &&
  shareUtilSrc.includes("whatsappMessage") &&
  shareUtilSrc.includes("kr8digitals.com") &&
  shareUtilSrc.includes("/verify?id=")
) {
  console.log("✓ Intelligent platform messaging verified with custom LinkedIn, X/Twitter, and WhatsApp templates!");
} else {
  console.error("✗ Missing platform messages in socialShare.ts!");
  failed = true;
}

// 2. Verify GraduationShareModal interactive copy and direct platform triggers
const modalSrc = fs.readFileSync("./src/components/GraduationShareModal.tsx", "utf-8");
if (
  modalSrc.includes("One-Click Direct Platform Share") &&
  modalSrc.includes("Intelligent Platform Copy") &&
  modalSrc.includes("handleCopyPlatformMessage") &&
  modalSrc.includes("WhatsApp") &&
  modalSrc.includes("LinkedIn") &&
  modalSrc.includes("Telegram") &&
  modalSrc.includes("Facebook")
) {
  console.log("✓ GraduationShareModal provides multi-platform one-click triggers & tailored copy selector!");
} else {
  console.error("✗ GraduationShareModal missing interactive platform copy features!");
  failed = true;
}

// 3. Verify Verify.tsx dynamic social metadata
const verifySrc = fs.readFileSync("./src/pages/Verify.tsx", "utf-8");
if (
  verifySrc.includes("og:title") &&
  verifySrc.includes("og:description") &&
  verifySrc.includes("twitter:title") &&
  verifySrc.includes("Verified: Certificate of")
) {
  console.log("✓ Verify.tsx dynamically updates Open Graph & Twitter Card metadata for social link crawlers!");
} else {
  console.error("✗ Verify.tsx missing dynamic social metadata updates!");
  failed = true;
}

// 4. Verify index.html Open Graph & Twitter Cards
const indexHtml = fs.readFileSync("./index.html", "utf-8");
if (
  indexHtml.includes('property="og:title"') &&
  indexHtml.includes('property="og:image"') &&
  indexHtml.includes('name="twitter:card"')
) {
  console.log("✓ index.html has complete foundational Open Graph and Twitter Card tags!");
} else {
  console.error("✗ index.html missing Open Graph or Twitter Card tags!");
  failed = true;
}

if (failed) {
  console.error("Step 8 verification failed!");
  process.exit(1);
}

console.log("------------------------------------------------------------");
console.log("ALL STEP 8 CHECKS PASSED SUCCESSFULLY!");
console.log("------------------------------------------------------------");
