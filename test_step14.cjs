console.log("=== RUNNING STEP 14 — STUDENT ID COPY VALIDATION ===");

let clipboardContent = "";
const mockClipboard = {
  writeText: async (text) => {
    clipboardContent = text;
    return Promise.resolve();
  },
};

function copyStudentId(studentId, onCopied, notify) {
  mockClipboard.writeText(studentId).then(() => {
    onCopied(true);
    notify(`KR8 ID copied to clipboard: ${studentId}`);
    setTimeout(() => {
      onCopied(false);
    }, 1800);
  });
}

// TEST 1: Student ID copy execution
console.log("\n--- [TEST 1] Copy Action & Clipboard Content ---");
const testId = "KR82026ST0042GRA";
let visualFeedbackState = false;
let notificationSent = "";

copyStudentId(
  testId,
  (state) => { visualFeedbackState = state; },
  (msg) => { notificationSent = msg; }
);

// Immediately check
setTimeout(() => {
  console.log("Clipboard content:", clipboardContent);
  console.log("Visual feedback active:", visualFeedbackState);
  console.log("Notification message:", notificationSent);

  if (clipboardContent !== testId) {
    throw new Error("Clipboard does not match student ID!");
  }
  if (!visualFeedbackState) {
    throw new Error("Visual feedback was not triggered!");
  }
  if (!notificationSent.includes(testId)) {
    throw new Error("Notification was not triggered with student ID!");
  }
  console.log("✓ Clipboard receives exact student ID and feedback displays immediately!");

  // TEST 2: Timeout auto-reset (simulated at 1900ms)
  setTimeout(() => {
    console.log("\n--- [TEST 2] Feedback Auto-Dismiss ---");
    console.log("Visual feedback state after 1.9s:", visualFeedbackState);
    if (visualFeedbackState !== false) {
      throw new Error("Visual feedback did not auto-dismiss after delay!");
    }
    console.log("✓ Visual feedback cleanly auto-dismisses after ~1.8s!");

    console.log("\n=======================================================");
    console.log("=== STEP 14 STUDENT ID COPY VERIFIED! ===");
    console.log("=======================================================");
  }, 1900);
}, 50);
