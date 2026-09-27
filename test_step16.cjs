const fs = require("fs");
const path = require("path");

console.log("=== RUNNING STEP 16 — KR8 DIGITALS BRANDING VALIDATION ===");

// 1. Check branding files existence
const requiredFiles = [
  "public/branding/kr8_logo.png",
  "public/favicon.ico",
  "public/favicon.png",
  "public/favicon-32x32.png",
  "public/apple-touch-icon.png",
];

for (const f of requiredFiles) {
  if (!fs.existsSync(f)) {
    throw new Error(`Missing branding file: ${f}`);
  }
  const stat = fs.statSync(f);
  console.log(`✓ ${f} exists (${stat.size} bytes)`);
}

// 2. Check index.html favicon tags
const indexHtml = fs.readFileSync("index.html", "utf-8");
if (!indexHtml.includes("/favicon.ico") || !indexHtml.includes("/favicon.png") || !indexHtml.includes("/apple-touch-icon.png")) {
  throw new Error("index.html missing favicon or apple-touch-icon tags!");
}
console.log("✓ index.html properly configures all favicon assets!");

// 3. Check key brand touchpoints for logo integration
const brandTouchpoints = [
  "src/components/Navbar.tsx",
  "src/components/Footer.tsx",
  "src/pages/Admin.tsx",
  "src/pages/Verify.tsx",
  "src/pages/SignInPage.tsx",
  "src/components/SignInModal.tsx",
];

for (const tp of brandTouchpoints) {
  const content = fs.readFileSync(tp, "utf-8");
  if (!content.includes("/branding/kr8_logo.png")) {
    throw new Error(`${tp} does not reference /branding/kr8_logo.png!`);
  }
  console.log(`✓ ${tp} integrates official KR8 logo.`);
}

console.log("\n=======================================================");
console.log("=== STEP 16 KR8 DIGITALS BRANDING VERIFIED! ===");
console.log("=======================================================");
