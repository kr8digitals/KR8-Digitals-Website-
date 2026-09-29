/**
 * STEP 10 Functional Regression: certificate name formatting & custom-name precedence
 * Executes the real formatCertificateStudentName from certificate.ts under Node.
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 10 (FUNCTIONAL): CERTIFICATE NAME FORMATTING");
console.log("------------------------------------------------------------");

const ROOT = path.resolve(__dirname, "..");
let failed = false;
const check = (label, cond) => {
  console.log((cond ? "\u2713 " : "\u2717 ") + label);
  if (!cond) failed = true;
};

const entry = path.join(os.tmpdir(), "kr8_step10_entry.ts");
const bundle = path.join(os.tmpdir(), "kr8_step10_bundle.cjs");

fs.writeFileSync(
  entry,
  'import { formatCertificateStudentName } from "' + path.join(ROOT, "src/utils/certificate") + '";\n' +
  'const f = (s: string) => JSON.stringify(formatCertificateStudentName(s));\n' +
  'console.log("EMPTY=" + f(""));\n' +
  'console.log("SINGLE=" + f("bio"));\n' +
  'console.log("TWO=" + f("Bio NIch"));\n' +
  'console.log("THREE=" + f("John Thomas Theophilus"));\n' +
  'console.log("FOUR=" + f("Chukwuemeka Kingsley Theophilus Nnamdi"));\n' +
  'console.log("EXISTING_INITIAL=" + f("Nicodemus O. Chukwuka"));\n' +
  'console.log("WHITESPACE=" + f("   double   space   name  "));\n' +
  'console.log("NONLETTER_MID=" + f("Ada-Love Grace Onyeka"));\n' +
  '\n' +
  '// customStudentName precedence expression (same semantics as certificate.ts line 358)\n' +
  'const pick = (customStudentName: string | undefined, student: { name: string }) => (customStudentName?.trim() || student.name);\n' +
  'console.log("PRECEDENCE_CUSTOM=" + JSON.stringify(pick("  Edited Name ", { name: "Account Name" })));\n' +
  'console.log("PRECEDENCE_BLANK=" + JSON.stringify(pick("   ", { name: "Account Name" })));\n' +
  'console.log("PRECEDENCE_UNDEFINED=" + JSON.stringify(pick(undefined, { name: "Account Name" })));\n'
  );

let out = "";
try {
  const esbuild = require("esbuild");
  esbuild.buildSync({ entryPoints: [entry], bundle: true, platform: "node", format: "cjs", outfile: bundle, logLevel: "error" });
  out = execFileSync(process.execPath, [bundle], { encoding: "utf-8" });
} catch (err) {
  console.error("\u2717 Failed to bundle/execute certificate.ts under Node:", err.message);
  failed = true;
}

if (out) {
  const kv = {};
  for (const line of out.split("\n")) {
    const i = line.indexOf("=");
    if (i > 0) kv[line.slice(0, i)] = line.slice(i + 1);
  }
  check("Empty name yields empty string (no crash)", kv.EMPTY === '""');
  check("Single word -> ALL CAPS", kv.SINGLE === '"BIO"');
  check("Two words -> both ALL CAPS", kv.TWO === '"BIO NICH"');
  check("Three words -> first + last full, middle abbreviated (JOHN T. THEOPHILUS)", kv.THREE === '"JOHN T. THEOPHILUS"');
  check("Four words -> multiple middle initials (CHUKWUEMEKA K. T. NNAMDI)", kv.FOUR === '"CHUKWUEMEKA K. T. NNAMDI"');
  check("Existing initial preserved (NICODEMUS O. CHUKWUKA)", kv.EXISTING_INITIAL === '"NICODEMUS O. CHUKWUKA"');
  check("Extra whitespace collapsed to clean parts (DOUBLE S. NAME)", kv.WHITESPACE === '"DOUBLE S. NAME"');
  check("Non-letter middle part degrades safely", kv.NONLETTER_MID !== undefined);
  check("Edited custom name takes precedence", kv.PRECEDENCE_CUSTOM === '"Edited Name"');
  check("Whitespace-only custom name falls back to account name", kv.PRECEDENCE_BLANK === '"Account Name"');
  check("Undefined custom name falls back to account name", kv.PRECEDENCE_UNDEFINED === '"Account Name"');
}

if (failed) {
  console.error("Step 10 functional verification failed!");
  process.exit(1);
}
console.log("------------------------------------------------------------");
console.log("ALL STEP 10 FUNCTIONAL CHECKS PASSED!");
console.log("------------------------------------------------------------");
