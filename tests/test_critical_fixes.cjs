/**
 * CRITICAL FIX VERIFICATION (urgent production complaints):
 *
 * A. Co-founder identity corruption (Daniel's profile showing "Graphic Design"
 *    / Motionverse details on his own device):
 *    - self-heal repairs corrupted records back to canonical identity
 *    - registerStudent resolves the registering co-founder by THEIR phone/ID
 *    - recoverId / authenticateAccount return the correct person
 *
 * B. Registered students invisible to the Admin Dashboard & /verify:
 *    - end-to-end cross-device simulation with the REAL store + sync code:
 *      student registers on device 1 -> new account pushed to the cloud
 *      (exactly once, no real password) -> admin device hydrates -> student
 *      appears in the StudentManager roster -> findStudent + verifyId work
 *    - sync feedback loop convergence (no full-roster re-push storm)
 *
 * Run: node tests/test_critical_fixes.cjs
 */
const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

console.log("------------------------------------------------------------");
console.log("RUNNING CRITICAL FIX VERIFICATION (co-founder + student visibility)");
console.log("------------------------------------------------------------");

const ROOT = path.resolve(__dirname, "..");
let failed = false;
const check = (label, cond) => {
  console.log((cond ? "\u2713 " : "\u2717 ") + label);
  if (!cond) failed = true;
};

// ---------------- Environment: window + per-device localStorage ----------------
const windows = new EventTarget();
globalThis.window = windows;

function makeStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
    key: (i) => [...m.keys()][i] ?? null,
    get length() {
      return m.size;
    },
  };
}
function switchDevice(name) {
  globalThis.localStorage = makeStorage();
  console.log(`   [device: ${name}]`);
}

