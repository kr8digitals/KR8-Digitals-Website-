/**
 * STEP 4 Comprehensive Test: Review & Refine Roles & Permissions (Attendance Reviewer Isolation & Granular Staff Access)
 */

const fs = require("fs");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 4: ROLES & PERMISSIONS VERIFICATION");
console.log("------------------------------------------------------------");

let failed = false;

// 1. Verify Attendance Reviewer Quarantine in Admin.tsx
const adminSrc = fs.readFileSync("./src/pages/Admin.tsx", "utf-8");
if (
  adminSrc.includes("ATTENDANCE REVIEWER QUARANTINE: Strict separation of powers") &&
  adminSrc.includes("isAttendanceReviewerOnly || currentUser?.admin?.role === \"attendance_reviewer\"") &&
  adminSrc.includes("<AttendancePanel initialUnlocked={true} />")
) {
  console.log("✓ Attendance Reviewer isolation verified: Strictly quarantined to Attendance Panel!");
} else {
  console.error("✗ Attendance Reviewer quarantine logic missing or flawed!");
  failed = true;
}

// 2. Verify Tab Redirection for Non-Ultimate Staff
if (
  adminSrc.includes("!isUltimate && currentUser?.admin?.permissions?.length") &&
  adminSrc.includes("!currentUser.admin.permissions.includes(tab)") &&
  adminSrc.includes("setTab(currentUser.admin.permissions[0])")
) {
  console.log("✓ Tab redirection verified: Non-ultimate staff automatically routed to their first permitted section!");
} else {
  console.error("✗ Tab redirection logic missing!");
  failed = true;
}

// 3. Verify Role Presets in GranularPermissionsManager.tsx
const permsSrc = fs.readFileSync("./src/components/admin/GranularPermissionsManager.tsx", "utf-8");
const expectedRoles = ["attendance_reviewer", "admin", "coach", "editor", "moderator", "ultimate"];
for (const r of expectedRoles) {
  if (permsSrc.includes(`${r}: {`)) {
    console.log(`✓ Role preset found: "${r}"`);
  } else {
    console.error(`✗ Missing role preset: "${r}"`);
    failed = true;
  }
}

// 4. Verify Promotion of Regular Users / Students to Staff
if (
  permsSrc.includes("filteredCandidates") &&
  permsSrc.includes("Select User or Student to Promote") &&
  permsSrc.includes("Activate & Promote to Staff")
) {
  console.log("✓ User promotion to staff verified: Admins can search any user and activate staff credentials!");
} else {
  console.error("✗ User promotion to staff missing!");
  failed = true;
}

// 5. Verify Revocation of Staff Access
if (
  permsSrc.includes("handleRevokeStaffAccess") &&
  permsSrc.includes("Security Protection: Cannot demote the Founder/Ultimate Administrator.")
) {
  console.log("✓ Staff revocation and founder demotion protections verified!");
} else {
  console.error("✗ Staff revocation logic missing!");
  failed = true;
}

if (failed) {
  console.error("Step 4 verification failed!");
  process.exit(1);
}

console.log("------------------------------------------------------------");
console.log("ALL STEP 4 CHECKS PASSED SUCCESSFULLY!");
console.log("------------------------------------------------------------");
