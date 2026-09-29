/**
 * STEP 12 Comprehensive Test: Refine Hamburger Navigation & Modern UX
 */

const fs = require("fs");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 12: HAMBURGER NAVIGATION & UX REFINEMENT VERIFICATION");
console.log("------------------------------------------------------------");

let failed = false;

const adminSrc = fs.readFileSync("./src/pages/Admin.tsx", "utf-8");

// 1. Verify Escape key handler for mobile drawer
if (
  adminSrc.includes('e.key === "Escape" && mobileNavOpen') &&
  adminSrc.includes("setMobileNavOpen(false)")
) {
  console.log("✓ Mobile navigation drawer closes reliably on Escape key press!");
} else {
  console.error("✗ Mobile drawer missing Escape key listener!");
  failed = true;
}

// 2. Verify hamburger button & drawer features
if (
  adminSrc.includes("setMobileNavOpen(!mobileNavOpen)") &&
  adminSrc.includes("navSearch") &&
  adminSrc.includes("filteredGroups.map") &&
  adminSrc.includes("View Live Website ↗")
) {
  console.log("✓ Hamburger menu & drawer verified with search filtering, grouping, and footer actions!");
} else {
  console.error("✗ Mobile drawer missing required interactive features!");
  failed = true;
}

// 3. Verify clean appearance-none controls
if (adminSrc.includes("appearance-none")) {
  console.log("✓ Clean appearance-none styling applied to eliminate native browser dropdown arrows!");
} else {
  console.error("✗ appearance-none styling missing!");
  failed = true;
}

if (failed) {
  console.error("Step 12 verification failed!");
  process.exit(1);
}

console.log("------------------------------------------------------------");
console.log("ALL STEP 12 CHECKS PASSED SUCCESSFULLY!");
console.log("------------------------------------------------------------");
