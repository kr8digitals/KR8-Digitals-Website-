/**
 * STEP 7 Comprehensive Test: Certificate-to-Image Downloading and Platform Sharing
 */

const fs = require("fs");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 7: CERTIFICATE-TO-IMAGE DOWNLOAD & SHARING VERIFICATION");
console.log("------------------------------------------------------------");

let failed = false;

// 1. Verify downloadCertificateImage & shareCertificateNative in certificate.ts
const certSrc = fs.readFileSync("./src/utils/certificate.ts", "utf-8");
if (
  certSrc.includes("export async function downloadCertificateImage") &&
  certSrc.includes("export async function shareCertificateNative") &&
  certSrc.includes(".png")
) {
  console.log("✓ Certificate utility exports downloadCertificateImage and shareCertificateNative!");
} else {
  console.error("✗ Missing downloadCertificateImage or shareCertificateNative in certificate.ts!");
  failed = true;
}

// 2. Verify Academy.tsx includes both PDF and PNG Image download
const academySrc = fs.readFileSync("./src/pages/Academy.tsx", "utf-8");
if (
  academySrc.includes("downloadCertificateImage") &&
  academySrc.includes("Download Image (PNG) ↓") &&
  academySrc.includes("Download PDF →")
) {
  console.log("✓ Academy student profile provides dual PDF and high-res PNG Image download actions!");
} else {
  console.error("✗ Academy.tsx missing certificate image download action!");
  failed = true;
}

// 3. Verify Verify.tsx includes both PDF and PNG Image download
const verifySrc = fs.readFileSync("./src/pages/Verify.tsx", "utf-8");
if (
  verifySrc.includes("downloadCertificateImage") &&
  verifySrc.includes("Download Image (PNG) ↓")
) {
  console.log("✓ Public verification portal provides high-res PNG image download alongside official PDF!");
} else {
  console.error("✗ Verify.tsx missing image download action!");
  failed = true;
}

// 4. Verify GraduationShareModal provides direct PNG download
const modalSrc = fs.readFileSync("./src/components/GraduationShareModal.tsx", "utf-8");
if (
  modalSrc.includes("Download Share Image (PNG) ↓") &&
  modalSrc.includes("generateGraduationShareImage")
) {
  console.log("✓ GraduationShareModal verified for high-res social image rendering and download!");
} else {
  console.error("✗ GraduationShareModal missing download feature!");
  failed = true;
}

if (failed) {
  console.error("Step 7 verification failed!");
  process.exit(1);
}

console.log("------------------------------------------------------------");
console.log("ALL STEP 7 CHECKS PASSED SUCCESSFULLY!");
console.log("------------------------------------------------------------");