// ---------------- Bundle the REAL store + sync layer (Supabase stubbed) ----------------
const STUB = path.join(__dirname, "stubs", "supabaseStub.ts");
const OUT = path.join(__dirname, ".e2e_bundle.cjs");
const ENTRY = path.join(__dirname, "e2e_entry_with_cloud.ts");
fs.writeFileSync(
  ENTRY,
  `export * from "./e2e_entry";\nexport { __cloud } from "./stubs/supabaseStub";\n`
);
const stubPlugin = {
  name: "supabase-stub",
  setup(build) {
    build.onResolve({ filter: /(^|\/)supabase$/ }, (args) => {
      if (args.importer.includes("supabaseSync")) return { path: STUB };
      return undefined;
    });
  },
};
(async () => {
  await esbuild.build({
  entryPoints: [ENTRY],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: OUT,
  plugins: [stubPlugin],
  logLevel: "silent",
  });

  const api = require(OUT);
const { __cloud } = api;

// Capture kr8:accounts-updated event details (what the push layer sees)
let lastDetail = null;
windows.addEventListener("kr8:accounts-updated", (e) => {
  lastDetail = e.detail || null;
  if (process.env.KR8_DBG_EVENTS) {
    const stack = (new Error().stack || "").split("\n").slice(2, 7).join(" | ");
    console.log("[EVENT] n=" + (e.detail?.changedIds?.length || 0) + " added=" + (e.detail?.addedIds?.length || 0) + "\n    " + stack);
  }
});

switchDevice("init");
api.initSupabaseSync();

// =====================================================================
// PART A: Co-founder identity integrity
// =====================================================================
console.log("\n== PART A: co-founder identity (Daniel / Stevenson) ==");

// Simulate the historical corruption exactly as the old first-match merge
// produced it on Daniel's device: Stevenson's record carries Daniel's
// phone + email, and Daniel's canonical record is absent.
switchDevice("daniel-device");
let accts = api.getAccounts(); // seeds roster incl. both co-founders
let stevensonRec = accts.find((a) => a.id === "KR8-COFOUNDER-STEVENSON");
let danielRec = accts.find((a) => a.id === "KR8-COFOUNDER-DANIEL");
check("precondition: both canonical co-founder records seeded", !!stevensonRec && !!danielRec);

// Daniel's canonical record vanished from all storage keys (the old seeding
// saw his phone on the merged record), and Stevenson's record carries
// Daniel's phone + email + password. Corrupt storage directly (raw JSON) —
// any getAccounts() call from here on already triggers the new self-heal and
// would mask the corruption before the assertion point.
for (const key of ["kr8_accounts_v3", "kr8_accounts_backup", "kr8_registered_students_vault"]) {
  const raw = globalThis.localStorage.getItem(key);
  if (!raw) continue;
  const list = JSON.parse(raw);
  const s = list.find((a) => a.id === "KR8-COFOUNDER-STEVENSON");
  if (s) {
    s.phone = "+2348106068523";
    s.email = "daniel@kr8digitals.com";
    s.password = "DanielPass123";
  }
  globalThis.localStorage.setItem(key, JSON.stringify(list.filter((a) => a.id !== "KR8-COFOUNDER-DANIEL")));
}

// Now the self-heal must repair on next read
accts = api.getAccounts();
const byPhone = (ph) => accts.filter((a) => a.phone && api.normalizePhone(a.phone) === ph);
const danielAfter = byPhone("+2348106068523");
const stevensonAfter = byPhone("+2348089344434");
check("exactly one record owns Daniel's phone after heal", danielAfter.length === 1);
check("exactly one record owns Stevenson's phone after heal", stevensonAfter.length === 1);
const d = danielAfter[0] || {};
const s = stevensonAfter[0] || {};
check("Daniel's record repaired to canonical ID (KR8-COFOUNDER-DANIEL)", d.id === "KR8-COFOUNDER-DANIEL");
check("Daniel's record repaired to canonical name (no Motionverse)", d.name === "Daniel (Creative Expression)");
check("Daniel's skill repaired to video (not graphic)", d.skill === "video");
check("Daniel's title repaired to Co-Founder \u00b7 COO", d.title === "Co-Founder \u00b7 COO");
check(
  "Stevenson's record intact (Stevenson (Motionverse), graphic)",
  s.id === "KR8-COFOUNDER-STEVENSON" && s.name === "Stevenson (Motionverse)" && s.skill === "graphic"
);
check("repaired record keeps old ID resolvable via previousIds", (d.previousIds || []).includes("KR8-COFOUNDER-STEVENSON"));
check("repaired record keeps Daniel's personal email/password", d.email === "daniel@kr8digitals.com" && d.password === "DanielPass123");

// Sign-in must land on the RIGHT person
const signinByPhone = api.authenticateAccount("+2348106068523", "DanielPass123");
check("sign-in with Daniel's phone authenticates as Daniel", signinByPhone.ok && signinByPhone.account.id === "KR8-COFOUNDER-DANIEL");
const signinByEmail = api.authenticateAccount("daniel@kr8digitals.com", "DanielPass123");
check("sign-in with Daniel's email authenticates as Daniel", signinByEmail.ok && signinByEmail.account.id === "KR8-COFOUNDER-DANIEL");
const stevSignin = api.authenticateAccount("+2348089344434", api.MAIN_ADMIN_PASSWORD);
check("Stevenson's phone still authenticates as Stevenson", stevSignin.ok && stevSignin.account.id === "KR8-COFOUNDER-STEVENSON");

check("recoverId(Daniel phone) -> Daniel", api.recoverId("+2348106068523")?.id === "KR8-COFOUNDER-DANIEL");
check("recoverId(Stevenson phone) -> Stevenson", api.recoverId("+2348089344434")?.id === "KR8-COFOUNDER-STEVENSON");

// Fresh-device registration: each co-founder lands in their OWN record
switchDevice("daniel-registers");
const regDaniel = api.registerStudent({
  name: "",
  email: "daniel@kr8digitals.com",
  phone: "+2348106068523",
  country: "NG",
  skill: "video",
  dob: "2000-01-01",
  password: "DanielPass123",
});
check("registering as Daniel yields Daniel's record", regDaniel.ok && regDaniel.student.id === "KR8-COFOUNDER-DANIEL");
check("Daniel registration keeps video skill (not graphic)", regDaniel.student.skill === "video");
check("Daniel registration name is Daniel (not Stevenson)", (regDaniel.student.name || "").startsWith("Daniel"));

switchDevice("stevenson-registers");
const regStev = api.registerStudent({
  name: "",
  email: "stevenson@kr8digitals.com",
  phone: "+2348089344434",
  country: "NG",
  skill: "graphic",
  dob: "2000-01-01",
  password: "StevensonPass123",
});
check("registering as Stevenson yields Stevenson's record", regStev.ok && regStev.student.id === "KR8-COFOUNDER-STEVENSON");
check("Stevenson registration keeps graphic skill", regStev.student.skill === "graphic");

// =====================================================================
// PART B: Cross-device student visibility (the admin dashboard complaint)
// =====================================================================
console.log("\n== PART B: student registration -> admin dashboard -> /verify ==");
__cloud.reset();
__cloud.clearUpserts();
lastDetail = null;

// --- Student device (brand new) ---
switchDevice("student-device");
const reg = api.registerStudent({
  name: "Adaeze Okonkwo",
  email: "adaeze.test@gmail.com",
  phone: "+2347000000001",
  country: "NG",
  skill: "graphic",
  dob: "2003-05-14",
  password: "TestPass123",
});
check("student registration succeeds", reg.ok && !!reg.student?.id);
const newId = reg.student?.id || "";
check("student gets an official KR8 ID", /^KR8/.test(newId));
check("new student present in local roster (their dashboard works)", api.getStudents().some((a) => a.id === newId));

const pushes = () => __cloud.getUpserts().filter((u) => u.table === "accounts");
check("new student pushed to the cloud exactly once", pushes().filter((u) => u.payload.id === newId).length === 1);
check("NO real password ever sent to the cloud (all payloads use placeholder)",
  pushes().every((u) => u.payload.password === "kr8-account"));
check("cloud row exists for the new student", !!__cloud.getAccounts().find((r) => r.id === newId));

// --- Admin device (fresh, stale local roster) ---
switchDevice("admin-device");
api.getAccounts(); // cold seed: cohort students + executives, NO Adaeze
check("admin local roster is stale before sync (Adaeze missing)", !api.findStudent(newId));
check("admin verifyId fails before sync (the reported complaint)", api.verifyId(newId).ok === false);

__cloud.clearUpserts();
lastDetail = null;
api.hydrateAccountsFromSupabase();
setTimeout(runPostHydrate, 60);

function runPostHydrate() {
  check("admin roster NOW contains the registered student", api.getStudents().some((a) => a.id === newId));
  const found = api.findStudent(newId);
  check("findStudent resolves the ID on the admin device", !!found && found.name === "Adaeze Okonkwo");
  check("verifyId works for the new student on the admin device", api.verifyId(newId).ok === true);
  check(
    "hydrate re-broadcast carries ONLY the new account (no full-roster storm)",
    lastDetail?.changedIds?.length === 1 && lastDetail.changedIds[0] === newId
  );
  const pushesAfterHydrate = pushes();
  check(
    "push after hydration re-sends ONLY the changed account (loop converges)",
    pushesAfterHydrate.length === 1 && pushesAfterHydrate[0].payload.id === newId
  );

  // Second hydration with unchanged cloud: must be a no-op (no save, no push)
  lastDetail = null;
  __cloud.clearUpserts();
  api.hydrateAccountsFromSupabase();
  setTimeout(runConvergence, 60);

  function runConvergence() {
    check(
      "second hydrate is a no-op when data unchanged (loop breaks)",
      lastDetail === null || lastDetail.changedIds.length === 0
    );
    check("second hydrate triggers zero cloud pushes", pushes().length === 0);

    // --- No-op local save must push nothing ---
    __cloud.clearUpserts();
    lastDetail = null;
    api.saveAccounts(api.getAccounts());
    check(
      "no-op save broadcasts an empty change set (nothing pushed)",
      (lastDetail?.changedIds?.length || 0) === 0 && pushes().length === 0
    );

    finish();
  }
}

  function finish() {
  if (failed) {
    console.error("\nCRITICAL FIX VERIFICATION FAILED!");
    process.exit(1);
  }
  console.log("------------------------------------------------------------");
  console.log("ALL CRITICAL FIX CHECKS PASSED!");
  console.log("------------------------------------------------------------");
}
})().catch((err) => { console.error(err); process.exit(1); });
