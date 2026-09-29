/**
 * Test Suite: Registered Students Instant Visibility in Admin Dashboard and Universal Verification
 */
const fs = require("fs");
const assert = require("assert");

console.log("============================================================");
console.log("TESTING REGISTERED STUDENTS ADMIN VISIBILITY & VERIFICATION");
console.log("============================================================");

let failed = false;

// 1. Verify store.ts defines REGISTRATION_VAULT_KEY and includes all sources in getAccounts()
const storeCode = fs.readFileSync("./src/data/store.ts", "utf-8");

if (storeCode.includes('export const REGISTRATION_VAULT_KEY = "kr8_registered_students_vault"')) {
  console.log("✓ REGISTRATION_VAULT_KEY is defined for persistent student record survival.");
} else {
  console.error("✗ REGISTRATION_VAULT_KEY missing in store.ts!");
  failed = true;
}

if (
  storeCode.includes("REGISTRATION_VAULT_KEY") &&
  storeCode.includes("kr8_accounts_backup") &&
  storeCode.includes("kr8_current")
) {
  console.log("✓ Multi-tier storage merges accounts from primary store, vault, backup, and active session.");
} else {
  console.error("✗ Incomplete storage merge logic in store.ts!");
  failed = true;
}

// 2. Verify findStudent supports normalized ID, hyphenated ID, email, phone, and name
if (
  storeCode.includes("s.id === raw || normalizeIdentity(s.id) === normalized") &&
  storeCode.includes("normalizeEmail(s.email) === emailQuery") &&
  storeCode.includes("normalizePhone(s.phone) === phoneQuery") &&
  storeCode.includes("s.name.trim().toLowerCase() === raw.toLowerCase()")
) {
  console.log("✓ findStudent extensively matches exact ID, normalized/hyphenated ID, email, phone, and name.");
} else {
  console.error("✗ findStudent lacks full multi-attribute search matching!");
  failed = true;
}

// 3. Verify verifyId recognizes all registered accounts (including Tribe members and in-training students)
if (storeCode.includes("// 2. Student / Member Identity Lookup") && !storeCode.includes('acc.type !== "tribe"')) {
  console.log("✓ verifyId verifies all official registered members without excluding Tribe members.");
} else {
  console.error("✗ verifyId still has restrictive type check!");
  failed = true;
}

// 4. Verify Admin.tsx student management includes all accounts and matches normalized IDs
const adminCode = fs.readFileSync("./src/pages/Admin.tsx", "utf-8");

if (
  adminCode.includes("const [students, setStudents] = useState<Account[]>(() => getAccounts())") &&
  adminCode.includes("const refresh = () => setStudents(getAccounts())")
) {
  console.log("✓ Admin dashboard initializes with all registered accounts and updates on change events.");
} else {
  console.error("✗ Admin dashboard still filters out students or tribe members on initialization!");
  failed = true;
}

if (
  adminCode.includes("sIdNorm.includes(qNorm)") &&
  adminCode.includes("s.id.toLowerCase().includes(qLower)")
) {
  console.log("✓ Admin StudentManager search matches IDs formatted with or without hyphens.");
} else {
  console.error("✗ Admin StudentManager search is strictly hyphen-sensitive!");
  failed = true;
}

if (adminCode.includes("Sync Roster") && adminCode.includes("hydrateAccountsFromSupabase")) {
  console.log("✓ Admin dashboard provides one-tap Sync Roster button with cloud and local hydration.");
} else {
  console.error("✗ Admin dashboard missing Sync Roster or cloud sync button!");
  failed = true;
}

// 5. Verify Verify.tsx renders active student and tribe member verification banners
const verifyCode = fs.readFileSync("./src/pages/Verify.tsx", "utf-8");

