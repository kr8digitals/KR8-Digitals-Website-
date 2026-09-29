/**
 * STEP 9 Functional Regression: signatureStore (executes real TS source via esbuild)
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 9 (FUNCTIONAL): SIGNATURE STORE EXECUTION");
console.log("------------------------------------------------------------");

const ROOT = path.resolve(__dirname, "..");
let failed = false;
const check = (label, cond) => {
  console.log((cond ? "\u2713 " : "\u2717 ") + label);
  if (!cond) failed = true;
};

const entry = path.join(os.tmpdir(), "kr8_step9_entry.ts");
const bundle = path.join(os.tmpdir(), "kr8_step9_bundle.cjs");

fs.writeFileSync(
  entry,
  'import {\n' +
  '  getSignatures, saveSignature, deleteSignature, resetSignaturesToDefault,\n' +
  '  normalizeSkill, getCoachSignatureForSkill, getAdminSignature,\n' +
  '} from "' + path.join(ROOT, "src/data/signatureStore") + '";\n' +
  '\n' +
  '// 1. Skill normalization matrix\n' +
  'const nrm = (s: string) => normalizeSkill(s);\n' +
  'console.log("NORM_GRAPHIC=" + (nrm("Graphic Design") === "graphic" ? "1" : "0"));\n' +
  'console.log("NORM_VIDEO=" + (nrm("Video Editing & Motion") === "video" ? "1" : "0"));\n' +
  'console.log("NORM_FRONTEND=" + (nrm("Front-End Development") === "frontend" ? "1" : "0"));\n' +
  'console.log("NORM_WORDPRESS=" + (nrm("WordPress Development") === "web" ? "1" : "0"));\n' +
  'console.log("NORM_SOCIAL=" + (nrm("Social Media Marketing") === "content_creation" ? "1" : "0"));\n' +
  'console.log("NORM_UIUX=" + (nrm("UI/UX") === "uiux" ? "1" : "0"));\n' +
  'console.log("NORM_UNKNOWN=" + (nrm("AI Prompt Engineering!") === "ai_prompt_engineering_" ? "1" : "0"));\n' +
  '\n' +
  '// 2. Lookup with graceful fallback\n' +
  'const g = getCoachSignatureForSkill("Graphic Design");\n' +
  'console.log("LOOKUP_GRAPHIC=" + (g.skillKey === "graphic" && !!g.signatureUrl ? "1" : "0"));\n' +
  'const f = getCoachSignatureForSkill("Nonexistent Future Skill");\n' +
  'console.log("LOOKUP_FALLBACK=" + (f.role === "coach" && !!f.signatureUrl ? "1" : "0"));\n' +
  'const a = getAdminSignature();\n' +
  'console.log("ADMIN_EXISTS=" + (a.role === "admin" && !!a.signatureUrl ? "1" : "0"));\n' +
  '\n' +
  '// 3. Save (upsert) with normalization\n' +
  'const saved = saveSignature({ role: "coach", skillKey: "AI Prompt Engineering", coachName: "Test Coach", title: "T", signatureUrl: "data:image/png;base64,x" });\n' +
  'console.log("SAVE_NORM=" + (saved.skillKey === "ai_prompt_engineering" ? "1" : "0"));\n' +
  'console.log("SAVE_PERSISTED=" + (getCoachSignatureForSkill("AI Prompt Engineering").id === saved.id ? "1" : "0"));\n' +
  'const again = saveSignature({ id: saved.id, role: "coach", skillKey: "video", coachName: "Renamed Coach", title: "T2", signatureUrl: "data:image/png;base64,y" });\n' +
  'console.log("SAVE_UPSERT=" + (again.id === saved.id && again.coachName === "Renamed Coach" && getSignatures().filter(s => s.id === saved.id).length === 1 ? "1" : "0"));\n' +
  '\n' +
  '// 4. Admin deletion protection\n' +
  'let threw = false;\n' +
  'try { deleteSignature("sig_admin"); } catch { threw = true; }\n' +
  'console.log("ADMIN_PROTECTED=" + (threw ? "1" : "0"));\n' +
  'console.log("ADMIN_STILL_EXISTS=" + (getAdminSignature().id === "sig_admin" ? "1" : "0"));\n' +
  '\n' +
  '// 5. Coach deletion works\n' +
  'deleteSignature(saved.id);\n' +
  'console.log("COACH_DELETED=" + (getSignatures().find(s => s.id === saved.id) === undefined ? "1" : "0"));\n' +
  '\n' +
  '// 6. Reset to defaults\n' +
  'saveSignature({ role: "coach", skillKey: "junk", coachName: "J", title: "J", signatureUrl: "data:x" });\n' +
  'resetSignaturesToDefault();\n' +
  'console.log("RESET_OK=" + (getSignatures().length === 6 && getSignatures().some(s => s.skillKey === "junk") === false ? "1" : "0"));\n'
  );

let out = "";
try {
  const esbuild = require("esbuild");
  esbuild.buildSync({ entryPoints: [entry], bundle: true, platform: "node", format: "cjs", outfile: bundle, logLevel: "error" });
  out = execFileSync(process.execPath, [bundle], { encoding: "utf-8" });
} catch (err) {
  console.error("\u2717 Failed to bundle/execute signatureStore.ts under Node:", err.message);
  failed = true;
}

if (out) {
  const kv = {};
  for (const line of out.split("\n")) {
    const i = line.indexOf("=");
    if (i > 0) kv[line.slice(0, i)] = line.slice(i + 1);
  }
  check("normalizeSkill: 'Graphic Design' -> graphic", kv.NORM_GRAPHIC === "1");
  check("normalizeSkill: 'Video Editing & Motion' -> video", kv.NORM_VIDEO === "1");
  check("normalizeSkill: 'Front-End Development' -> frontend", kv.NORM_FRONTEND === "1");
  check("normalizeSkill: 'WordPress Development' -> web", kv.NORM_WORDPRESS === "1");
  check("normalizeSkill: 'Social Media Marketing' -> content_creation", kv.NORM_SOCIAL === "1");
  check("normalizeSkill: 'UI/UX' -> uiux", kv.NORM_UIUX === "1");
  check("normalizeSkill: unknown future skill sanitized safely", kv.NORM_UNKNOWN === "1");
  check("Coach lookup by real skill name resolves mapped signature", kv.LOOKUP_GRAPHIC === "1");
  check("Unknown skill falls back to a valid coach signature", kv.LOOKUP_FALLBACK === "1");
  check("Administrator signature always resolves", kv.ADMIN_EXISTS === "1");
  check("saveSignature normalizes new skill keys", kv.SAVE_NORM === "1");
  check("Saved signature is immediately persisted and resolvable", kv.SAVE_PERSISTED === "1");
  check("saveSignature with existing id upserts (no duplicates)", kv.SAVE_UPSERT === "1");
  check("Administrator signature is protected from deletion", kv.ADMIN_PROTECTED === "1");
  check("Administrator signature survives delete attempt", kv.ADMIN_STILL_EXISTS === "1");
  check("Coach signature deletion works", kv.COACH_DELETED === "1");
  check("Reset to Defaults restores the 6 verified Drive signatures", kv.RESET_OK === "1");
}

if (failed) {
  console.error("Step 9 functional verification failed!");
  process.exit(1);
}
console.log("------------------------------------------------------------");
console.log("ALL STEP 9 FUNCTIONAL CHECKS PASSED!");
console.log("------------------------------------------------------------");
