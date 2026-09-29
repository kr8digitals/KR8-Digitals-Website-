/**
 * STEP 16 Comprehensive Test: Data/Content Architecture, SEO & Responsiveness
 */

const fs = require("fs");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 16: SEO & RESPONSIVENESS ARCHITECTURE VERIFICATION");
console.log("------------------------------------------------------------");

let failed = false;

// 1. Verify robots.txt
if (fs.existsSync("./public/robots.txt")) {
  const robots = fs.readFileSync("./public/robots.txt", "utf-8");
  if (robots.includes("User-agent: *") && robots.includes("Sitemap:")) {
    console.log("✓ robots.txt verified with search engine permissions and sitemap reference!");
  } else {
    console.error("✗ robots.txt missing required directives!");
    failed = true;
  }
} else {
  console.error("✗ robots.txt not found!");
  failed = true;
}

// 2. Verify sitemap.xml
if (fs.existsSync("./public/sitemap.xml")) {
  const sitemap = fs.readFileSync("./public/sitemap.xml", "utf-8");
  if (sitemap.includes("<urlset") && sitemap.includes("https://kr8digitals.com/verify")) {
    console.log("✓ sitemap.xml verified with core platform endpoints!");
  } else {
    console.error("✗ sitemap.xml missing required endpoints!");
    failed = true;
  }
} else {
  console.error("✗ sitemap.xml not found!");
  failed = true;
}

// 3. Verify index.html Canonical & Schema.org Structured Data
const indexHtml = fs.readFileSync("./index.html", "utf-8");
if (
  indexHtml.includes('rel="canonical"') &&
  indexHtml.includes('"@type": "EducationalOrganization"') &&
  indexHtml.includes('"name": "KR8 Digitals"')
) {
  console.log("✓ index.html has valid canonical tag and EducationalOrganization JSON-LD structured data!");
} else {
  console.error("✗ index.html missing canonical or JSON-LD structured data!");
  failed = true;
}

// 4. Verify Responsive Breakpoints across key pages
const checkResponsiveClasses = (filePath, terms) => {
  const content = fs.readFileSync(filePath, "utf-8");
  for (const t of terms) {
    if (!content.includes(t)) {
      console.error(`✗ ${filePath} missing expected responsive class pattern "${t}"`);
      failed = true;
      return false;
    }
  }
  return true;
};

if (checkResponsiveClasses("./src/pages/Admin.tsx", ["lg:grid-cols-12", "sm:flex-row", "overflow-x-auto"])) {
  console.log("✓ Admin.tsx verified for responsive mobile, tablet, and desktop viewports!");
}

if (checkResponsiveClasses("./src/pages/Verify.tsx", ["sm:flex-row", "max-w-2xl"])) {
  console.log("✓ Verify.tsx verified for responsive mobile and desktop viewports!");
}

if (checkResponsiveClasses("./src/components/GraduationShareModal.tsx", ["sm:grid-cols-3", "max-h-[92vh]"])) {
  console.log("✓ GraduationShareModal verified for responsive modal viewports!");
}

if (failed) {
  console.error("Step 16 verification failed!");
  process.exit(1);
}

console.log("------------------------------------------------------------");
console.log("ALL STEP 16 CHECKS PASSED SUCCESSFULLY!");
console.log("------------------------------------------------------------");