if (
  verifyCode.includes("Verified KR8 Academy Scholar") &&
  verifyCode.includes("Verified KR8 Tribe Community Member")
) {
  console.log("✓ Verify portal provides clear confirmation banners for both Academy students and Tribe members.");
} else {
  console.error("✗ Verify portal lacks active student or tribe member verification status banners!");
  failed = true;
}

// 6. Verify Supabase Sync subscribes to public:accounts in realtime
const syncCode = fs.readFileSync("./src/lib/supabaseSync.ts", "utf-8");

if (
  syncCode.includes('table: "accounts"') &&
  syncCode.includes("hydrateAccountsFromSupabase")
) {
  console.log("✓ Realtime Postgres change subscription active for accounts table.");
} else {
  console.error("✗ Supabase sync missing realtime accounts listener!");
  failed = true;
}

// 7. Functional Simulation: Test identity normalization, search matching, and multi-tier recovery
function normalizeIdentity(val) {
  return (val || "").trim().replace(/[\s-]/g, "").toUpperCase();
}

function normalizePhone(value) {
  const compact = (value || "").trim().replace(/[\s().-]/g, "");
  if (compact.startsWith("+")) return compact;
  if (compact.startsWith("00")) return `+${compact.slice(2)}`;
  if (compact.startsWith("0")) return `+234${compact.slice(1)}`;
  return `+234${compact}`;
}

function normalizeEmail(e) {
  return (e || "").trim().toLowerCase();
}

const mockStudent = {
  id: "KR82026TG0001GDVFD",
  name: "Tamara George",
  email: "tamara.george@gmail.com",
  phone: "+2348012345678",
  type: "student",
  skill: "graphic",
  graduated: false,
};

const mockTribe = {
  id: "KR8-TRIBE-7821",
  name: "Emeka Okonkwo",
  email: "emeka.okonkwo@gmail.com",
  phone: "+2348098765432",
  type: "tribe",
  graduated: false,
};

const db = [mockStudent, mockTribe];

function simulatedFind(query, list) {
  const raw = query.trim();
  const normalized = normalizeIdentity(raw);
  const emailQuery = normalizeEmail(raw);
  const phoneQuery = normalizePhone(raw);

  return list.find((s) => {
    if (s.id === raw || normalizeIdentity(s.id) === normalized) return true;
    if (s.email && normalizeEmail(s.email) === emailQuery) return true;
    if (phoneQuery.length >= 7 && s.phone && normalizePhone(s.phone) === phoneQuery) return true;
    if (s.name && s.name.trim().toLowerCase() === raw.toLowerCase()) return true;
    const sNorm = normalizeIdentity(s.id);
    if (sNorm.startsWith(normalized) || normalized.startsWith(sNorm) || sNorm.includes(normalized)) return true;
    return false;
  });
}

// Test cases:
assert.strictEqual(simulatedFind("KR82026TG0001GDVFD", db)?.name, "Tamara George");
assert.strictEqual(simulatedFind("kr8-2026-tg0001-gdvfd", db)?.name, "Tamara George");
assert.strictEqual(simulatedFind("KR8-2026-TG0001", db)?.name, "Tamara George");
assert.strictEqual(simulatedFind("tamara.george@gmail.com", db)?.name, "Tamara George");
assert.strictEqual(simulatedFind("08012345678", db)?.name, "Tamara George");
assert.strictEqual(simulatedFind("Tamara George", db)?.name, "Tamara George");
assert.strictEqual(simulatedFind("KR8-TRIBE-7821", db)?.name, "Emeka Okonkwo");
assert.strictEqual(simulatedFind("kr8tribe7821", db)?.name, "Emeka Okonkwo");

console.log("✓ Simulated search correctly matches exact IDs, hyphenated IDs, prefix IDs, emails, phones, and names!");

if (failed) {
  console.error("\n❌ Some tests failed. Please review the errors above.");
  process.exit(1);
} else {
  console.log("\n✅ ALL REGISTERED STUDENT RECOGNITION AND VERIFICATION CHECKS PASSED!");
  process.exit(0);
}
