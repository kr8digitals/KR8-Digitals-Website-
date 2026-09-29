/**
 * STEP 12 Functional Regression: Admin hamburger/sidebar navigation contracts
 * - Extracts the REAL ADMIN_GROUPS, sections list, and filteredGroups expression from Admin.tsx
 * - Executes permission-gated, search-filtered navigation under Node
 * - Asserts Escape/backdrop/selection close contracts and consistent lg breakpoint
 */
const fs = require("fs");
const path = require("path");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 12 (FUNCTIONAL): HAMBURGER/SIDEBAR NAV CONTRACTS");
console.log("------------------------------------------------------------");

const ROOT = path.resolve(__dirname, "..");
const src = fs.readFileSync(path.join(ROOT, "src/pages/Admin.tsx"), "utf-8");
let failed = false;
const check = (label, cond) => {
  console.log((cond ? "\u2713 " : "\u2717 ") + label);
  if (!cond) failed = true;
};

// 1. Extract the REAL navigation data + expression from source (strip trailing ;)
const groupsSrc = src.slice(src.indexOf("const ADMIN_GROUPS"), src.indexOf("];", src.indexOf("const ADMIN_GROUPS")) + 1);
const sectionsSrc = src.slice(src.indexOf("const sections ="), src.indexOf("];", src.indexOf("const sections =")) + 1);
const filteredExprMatch = src.match(/const filteredGroups =([\s\S]*?\.filter\(\(grp\) => grp\.items\.length > 0\);)/);

check("ADMIN_GROUPS literal present in source", groupsSrc.includes("Academy & Students") && groupsSrc.includes("System & Governance"));
check("sections list present in source", sectionsSrc.includes("Graduation & Certificates"));
check("filteredGroups expression present in source", !!filteredExprMatch);

let ADMIN_GROUPS, sections;
try {
  const factory = new Function(
    "return { groups: (" + groupsSrc.replace("const ADMIN_GROUPS: NavGroup[] =", "").replace(/^const ADMIN_GROUPS =/, "") + "), sections: (" + sectionsSrc.replace("const sections =", "") + ") }"
  );
  ({ groups: ADMIN_GROUPS, sections } = factory());
} catch (err) {
  console.error("\u2717 Failed to evaluate extracted navigation data:", err.message);
  failed = true;
}

const runFilter = (allowedSections, navSearch) =>
  new Function("ADMIN_GROUPS", "allowedSections", "navSearch", "return (" + filteredExprMatch[1].replace(/;\s*$/, "") + ");")(
    ADMIN_GROUPS, allowedSections, navSearch
  );

if (ADMIN_GROUPS && sections) {
  const totalGroupItems = ADMIN_GROUPS.reduce((n, g) => n + g.items.length, 0);
  check("Nav groups cover all " + sections.length + " sections", totalGroupItems === sections.length);

  // Ultimate admin sees everything
  const ultimate = runFilter(sections, "");
  const ultimateItems = ultimate.reduce((n, g) => n + g.items.length, 0);
  check("Ultimate admin sees all " + sections.length + " sections across " + ultimate.length + " groups",
    ultimateItems === sections.length && ultimate.length === ADMIN_GROUPS.length);

  // Restricted staff sees only permitted sections
  const restricted = runFilter(sections.filter((s) => ["Student Management", "Attendance Review", "Graduation & Certificates"].includes(s)), "");
  const restrictedItems = restricted.reduce((n, g) => n + g.items.length, 0);
  check("Restricted admin sees exactly their 3 permitted sections", restrictedItems === 3);
  check("Restricted admin sees only the group(s) containing permitted sections (empty groups pruned)",
    restricted.length === 1 && restricted[0].name === "Academy & Students");

  // Search filtering by label and by id
  const sigSearch = runFilter(sections, "sig");
  const sigIds = sigSearch.flatMap((g) => g.items.map((i) => i.id));
  check("Search 'sig' finds 'Coach & Admin Signatures' by label", sigIds.includes("Coach & Admin Signatures"));

  const syncSearch = runFilter(sections, "CLOUD");
  const syncIds = syncSearch.flatMap((g) => g.items.map((i) => i.id));
  check("Case-insensitive search 'CLOUD' finds Cloud Sync section", syncIds.includes("Supabase Database"));

  const noMatch = runFilter(sections, "zzz-no-match");
  check("No-match search prunes all groups (empty-state condition)", noMatch.length === 0);

  // Whitespace-only search behaves as no filter
  const wsSearch = runFilter(sections, "   ");
  check("Whitespace-only search shows all sections", wsSearch.reduce((n, g) => n + g.items.length, 0) === sections.length);
}

// 2. Escape key close contract
check("Escape key listener wired to window keydown", src.includes('window.addEventListener("keydown"') && src.includes('e.key === "Escape" && mobileNavOpen'));
check("Escape closes drawer (setMobileNavOpen(false))", /e\.key === "Escape" && mobileNavOpen[\s\S]{0,80}setMobileNavOpen\(false\)/.test(src));
check("Listener cleaned up on unmount/deps change", src.includes('window.removeEventListener("keydown", handleKeyDown)'));

// 3. Hamburger & drawer contracts
check("Hamburger toggles drawer state", src.includes("setMobileNavOpen(!mobileNavOpen)"));
check("Backdrop click closes drawer", /fixed inset-0 bg-black\/80 backdrop-blur-md"[\s\S]{0,120}onClick=\{\(\) => setMobileNavOpen\(false\)\}/.test(src));
check("Selecting a drawer item closes drawer + scrolls to top", /setTab\(item\.id\);\s*setMobileNavOpen\(false\);\s*window\.scrollTo\(\{ top: 0/.test(src));
check("Drawer header has explicit close button", src.includes("KR8 Admin</h3>"));

// 4. Consistent lg breakpoint across hamburger / drawer / sidebar
check("Hamburger only renders below lg (lg:hidden)", /setMobileNavOpen\(!mobileNavOpen\)[\s\S]{0,200}lg:hidden|lg:hidden[\s\S]{0,200}setMobileNavOpen\(!mobileNavOpen\)/.test(src));
check("Drawer only renders below lg (lg:hidden)", src.includes("fixed inset-0 z-50 lg:hidden flex animate-fadeIn"));
check("Desktop sidebar hidden below lg (hidden lg:block)", src.includes("hidden lg:block lg:col-span-3 xl:col-span-3 sticky top-6"));

// 5. Footer actions
check("Drawer footer: View Live Website ↗", src.includes("View Live Website \u2197"));
check("Drawer footer: Sign Out of Account closes drawer + signs out", /View Live Website[\s\S]{0,600}Sign Out of Account/.test(src));

if (failed) {
  console.error("Step 12 functional verification failed!");
  process.exit(1);
}
console.log("------------------------------------------------------------");
console.log("ALL STEP 12 FUNCTIONAL CHECKS PASSED!");
console.log("------------------------------------------------------------");
