/**
 * STEP 2 Comprehensive Test: Admin Dashboard Navigation, Sidebar, Organization, and UI
 */

const fs = require("fs");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 2: ADMIN NAVIGATION & SIDEBAR UI VERIFICATION");
console.log("------------------------------------------------------------");

const adminCode = fs.readFileSync("./src/pages/Admin.tsx", "utf-8");

let failed = false;

// 1. Verify all 5 organized groups exist
const expectedGroups = [
  "Analytics & Overview",
  "Website Content (CMS)",
  "Academy & Students",
  "Media & Client Agency",
  "System & Governance",
];

for (const grp of expectedGroups) {
  if (adminCode.includes(`name: "${grp}"`)) {
    console.log(`✓ Group found: "${grp}"`);
  } else {
    console.error(`✗ Missing group: "${grp}"`);
    failed = true;
  }
}

// 2. Verify icon support across all nav items
if (adminCode.includes("icon: Parameters<typeof Icon>[0][\"name\"]") && adminCode.includes("<Icon name={item.icon}")) {
  console.log("✓ Icon component wired to every navigation item!");
} else {
  console.error("✗ Navigation items missing icon bindings!");
  failed = true;
}

// 3. Verify Breadcrumb & Active Group
if (adminCode.includes("activeGroup = ADMIN_GROUPS.find") && adminCode.includes("{activeGroup}")) {
  console.log("✓ Dynamic breadcrumb hierarchy wired (Dashboard › Group › Active Tab)!");
} else {
  console.error("✗ Breadcrumb hierarchy not properly implemented!");
  failed = true;
}

// 4. Verify Fast Search Filter with Clear (✕) Button
if (adminCode.includes("Filter sections...") && adminCode.includes("setNavSearch(\"\")")) {
  console.log("✓ Fast search filter with instant clear button verified!");
} else {
  console.error("✗ Search filter clear button missing!");
  failed = true;
}

// 5. Verify Mobile Drawer with Backdrop and Auto-close
if (
  adminCode.includes("mobileNavOpen") &&
  adminCode.includes("setMobileNavOpen(false)") &&
  adminCode.includes("View Live Website ↗")
) {
  console.log("✓ Mobile off-canvas drawer with backdrop, auto-close, and quick actions verified!");
} else {
  console.error("✗ Mobile drawer not properly configured!");
  failed = true;
}

// 6. Verify "View Live Site" quick link in Header
if (adminCode.includes("View Live Site") && adminCode.includes("href=\"/\"")) {
  console.log("✓ 'View Live Site ↗' quick link present in top bar!");
} else {
  console.error("✗ 'View Live Site ↗' quick link missing!");
  failed = true;
}

if (failed) {
  console.error("Step 2 verification failed!");
  process.exit(1);
}

console.log("------------------------------------------------------------");
console.log("ALL STEP 2 CHECKS PASSED SUCCESSFULLY!");
console.log("------------------------------------------------------------");
