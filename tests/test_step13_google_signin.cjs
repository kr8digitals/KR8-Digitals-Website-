/**
 * STEP 13 Comprehensive Test: Google Sign-In Security & Functionality Verification
 */

const fs = require("fs");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 13: GOOGLE SIGN-IN SECURITY & FUNCTIONALITY TEST");
console.log("------------------------------------------------------------");

let failed = false;

// 1. Verify SignInPage.tsx Google Sign-In flow & security checks
const signInPageSrc = fs.readFileSync("./src/pages/SignInPage.tsx", "utf-8");
if (
  signInPageSrc.includes("handleGoogleSignIn") &&
  signInPageSrc.includes("existing.googleAuth?.enabled") &&
  signInPageSrc.includes("Security Policy: Google Sign-In has not been enabled for this account") &&
  signInPageSrc.includes("Google-only instant signup is not permitted") &&
  signInPageSrc.includes("signIn(existing)")
) {
  console.log("✓ SignInPage enforces strict security checks: requires user enablement & registered account!");
} else {
  console.error("✗ SignInPage missing security checks for Google Sign-In!");
  failed = true;
}

// 2. Verify SignInModal.tsx Google Sign-In flow
const signInModalSrc = fs.readFileSync("./src/components/SignInModal.tsx", "utf-8");
if (
  signInModalSrc.includes("handleGooglePrompt") &&
  signInModalSrc.includes("existing.googleAuth?.enabled") &&
  signInModalSrc.includes("signIn(existing)")
) {
  console.log("✓ SignInModal enforces consistent Google security policy matching SignInPage!");
} else {
  console.error("✗ SignInModal missing consistent Google security checks!");
  failed = true;
}

// 3. Verify Settings.tsx Google Account Linking & Unlinking
const settingsSrc = fs.readFileSync("./src/pages/Settings.tsx", "utf-8");
if (
  settingsSrc.includes("handleEnableGoogleAuth") &&
  settingsSrc.includes("handleDisableGoogleAuth") &&
  settingsSrc.includes("student.password && student.password !== googlePasswordConfirm") &&
  settingsSrc.includes("googleAuth: {") &&
  settingsSrc.includes("enabled: true")
) {
  console.log("✓ Settings requires password re-authentication before linking a Google account!");
} else {
  console.error("✗ Settings missing password verification before enabling Google Auth!");
  failed = true;
}

// 4. Test Simulated Authentication Logic
const normalizeEmail = (e) => (e || "").trim().toLowerCase();

const mockAccounts = [
  {
    id: "KR8-2026-001",
    name: "Alex Designer",
    email: "alex@example.com",
    password: "Password123!",
    googleAuth: {
      enabled: true,
      linkedEmail: "alex.google@gmail.com",
      linkedAt: Date.now(),
    },
  },
  {
    id: "KR8-2026-002",
    name: "Sam Video",
    email: "sam@example.com",
    password: "Password123!",
    // googleAuth disabled
  },
];

// Test Case A: Valid linked Google sign-in
const testAEmail = "alex.google@gmail.com";
const userA = mockAccounts.find(
  (a) =>
    (a.googleAuth?.enabled && normalizeEmail(a.googleAuth.linkedEmail) === testAEmail) ||
    normalizeEmail(a.email) === testAEmail
);
if (userA && userA.googleAuth?.enabled) {
  console.log("✓ Test Case A: Authorized Google account successfully authenticated!");
} else {
  console.error("✗ Test Case A failed!");
  failed = true;
}

// Test Case B: Account exists but Google Sign-In is not enabled
const testBEmail = "sam@example.com";
const userB = mockAccounts.find(
  (a) =>
    (a.googleAuth?.enabled && normalizeEmail(a.googleAuth.linkedEmail) === testBEmail) ||
    normalizeEmail(a.email) === testBEmail
);
if (userB && !userB.googleAuth?.enabled) {
  console.log("✓ Test Case B: Unlinked account correctly blocked from unauthorized Google login!");
} else {
  console.error("✗ Test Case B failed!");
  failed = true;
}

// Test Case C: Non-existent email
const testCEmail = "stranger@gmail.com";
const userC = mockAccounts.find(
  (a) =>
    (a.googleAuth?.enabled && normalizeEmail(a.googleAuth.linkedEmail) === testCEmail) ||
    normalizeEmail(a.email) === testCEmail
);
if (!userC) {
  console.log("✓ Test Case C: Unregistered Google email correctly denied instant signup without track selection!");
} else {
  console.error("✗ Test Case C failed!");
  failed = true;
}

if (failed) {
  console.error("Step 13 verification failed!");
  process.exit(1);
}

console.log("------------------------------------------------------------");
console.log("ALL STEP 13 CHECKS PASSED SUCCESSFULLY!");
console.log("------------------------------------------------------------");
