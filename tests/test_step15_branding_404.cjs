/**
 * STEP 15 Functional Regression: Branded 404 Experience
 * - NotFound page exists, uses the official logo with accessible alt, branded CTAs
 * - CTA/quick-link targets are all real routes in App.tsx (no broken links)
 * - Catch-all route "*" is wired inside Layout (Navbar/Footer brand surface persists)
 * - ALL pre-existing routes remain intact (route regression)
 */
const fs = require("fs");
const path = require("path");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 15 (FUNCTIONAL): BRANDED 404 EXPERIENCE");
console.log("------------------------------------------------------------");

const ROOT = path.resolve(__dirname, "..");
let failed = false;
const check = (label, cond) => {
  console.log((cond ? "\u2713 " : "\u2717 ") + label);
  if (!cond) failed = true;
};

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf-8");
const notFound = read("src/pages/NotFound.tsx");
const app = read("src/App.tsx");

// 1. Branded 404 page composition
check("NotFound page exists at src/pages/NotFound.tsx", notFound.length > 0);
const logoImgs = notFound.match(/<img\b[^>]*\bsrc="\/branding\/kr8_logo\.png"[^>]*\/?>/g) || [];
check("Uses the official /branding/kr8_logo.png with KR8 alt text",
  logoImgs.length >= 1 && logoImgs.every((t) => /alt="[^"]*KR8[^"]*"/.test(t)));
check("Luminous gradient logo container (pink/purple pattern)",
  /bg-gradient-to-br from-pink-500\/25[\s\S]{0,120}border-pink-500\/40[\s\S]{0,120}kr8_logo\.png/.test(notFound));
const displayIdx = notFound.indexOf("text-gradient font-display mt-4");
const displayWindow = displayIdx >= 0 ? notFound.slice(displayIdx, displayIdx + 300) : "";
check("Renders a gradient 404 display + semantic h1",
  displayIdx >= 0 && /\b404\b/.test(displayWindow) && notFound.includes("<h1"));
check("Sets a branded document title (Page Not Found | KR8 Digitals)",
  notFound.includes('title: "Page Not Found | KR8 Digitals"'));

// 2. CTA targets must be real routes
const routePaths = new Set([...app.matchAll(/<Route\s+path="([^"]*)"/g)].map((m) => m[1]));
const gradientTargets = [...notFound.matchAll(/GradientButton\s+to="([^"]+)"/g)].map((m) => m[1]);
const ghostTargets = [...notFound.matchAll(/GhostButton\s+to="([^"]+)"/g)].map((m) => m[1]);
const quickLinks = [...notFound.matchAll(/<Link to="([^"]+)"/g)].map((m) => m[1]);
const allTargets = [...gradientTargets, ...ghostTargets, ...quickLinks];
check("404 surfaces CTAs (GradientButton + GhostButton + quick links)",
  gradientTargets.length >= 1 && ghostTargets.length >= 1 && quickLinks.length >= 3);
const broken = allTargets.filter((t) => !routePaths.has(t));
check("Every 404 CTA/quick-link targets a real route: " + allTargets.join(", "), broken.length === 0);
if (broken.length) console.log("   broken:", broken.join(", "));

// 3. Catch-all wiring inside Layout
check("App.tsx wires the catch-all route path=\"*\" to NotFound",
  /<Route\s+path="\*"\s+element=\{<NotFound\s+\/>\}/.test(app));
check("NotFound import present in App.tsx", app.includes('import NotFound from "./pages/NotFound"'));

// 4. Route regression: every pre-existing route still intact
const ORIGINAL_ROUTES = ["/", "/waitlist", "/register", "/signup", "/signin", "/login", "/live",
  "/academy", "/dashboard", "/tribe", "/agency", "/gallery", "/ai", "/blog", "/about",
  "/partner", "/partner-with-us", "/leaderboard", "/messages", "/verify",
  "/attendance-review", "/settings", "/admin"];
const missing = ORIGINAL_ROUTES.filter((r) => !routePaths.has(r));
check("All " + ORIGINAL_ROUTES.length + " pre-existing routes remain intact", missing.length === 0);
if (missing.length) console.log("   missing:", missing.join(", "));

if (failed) {
  console.error("Step 15 branded-404 verification failed!");
  process.exit(1);
}
console.log("------------------------------------------------------------");
console.log("ALL STEP 15 BRANDED-404 CHECKS PASSED!");
console.log("------------------------------------------------------------");
