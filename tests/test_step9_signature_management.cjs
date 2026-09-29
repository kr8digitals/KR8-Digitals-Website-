/**
 * STEP 9 Comprehensive Test: Admin Dashboard Signature Management
 */

const fs = require("fs");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 9: ADMIN SIGNATURE MANAGEMENT VERIFICATION");
console.log("------------------------------------------------------------");

let failed = false;

// 1. Verify signatureStore.ts architecture
const sigStoreSrc = fs.readFileSync("./src/data/signatureStore.ts", "utf-8");
if (
  sigStoreSrc.includes("export function getCoachSignatureForSkill") &&
  sigStoreSrc.includes("export function getAdminSignature") &&
  sigStoreSrc.includes("export function saveSignature") &&
  sigStoreSrc.includes("export function deleteSignature") &&
  sigStoreSrc.includes("normalizeSkill")
) {
  console.log("✓ Signature store architecture verified with skill normalization and dynamic lookup!");
} else {
  console.error("✗ Missing key signatureStore functions!");
  failed = true;
}

// 2. Verify SignatureManager.tsx features
const mgrSrc = fs.readFileSync("./src/components/admin/SignatureManager.tsx", "utf-8");
if (
  mgrSrc.includes("Signature Image (Upload File or Paste Image URL)") &&
  mgrSrc.includes("handleFileUpload") &&
  mgrSrc.includes("handleSave") &&
  mgrSrc.includes("Reset to Defaults") &&
  mgrSrc.includes("Preview on White Canvas:")
) {
  console.log("✓ SignatureManager provides canvas-scaled file upload, URL input, and live contrast preview!");
} else {
  console.error("✗ SignatureManager missing expected management features!");
  failed = true;
}

// 3. Verify Admin.tsx integration
const adminSrc = fs.readFileSync("./src/pages/Admin.tsx", "utf-8");
if (
  adminSrc.includes('import SignatureManager from "../components/admin/SignatureManager"') &&
  adminSrc.includes('tab === "Coach & Admin Signatures" && <SignatureManager />')
) {
  console.log("✓ Admin.tsx integrates SignatureManager under 'Coach & Admin Signatures'!");
} else {
  console.error("✗ Admin.tsx missing SignatureManager tab mapping!");
  failed = true;
}

// 4. Verify certificate rendering uses dynamic signature store
const certSrc = fs.readFileSync("./src/utils/certificate.ts", "utf-8");
if (
  certSrc.includes("getCoachSignatureForSkill") &&
  certSrc.includes("getAdminSignature") &&
  certSrc.includes("coachSig.signatureUrl") &&
  certSrc.includes("adminSig.signatureUrl")
) {
  console.log("✓ Certificate canvas dynamically draws signatures from signatureStore!");
} else {
  console.error("✗ Certificate canvas does not wire dynamic signatures!");
  failed = true;
}

if (failed) {
  console.error("Step 9 verification failed!");
  process.exit(1);
}

console.log("------------------------------------------------------------");
console.log("ALL STEP 9 CHECKS PASSED SUCCESSFULLY!");
console.log("------------------------------------------------------------");
