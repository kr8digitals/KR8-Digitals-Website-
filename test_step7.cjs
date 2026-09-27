console.log("=== RUNNING STEP 7 — CERTIFICATE SHARING VALIDATION ===");

// 1. Verify buildSocialShareLinks
const mockStudent = {
  id: "KR82026GG0001GRA",
  name: "Grant Gideon",
  email: "grant@example.com",
};

const mockCert = {
  id: "CERT-KR8-GRAPHIC-GG001",
  tier: "Professionalism",
  skillName: "Graphic Design",
  studentName: "Grant Gideon",
};

function buildSocialShareLinks({ student, cert, origin = "https://kr8digitals.com" }) {
  const verifyUrl = `${origin}/verify?id=${encodeURIComponent(student.id)}&cert=${encodeURIComponent(cert.id)}`;
  const skill = cert.skillName || "Digital Skills";
  const shareText = `🎓 Proud to announce that I have officially graduated and earned my verified Certificate of ${cert.tier} in ${skill} from KR8 Digitals! Verify my credentials here: ${verifyUrl} #KR8Digitals #DigitalSkills #Graduation`;

  return {
    verifyUrl,
    shareText,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `🎓 Proud to announce that I have earned my verified Certificate of ${cert.tier} in ${skill} from @KR8Digitals!`
    )}&url=${encodeURIComponent(verifyUrl)}&hashtags=KR8Digitals,TechSkills,Graduation`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`,
  };
}

const links = buildSocialShareLinks({ student: mockStudent, cert: mockCert });

console.log("\n--- [TEST 1] Social Media Links & Query Formats ---");
console.log("Verify URL:", links.verifyUrl);
console.log("WhatsApp Link:", links.whatsapp);
console.log("Twitter/X Link:", links.twitter);
console.log("LinkedIn Link:", links.linkedin);

if (!links.whatsapp.includes("api.whatsapp.com") || !links.whatsapp.includes(encodeURIComponent(links.verifyUrl))) {
  throw new Error("WhatsApp share link invalid!");
}
if (!links.twitter.includes("twitter.com/intent/tweet") || !links.twitter.includes(encodeURIComponent(links.verifyUrl))) {
  throw new Error("Twitter share link invalid!");
}
if (!links.linkedin.includes("linkedin.com/sharing/share-offsite") || !links.linkedin.includes(encodeURIComponent(links.verifyUrl))) {
  throw new Error("LinkedIn share link invalid!");
}

console.log("✓ All social sharing links generated with exact query encoding and verification links!");

console.log("\n=======================================================");
console.log("=== STEP 7 CERTIFICATE SHARING VERIFIED SUCCESSFULLY! ===");
console.log("=======================================================");
