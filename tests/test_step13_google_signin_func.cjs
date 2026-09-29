/**
 * STEP 13 Functional Regression: Google Sign-In security gates
 * - Extracts the REAL account-lookup callback from SignInPage.tsx AND SignInModal.tsx
 * - Executes it under Node with the real normalizeEmail from src/data/store
 * - Runs the full gate sequence: empty / not-enabled / mismatch / unknown / valid (+case/whitespace)
 * - Asserts Settings link/unlink record-shape contracts
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 13 (FUNCTIONAL): GOOGLE SIGN-IN SECURITY GATES");
console.log("------------------------------------------------------------");

const ROOT = path.resolve(__dirname, "..");
let failed = false;
const check = (label, cond) => {
  console.log((cond ? "\u2713 " : "\u2717 ") + label);
  if (!cond) failed = true;
};

const pageSrc = fs.readFileSync(path.join(ROOT, "src/pages/SignInPage.tsx"), "utf-8");
const modalSrc = fs.readFileSync(path.join(ROOT, "src/components/SignInModal.tsx"), "utf-8");
const settingsSrc = fs.readFileSync(path.join(ROOT, "src/pages/Settings.tsx"), "utf-8");

// 1. Extract the REAL deployed Google lookup callback from both surfaces
// (biometric sign-in also uses all.find — anchor on the Google flow's `const existing =`)
const CALLBACK_RE = /const existing = all\.find\(\s*\((a)\) =>[\s\S]*?\n {4}\)/;
const pageCbMatch = pageSrc.match(CALLBACK_RE);
const modalCbMatch = modalSrc.match(CALLBACK_RE);
check("SignInPage contains the real all.find lookup callback", !!pageCbMatch && pageCbMatch[0].includes("googleAuth?.enabled"));
check("SignInModal contains the real all.find lookup callback", !!modalCbMatch && modalCbMatch[0].includes("googleAuth?.enabled"));

// Consistency: both surfaces must deploy the SAME predicate semantics
// (normalize whitespace + the differing local variable names before comparing)
const norm = (s) => s.replace(/\s+/g, " ");
const sem = (s) => norm(s).replace(/emailClean|clean/g, "EMAILVAR");
check("SignInPage and SignInModal deploy identical lookup predicates",
  !!pageCbMatch && !!modalCbMatch && sem(pageCbMatch[0]) === sem(modalCbMatch[0]));

// 2. Execute the deployed predicate with the real normalizeEmail
let out = "";
const entry = path.join(os.tmpdir(), "kr8_step13_entry.ts");
const bundle = path.join(os.tmpdir(), "kr8_step13_bundle.cjs");

if (pageCbMatch) {
  const callback = pageCbMatch[0].replace(/const existing = all\.find\(\s*/, "").replace(/\n {4}\)$/, "");
  const now = Date.now();
  const accounts = [
    {
      id: "KR8-2026-001",
      name: "Alex Designer",
      email: "alex@example.com",
      googleAuth: { enabled: true, linkedEmail: "alex.google@gmail.com", linkedAt: now },
    },
    {
      id: "KR8-2026-002",
      name: "Sam Video",
      email: "sam@example.com",
      password: "Password123!",
    },
    {
      id: "KR8-2026-003",
      name: "Grace Web",
      email: "grace@example.com",
      googleAuth: { enabled: false, linkedEmail: "grace.left@gmail.com", linkedAt: now - 1000 },
    },
  ];

  const cases = [
    ["A_VALID_LINKED", "alex.google@gmail.com", "SIGN_IN:KR8-2026-001"],
    ["A2_CASE_WHITESPACE", "  Alex.Google@GMAIL.com  ", "SIGN_IN:KR8-2026-001"],
    ["B_DISABLED_ACCOUNT", "sam@example.com", "BLOCK_NOT_ENABLED"],
    ["C_UNREGISTERED", "stranger@gmail.com", "DENY_SIGNUP"],
    ["D_MISMATCH_PRIMARY_EMAIL", "sam@gmail.com-notlinked", "DENY_SIGNUP"],
    ["D2_PRIMARY_EMAIL_OF_LINKED_ACCOUNT", "alex@example.com", "DENY_MISMATCH"],
    ["E_DISABLED_LINKED_EMAIL_NOT_A_VALID_LINK", "grace.left@gmail.com", "DENY_SIGNUP"],
    ["E2_DISABLED_PRIMARY_EMAIL_BLOCKS", "grace@example.com", "BLOCK_NOT_ENABLED"],
  ];

  fs.writeFileSync(
    entry,
    'import { normalizeEmail } from "' + path.join(ROOT, "src/data/store") + '";\n' +
    "const all: any[] = " + JSON.stringify(accounts) + ";\n" +
    "const findUser = (emailClean: string) => all.find(" + callback + ");\n" +
    "const gate = (raw: string): string => {\n" +
    "  const emailClean = normalizeEmail(raw);\n" +
    '  if (!emailClean) return "BLOCK_EMPTY";\n' +
    "  const existing = findUser(emailClean);\n" +
    '  if (!existing) return "DENY_SIGNUP";\n' +
    "  if (!existing.googleAuth?.enabled) return \"BLOCK_NOT_ENABLED\";\n" +
    "  if (normalizeEmail(existing.googleAuth.linkedEmail) !== emailClean) return \"DENY_MISMATCH\";\n" +
    '  return "SIGN_IN:" + existing.id;\n' +
    "};\n" +
    "for (const [label, raw, expected] of " + JSON.stringify(cases) + " as [string, string, string][]) {\n" +
    "  const got = gate(raw);\n" +
    '  console.log(label + "=" + (got === expected ? "1" : "0:" + got));\n' +
    "}\n"
  );

  try {
    const esbuild = require("esbuild");
    esbuild.buildSync({ entryPoints: [entry], bundle: true, platform: "node", format: "cjs", outfile: bundle, logLevel: "error" });
    out = execFileSync(process.execPath, [bundle], { encoding: "utf-8" });
  } catch (err) {
    console.error("\u2717 Failed to bundle/execute Google gate logic under Node:", err.message);
    failed = true;
  }
}

