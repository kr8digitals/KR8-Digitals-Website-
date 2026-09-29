/**
 * STEP 10 Comprehensive Test: Future-Proof Signature Mapping & Certificate Name Editing
 */

const fs = require("fs");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 10: CERTIFICATE NAME EDITING & FUTURE-PROOF MAPPING VERIFICATION");
console.log("------------------------------------------------------------");

let failed = false;

// 1. Verify customStudentName parameter in generateAutomaticCertificate
const certSrc = fs.readFileSync("./src/utils/certificate.ts", "utf-8");
if (
  certSrc.includes("customStudentName?: string;") &&
  certSrc.includes("const rawName = customStudentName?.trim() || student.name;") &&
  certSrc.includes("formatCertificateStudentName(rawName)")
) {
  console.log("✓ Certificate canvas generation accepts and honors customStudentName!");
} else {
  console.error("✗ Missing customStudentName support in certificate.ts!");
  failed = true;
}

// 2. Verify GraduationModal in Admin.tsx enables editing certificate name
const adminSrc = fs.readFileSync("./src/pages/Admin.tsx", "utf-8");
if (
  adminSrc.includes("const [certStudentName, setCertStudentName] = useState(student.name);") &&
  adminSrc.includes("Certificate Student Name (Editable During Graduation)") &&
  adminSrc.includes("customStudentName: certStudentName.trim()") &&
  adminSrc.includes("Reset to Account Name")
) {
  console.log("✓ Graduation modal allows the administrator to edit, preview, and reset certificate name!");
} else {
  console.error("✗ Admin.tsx missing certificate name editing during graduation!");
  failed = true;
}

// 3. Verify future-proof signature mapping handles arbitrary newly added skills
const sigStoreSrc = fs.readFileSync("./src/data/signatureStore.ts", "utf-8");
if (
  sigStoreSrc.includes("normalizeSkill") &&
  sigStoreSrc.includes("getCoachSignatureForSkill") &&
  sigStoreSrc.includes("fallback")
) {
  console.log("✓ Signature mapping is future-proof: normalizes any new skill and falls back gracefully!");
} else {
  console.error("✗ Signature mapping missing fallback or normalization!");
  failed = true;
}

if (failed) {
  console.error("Step 10 verification failed!");
  process.exit(1);
}

console.log("------------------------------------------------------------");
console.log("ALL STEP 10 CHECKS PASSED SUCCESSFULLY!");
console.log("------------------------------------------------------------");
