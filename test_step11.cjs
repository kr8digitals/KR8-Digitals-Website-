console.log("=== RUNNING STEP 11 — GOOGLE SIGN-IN SECURITY VALIDATION ===");

// Mock account
const mockAccount = {
  id: "KR82026ST0042GRA",
  name: "Samuel Johnson",
  email: "samuel.kr8@example.com",
  password: "SecurePassword123!",
  skill: "graphic",
  type: "student",
  googleAuth: undefined,
};

function attemptGoogleSignIn(account, inputGoogleEmail) {
  const emailClean = inputGoogleEmail.trim().toLowerCase();
  
  if (!account) {
    return { success: false, reason: "No account registered with this email" };
  }

  // SECURITY CHECK: Must be explicitly enabled by user
  if (!account.googleAuth || !account.googleAuth.enabled) {
    return {
      success: false,
      reason: "Security Policy: Google Sign-In has not been enabled for this account. Sign in with password first.",
    };
  }

  if (account.googleAuth.linkedEmail.toLowerCase() !== emailClean) {
    return {
      success: false,
      reason: "Access Denied: The Google account does not match the linked address on record.",
    };
  }

  return { success: true, account };
}

function enableGoogleAuth(account, googleEmail, passwordConfirm) {
  if (account.password && account.password !== passwordConfirm) {
    return { success: false, error: "Incorrect password" };
  }
  account.googleAuth = {
    enabled: true,
    linkedEmail: googleEmail.trim().toLowerCase(),
    linkedAt: Date.now(),
    verifiedToken: "kr8_gauth_test123",
  };
  return { success: true, account };
}

function disableGoogleAuth(account) {
  account.googleAuth = undefined;
  return { success: true, account };
}

// TEST 1: Attempt Google login before enablement
console.log("\n--- [TEST 1] Google login without explicit user enablement ---");
const test1 = attemptGoogleSignIn(mockAccount, "samuel.kr8@example.com");
console.log("Result:", test1.reason);
if (test1.success || !test1.reason.includes("Security Policy")) {
  throw new Error("Security breach! Unauthorized Google sign-in was permitted.");
}
console.log("✓ Successfully blocked unauthorized Google login attempt!");

// TEST 2: Attempt enabling with wrong password
console.log("\n--- [TEST 2] Enablement with incorrect password ---");
const test2 = enableGoogleAuth(mockAccount, "samuel.google@gmail.com", "WrongPass!");
if (test2.success) {
  throw new Error("Allowed Google enablement without valid password verification!");
}
console.log("✓ Correctly rejected enablement with wrong password:", test2.error);

// TEST 3: Enable Google Sign-In with verified password
console.log("\n--- [TEST 3] Enablement with valid password ---");
const test3 = enableGoogleAuth(mockAccount, "samuel.google@gmail.com", "SecurePassword123!");
if (!test3.success || !mockAccount.googleAuth?.enabled) {
  throw new Error("Failed to enable Google authentication!");
}
console.log("✓ Google Auth successfully enabled and bound to:", mockAccount.googleAuth.linkedEmail);

// TEST 4: Sign in with linked Google Account
console.log("\n--- [TEST 4] Sign in with authorized Google Account ---");
const test4 = attemptGoogleSignIn(mockAccount, "samuel.google@gmail.com");
if (!test4.success) {
  throw new Error("Failed to sign in with authorized Google account: " + test4.reason);
}
console.log("✓ Successfully authenticated via verified Google account:", test4.account.name);

// TEST 5: Sign in with unlinked Google Account
console.log("\n--- [TEST 5] Sign in with mismatched Google Account ---");
const test5 = attemptGoogleSignIn(mockAccount, "attacker.google@gmail.com");
if (test5.success) {
  throw new Error("Allowed sign in with mismatched Google account!");
}
console.log("✓ Correctly rejected unlinked Google account:", test5.reason);

// TEST 6: Disable Google Sign-In
console.log("\n--- [TEST 6] Disable Google Sign-In & verify subsequent rejection ---");
disableGoogleAuth(mockAccount);
const test6 = attemptGoogleSignIn(mockAccount, "samuel.google@gmail.com");
if (test6.success) {
  throw new Error("Google login succeeded after being disabled!");
}
console.log("✓ Successfully revoked Google login after disablement:", test6.reason);

console.log("\n=======================================================");
console.log("=== STEP 11 GOOGLE SIGN-IN SECURITY VERIFIED! ===");
console.log("=======================================================");