if (out) {
  const kv = {};
  for (const line of out.split("\n")) {
    const i = line.indexOf("=");
    if (i > 0) kv[line.slice(0, i)] = line.slice(i + 1);
  }
  check("Case A: exact linked Google email + enabled -> signed in", kv.A_VALID_LINKED === "1");
  check("Case A2: case/whitespace-normalized linked email -> signed in", kv.A2_CASE_WHITESPACE === "1");
  check("Case B: account exists but Google Sign-In disabled -> blocked", kv.B_DISABLED_ACCOUNT === "1");
  check("Case C: unregistered Google email -> instant signup denied", kv.C_UNREGISTERED === "1");
  check("Case D: unknown google email -> signup denied (no account leak)", kv.D_MISMATCH_PRIMARY_EMAIL === "1");
  check("Case D2: primary email of a linked account via Google flow -> mismatch denied", kv.D2_PRIMARY_EMAIL_OF_LINKED_ACCOUNT === "1");
  check("Case E: disabled account's linked email is NOT treated as a valid link", kv.E_DISABLED_LINKED_EMAIL_NOT_A_VALID_LINK === "1");
  check("Case E2: disabled account reached via primary email -> blocked (opt-in enforced)", kv.E2_DISABLED_PRIMARY_EMAIL_BLOCKS === "1");
}

// 3. Settings link/unlink record-shape contracts (from real source)
check("Settings enable requires password re-authentication before linking",
  settingsSrc.includes("student.password && student.password !== googlePasswordConfirm"));
check("Settings link writes enabled:true + lowercased linkedEmail + linkedAt + verifiedToken",
  /googleAuth: \{[\s\S]{0,220}enabled: true,[\s\S]{0,120}linkedEmail: googleEmailInput\.trim\(\)\.toLowerCase\(\),[\s\S]{0,80}linkedAt: Date\.now\(\),[\s\S]{0,80}verifiedToken:/.test(settingsSrc));
check("Settings disable clears googleAuth entirely",
  /handleDisableGoogleAuth[\s\S]{0,400}googleAuth: undefined/.test(settingsSrc));
check("Settings disable asks for explicit confirmation",
  /handleDisableGoogleAuth[\s\S]{0,200}window\.confirm\(/.test(settingsSrc));
check("Settings validates Google email format before linking",
  settingsSrc.includes('!googleEmailInput.trim().includes("@")'));

if (failed) {
  console.error("Step 13 functional verification failed!");
  process.exit(1);
}
console.log("------------------------------------------------------------");
console.log("ALL STEP 13 FUNCTIONAL CHECKS PASSED!");
console.log("------------------------------------------------------------");
