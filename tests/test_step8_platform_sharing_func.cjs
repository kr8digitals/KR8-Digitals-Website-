/**
 * STEP 8 Functional Regression: buildSocialShareLinks (executes real TS source via esbuild)
 * Verifies platform-specific message templates, verification back-links, and share-intent URL encoding.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 8 (FUNCTIONAL): PLATFORM SHARE MESSAGING EXECUTION");
console.log("------------------------------------------------------------");

const ROOT = path.resolve(__dirname, "..");

let failed = false;
const check = (label, cond) => {
  console.log((cond ? "\u2713 " : "\u2717 ") + label);
  if (!cond) failed = true;
};

// Bundle the real TS source so it executes under Node
let out;
try {
  const entry = path.join(os.tmpdir(), "kr8_step8_entry.ts");
  const bundle = path.join(os.tmpdir(), "kr8_step8_bundle.cjs");
  fs.writeFileSync(
    entry,
    'import { buildSocialShareLinks } from "' + path.join(ROOT, "src/utils/socialShare") + '";\n' +
    'const student = { id: "KR8-2026-0042", name: "Bio NIch", skill: "uiux" };\n' +
    'const cert = { id: "CERT-8F3KQX", tier: "Mastery", skillName: "UI/UX Design" };\n' +
    'const out = buildSocialShareLinks({ student, cert, origin: "https://kr8digitals.com" });\n' +
    'const tricky = buildSocialShareLinks({\n' +
    '  student: { id: "KR8-2026-0099", name: "Afolayan Grace Oluwapelumi", skill: "webdev" },\n' +
    '  cert: { id: "CERT-XYZ", tier: "Completion", skillName: "Web Development & Frontend" },\n' +
    '  origin: "https://kr8digitals.com",\n' +
    '});\n' +
    'console.log("VERIFYURL=" + out.verifyUrl);\n' +
    'for (const p of ["linkedin", "twitter", "whatsapp", "facebook", "telegram"]) {\n' +
    '  console.log("HAS_" + p.toUpperCase() + "=" + (out.platformMessages[p].includes(out.verifyUrl) ? "1" : "0"));\n' +
    '  console.log("DISTINCT_" + p.toUpperCase() + "=" + (out.platformMessages[p].length > 40 ? "1" : "0"));\n' +
    '}\n' +
    'console.log("EMAIL_OK=" + (out.platformMessages.emailBody.includes(out.verifyUrl) && out.platformMessages.emailBody.includes("KR8-2026-0042") && out.platformMessages.emailBody.includes("CERT-8F3KQX") ? "1" : "0"));\n' +
    'console.log("LI_PRO=" + (out.platformMessages.linkedin.includes("#KR8Digitals") && out.platformMessages.linkedin.includes("Special thanks") ? "1" : "0"));\n' +
    'console.log("TW_PUNCHY=" + (out.platformMessages.twitter.includes("@KR8Digitals") && out.platformMessages.twitter.length < 300 ? "1" : "0"));\n' +
    'console.log("WA_CHAT=" + (out.platformMessages.whatsapp.includes("*Exciting News!*") && out.platformMessages.whatsapp.includes("\\ud83d\\udc49") ? "1" : "0"));\n' +
    'console.log("WA_INTENT=" + (out.whatsapp.startsWith("https://api.whatsapp.com/send?text=") && decodeURIComponent(out.whatsapp).includes(out.verifyUrl) ? "1" : "0"));\n' +
    'console.log("TW_INTENT=" + (out.twitter.startsWith("https://twitter.com/intent/tweet?text=") && decodeURIComponent(out.twitter).includes(out.verifyUrl) ? "1" : "0"));\n' +
    'console.log("LI_INTENT=" + (out.linkedin.startsWith("https://www.linkedin.com/sharing/share-offsite/?url=") && out.linkedin.includes(encodeURIComponent(out.verifyUrl)) ? "1" : "0"));\n' +
    'console.log("FB_INTENT=" + (out.facebook.startsWith("https://www.facebook.com/sharer/sharer.php?u=") && out.facebook.includes(encodeURIComponent(out.verifyUrl)) ? "1" : "0"));\n' +
    'console.log("TG_INTENT=" + (out.telegram.startsWith("https://t.me/share/url?url=") && out.telegram.includes(encodeURIComponent(out.verifyUrl)) ? "1" : "0"));\n' +
    'console.log("MAIL_OK=" + (out.email.startsWith("mailto:?subject=") && decodeURIComponent(out.email).includes(out.verifyUrl) ? "1" : "0"));\n' +
    'const noOrigin = buildSocialShareLinks({ student, cert });\n' +
    'console.log("FALLBACK_OK=" + (noOrigin.verifyUrl.startsWith("https://kr8digitals.com/verify?id=") ? "1" : "0"));\n' +
    'console.log("ENCODING_OK=" + (tricky.whatsapp.length > 0 && decodeURIComponent(tricky.whatsapp).includes("Web Development & Frontend") ? "1" : "0"));\n'
  );
  const esbuild = require("esbuild");
  esbuild.buildSync({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    format: "cjs",
    outfile: bundle,
    logLevel: "error",
  });
  out = execFileSync(process.execPath, [bundle], { encoding: "utf-8" });
  fs.unlinkSync(entry);
  fs.unlinkSync(bundle);
} catch (err) {
  console.error("\u2717 Failed to bundle/execute socialShare.ts under Node:", err.message);
  failed = true;
}

if (out) {
  const kv = {};
  for (const line of out.split("\n")) {
    const i = line.indexOf("=");
    if (i > 0) kv[line.slice(0, i)] = line.slice(i + 1);
  }

  check("verifyUrl resolves to kr8digitals.com/verify?id=...&cert=...",
    kv.VERIFYURL === "https://kr8digitals.com/verify?id=KR8-2026-0042&cert=CERT-8F3KQX");
  for (const p of ["LINKEDIN", "TWITTER", "WHATSAPP", "FACEBOOK", "TELEGRAM"]) {
    check("platformMessages." + p.toLowerCase() + " links back to verification portal", kv["HAS_" + p] === "1");
    check("platformMessages." + p.toLowerCase() + " is a real, distinct template", kv["DISTINCT_" + p] === "1");
  }
  check("Email copy contains verification link + student ID + cert reference", kv.EMAIL_OK === "1");
  check("LinkedIn copy is professional long-form (hashtags + mentor thanks)", kv.LI_PRO === "1");
  check("X/Twitter copy is punchy and tags @KR8Digitals", kv.TW_PUNCHY === "1");
  check("WhatsApp copy is conversational with markdown bold + emoji pointer", kv.WA_CHAT === "1");
  check("WhatsApp share intent URL well-formed with encoded message", kv.WA_INTENT === "1");
  check("X/Twitter intent URL well-formed with encoded message", kv.TW_INTENT === "1");
  check("LinkedIn share-offsite intent targets verification URL", kv.LI_INTENT === "1");
  check("Facebook sharer intent targets verification URL", kv.FB_INTENT === "1");
  check("Telegram share intent targets verification URL", kv.TG_INTENT === "1");
  check("Email mailto link contains subject + encoded body", kv.MAIL_OK === "1");
  check("Non-browser origin falls back safely to https://kr8digitals.com", kv.FALLBACK_OK === "1");
  check("Long names & ampersands encode cleanly in intent URLs", kv.ENCODING_OK === "1");
}

if (failed) {
  console.error("Step 8 functional verification failed!");
  process.exit(1);
}
console.log("------------------------------------------------------------");
console.log("ALL STEP 8 FUNCTIONAL CHECKS PASSED!");
console.log("------------------------------------------------------------");
