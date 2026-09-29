/**
 * STEP 14 Functional Regression: System-Wide Logic Consistency Audit
 * - Event-bus consistency: every kr8:* listener has a dispatcher (dormant extension points allowlisted)
 * - Storage-key consistency: canonical kr8_accounts_v3, v2 is migration-only
 * - Geometry consistency: both certificate templates carry the calibrated ratios and the renderer consumes them
 * - Logout consistency: signOut clears all session artifacts AND dispatches the event AuthContext listens to
 * - Live-stream untouched: live-stream domain events live only in the untouchable live-stream files
 */
const fs = require("fs");
const path = require("path");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 14 (FUNCTIONAL): SYSTEM-WIDE CONSISTENCY AUDIT");
console.log("------------------------------------------------------------");

const ROOT = path.resolve(__dirname, "..");
let failed = false;
const check = (label, cond) => {
  console.log((cond ? "\u2713 " : "\u2717 ") + label);
  if (!cond) failed = true;
};

// Gather all source text
const srcFiles = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(entry.name)) srcFiles.push(p);
  }
})(path.join(ROOT, "src"));

const allSrc = srcFiles.map((f) => ({ file: f, text: fs.readFileSync(f, "utf-8") }));
const full = allSrc.map((s) => s.text).join("\n");

// 1. EVENT BUS CONSISTENCY
const dispatched = new Set([...full.matchAll(/dispatchEvent\((?:new (?:Custom)?Event\()?["']kr8:[a-z0-9-]+["']/g)].map((m) => m[0].match(/kr8:[a-z0-9-]+/)[0]));
const listened = new Set([...full.matchAll(/addEventListener\(["']kr8:[a-z0-9-]+["']/g)].map((m) => m[0].match(/kr8:[a-z0-9-]+/)[0]));

// Dormant extension points: listened but intentionally not dispatched yet
const DORMANT = new Set(["kr8:open-signin"]);
const orphanListeners = [...listened].filter((e) => !dispatched.has(e) && !DORMANT.has(e));
check("Event bus: every listener has a dispatcher (dormant points allowlisted)", orphanListeners.length === 0);
if (orphanListeners.length) console.log("   orphans:", orphanListeners.join(", "));

// 2. LIVE-STREAM UNTOUCHED: live-stream protocol events originate only in the livekit library,
//    and the live-stream UI surface (context + page) remains intact
const livekit = fs.readFileSync(path.join(ROOT, "src/lib/livekit.ts"), "utf-8");
check("Live-stream protocol events (livekit-data, webrtc-signaling) dispatched from the livekit library",
  livekit.includes('dispatchEvent(new CustomEvent("kr8:livekit-data"') &&
  livekit.includes('dispatchEvent(new CustomEvent("kr8:webrtc-signaling"'));
check("LiveStreamContext provides the useLiveStream hook",
  (() => {
    const ls = allSrc.find((s) => s.file.endsWith("LiveStreamContext.tsx"));
    return !!ls && ls.text.includes("useLiveStream");
  })());
check("LivePage still consumes the live stream context",
  (() => {
    const lp = allSrc.find((s) => s.file.endsWith("LivePage.tsx"));
    return !!lp && lp.text.includes("useLiveStream") && lp.text.includes("export default function LivePage");
  })());

// 3. STORAGE KEY CONSISTENCY
const accountsV3 = (full.match(/kr8_accounts_v3/g) || []).length;
const accountsV2 = (full.match(/kr8_accounts_v2/g) || []).length;
check("Canonical accounts store is kr8_accounts_v3 (single ACCOUNT_STORAGE_KEY)",
  accountsV3 >= 1 && full.includes('const ACCOUNT_STORAGE_KEY = "kr8_accounts_v3"'));
check("kr8_accounts_v2 is migration-only (<= 2 references: legacy read + removal)", accountsV2 <= 2);
check("Migration removes legacy v2 key after import", /removeItem\("kr8_accounts_v2"\)/.test(full));

// 4. GEOMETRY CONSISTENCY (registry -> renderer)
const templates = fs.readFileSync(path.join(ROOT, "src/data/certificateTemplates.ts"), "utf-8");
const renderer = fs.readFileSync(path.join(ROOT, "src/utils/certificate.ts"), "utf-8");
const calibrated = (t) => t.includes("nameCenterRatioX: 0.4185") && t.includes("nameBaselineRatioY: 0.5116") && t.includes("nameMaxRatioWidth: 0.48");
check("Both certificate templates carry the calibrated geometry (0.4185 / 0.5116 / 0.48)",
  calibrated(templates) && (templates.match(/nameCenterRatioX: 0\.4185/g) || []).length >= 2);
check("Renderer consumes geometry from the template config (not hardcoded)",
  renderer.includes("config.geometry.nameCenterRatioX") &&
  renderer.includes("config.geometry.nameBaselineRatioY") &&
  renderer.includes("config.geometry.nameMaxRatioWidth"));

// 5. LOGOUT CONSISTENCY
const authCtx = fs.readFileSync(path.join(ROOT, "src/context/AuthContext.tsx"), "utf-8");
const signOutBody = authCtx.slice(authCtx.indexOf("const signOut = () => {"));
check("signOut clears kr8_current from localStorage", signOutBody.includes('localStorage.removeItem("kr8_current")'));
check("signOut clears the session + device-session artifacts", signOutBody.includes("SESSION_KEY") && signOutBody.includes("DEVICE_SESSION_DATA"));
check("signOut also clears sessionStorage kr8_current", signOutBody.includes('sessionStorage.removeItem("kr8_current")'));
check("signOut dispatches kr8:auth-logout", signOutBody.includes('dispatchEvent(new CustomEvent("kr8:auth-logout"))'));
check("AuthContext listens to kr8:auth-logout and resets in-memory state",
  /addEventListener\("kr8:auth-logout", handleLogout\)/.test(authCtx) && /const handleLogout = \(\) => \{\s*setStudent\(null\);/.test(authCtx));

// 6. TRIBE CONVERSION CTA on Verify page
const verify = fs.readFileSync(path.join(ROOT, "src/pages/Verify.tsx"), "utf-8");
check("Verify page renders the Tribe conversion CTA linking to /tribe",
  verify.includes('to="/tribe"') && verify.includes("Join the KR8 Tribe \u2192"));

// 7. STUDENT ID COPY on both surfaces (with user feedback state)
const dash = fs.readFileSync(path.join(ROOT, "src/pages/Dashboard.tsx"), "utf-8");
const academy = fs.readFileSync(path.join(ROOT, "src/pages/Academy.tsx"), "utf-8");
check("Dashboard copies student.id with temporary Copied feedback",
  dash.includes("navigator.clipboard.writeText(student.id)") && /setCopiedId\(true\)/.test(dash));
check("Academy copies profile.id with clipboard + execCommand fallback and notification",
  academy.includes("navigator.clipboard.writeText(profile.id)") &&
  academy.includes('document.execCommand("copy")') &&
  academy.includes("KR8 ID copied to clipboard"));

if (failed) {
  console.error("Step 14 functional verification failed!");
  process.exit(1);
}
console.log("------------------------------------------------------------");
console.log("ALL STEP 14 FUNCTIONAL CHECKS PASSED!");
console.log("------------------------------------------------------------");
