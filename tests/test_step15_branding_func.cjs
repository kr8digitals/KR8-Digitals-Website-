/**
 * STEP 15 Functional Regression: Logo Integration & Branding Consistency Audit
 * - Logo asset integrity (valid PNG, high-res, adequate size)
 * - Every branding surface uses the official logo path with accessible alt text
 * - Hero/portal containers use the luminous gradient pattern
 * - Favicon chain integrity (ico + 32 + 64 + apple-touch) wired in index.html
 */
const fs = require("fs");
const path = require("path");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 15 (FUNCTIONAL): LOGO & BRANDING CONSISTENCY AUDIT");
console.log("------------------------------------------------------------");

const ROOT = path.resolve(__dirname, "..");
let failed = false;
const check = (label, cond) => {
  console.log((cond ? "\u2713 " : "\u2717 ") + label);
  if (!cond) failed = true;
};

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf-8");

// 1. Logo asset integrity
const logoPath = path.join(ROOT, "public/branding/kr8_logo.png");
const logoBuf = fs.readFileSync(logoPath);
const isPng =
  logoBuf.length > 8 &&
  logoBuf[0] === 0x89 && logoBuf[1] === 0x50 && logoBuf[2] === 0x4e && logoBuf[3] === 0x47;
// PNG IHDR width/height are big-endian uint32 at bytes 16-23
const w = logoBuf.readUInt32BE(16);
const h = logoBuf.readUInt32BE(20);
check("Logo is a valid PNG file", isPng);
check("Logo is high-resolution (>= 512px on the long edge): " + w + "x" + h, Math.max(w, h) >= 512);
check("Logo is a full-color RGBA asset (not a stub)", logoBuf.length > 100000);

// 2. Branding surface coverage — every key surface uses the official logo
const surfaces = {
  "Navbar (desktop)": read("src/components/Navbar.tsx"),
  "Footer": read("src/components/Footer.tsx"),
  "Admin header": read("src/pages/Admin.tsx"),
  "SignIn page (hero)": read("src/pages/SignInPage.tsx"),
  "Verify portal (hero)": read("src/pages/Verify.tsx"),
  "SignIn modal": read("src/components/SignInModal.tsx"),
};
for (const [label, src] of Object.entries(surfaces)) {
  check(label + " references the official /branding/kr8_logo.png", src.includes("/branding/kr8_logo.png"));
  // Capture each <img> whose src attribute IS the logo path (excludes content images
  // that merely use the logo as a fallback expression, e.g. src={photo || "/branding/kr8_logo.png"})
  const logoImgs = (src.match(/<img\b[^>]*\bsrc="\/branding\/kr8_logo\.png"[^>]*\/?>/g) || []);
  check(label + " logo <img> carries accessible alt text (KR8)",
    logoImgs.length > 0 && logoImgs.every((t) => /alt="[^"]*KR8[^"]*"/.test(t)));
}

// 3. No placeholder or broken logo references anywhere
const srcFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(e.name)) srcFiles.push(p);
  }
})(path.join(ROOT, "src"));
const allSrc = srcFiles.map((f) => fs.readFileSync(f, "utf-8")).join("\n");
check("No placeholder logo paths (loremipsum/placeholder/example) in source",
  !/lorem\s*ipsum|placeholder\.com|viaplaceholder|example\.com\/logo/i.test(allSrc));

// 4. Luminous gradient container pattern on hero/portal branding
const signIn = surfaces["SignIn page (hero)"];
const verify = surfaces["Verify portal (hero)"];
const heroPattern = /bg-gradient-to-br from-pink-500\/(25|20)[\s\S]{0,120}border-pink-500\/4?0[\s\S]{0,120}kr8_logo\.png/;
check("SignIn hero uses the luminous gradient logo container", heroPattern.test(signIn));
check("Verify hero uses the luminous gradient logo container", heroPattern.test(verify));
const nav = surfaces["Navbar (desktop)"];
check("Navbar logo container is gradient + bordered with drop-shadow",
  nav.includes("drop-shadow") && /bg-gradient-to-br from-pink-500\/20[\s\S]{0,300}kr8_logo\.png/.test(nav));

// 5. Wordmark typography consistency
check("Navbar wordmark: KR8 (gradient, font-black) + Digitals (white bold)",
  /text-gradient font-black text-2xl">KR8</.test(nav) && /text-white font-bold text-2xl[^>]*">Digitals</.test(nav));
check("Footer wordmark is the larger 3xl scale",
  /text-gradient font-black text-3xl">KR8</.test(surfaces["Footer"]) && /text-white font-bold text-3xl[^>]*">Digitals</.test(surfaces["Footer"]));

// 6. Favicon chain integrity
const favs = {
  "public/favicon.ico": 5000,
  "public/favicon-32x32.png": 500,
  "public/favicon.png": 1000,
  "public/apple-touch-icon.png": 5000,
};
const indexHtml = read("index.html");
for (const [file, minBytes] of Object.entries(favs)) {
  const p = path.join(ROOT, file);
  const ok = fs.existsSync(p) && fs.statSync(p).size >= minBytes;
  check(file + " exists with adequate size", ok);
  const rel = "/" + file.slice("public/".length);
  check("index.html wires " + rel, indexHtml.includes(rel));
}

if (failed) {
  console.error("Step 15 functional verification failed!");
  process.exit(1);
}
console.log("------------------------------------------------------------");
console.log("ALL STEP 15 FUNCTIONAL CHECKS PASSED!");
console.log("------------------------------------------------------------");
