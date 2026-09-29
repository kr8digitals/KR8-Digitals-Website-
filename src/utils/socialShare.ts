import QRCode from "qrcode";
import type { CertificateRecord, Account } from "../data/store";
import { resolveCertificateImageUrl } from "./certificate";

export interface SocialShareOptions {
  cert: CertificateRecord;
  student: Account;
  origin?: string;
  format?: "landscape" | "square";
}

/**
 * Generates an official social-media-ready graduation announcement image
 * containing the certificate, KR8 branding, student credentials, and verification QR code.
 */
export async function generateGraduationShareImage({
  cert,
  student,
  origin,
  format = "landscape",
}: SocialShareOptions): Promise<string> {
  const isLandscape = format === "landscape";
  const width = isLandscape ? 1200 : 1080;
  const height = isLandscape ? 675 : 1080;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize 2D canvas for social share graphic.");

  const baseOrigin =
    origin || (typeof window !== "undefined" ? window.location.origin : "https://kr8digitals.com");
  const verifyUrl = `${baseOrigin}/verify?id=${encodeURIComponent(student.id)}&cert=${encodeURIComponent(cert.id)}`;

  // 1. Render Premium Obsidian & Vibrant Neon Backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#0d0017");
  bgGrad.addColorStop(0.5, "#18002a");
  bgGrad.addColorStop(1, "#07000c");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle Ambient Glows
  const glow1 = ctx.createRadialGradient(width * 0.2, height * 0.3, 10, width * 0.2, height * 0.3, width * 0.45);
  glow1.addColorStop(0, "rgba(224, 30, 90, 0.22)");
  glow1.addColorStop(1, "rgba(224, 30, 90, 0)");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, width, height);

  const glow2 = ctx.createRadialGradient(width * 0.8, height * 0.7, 10, width * 0.8, height * 0.7, width * 0.4);
  glow2.addColorStop(0, "rgba(138, 43, 226, 0.2)");
  glow2.addColorStop(1, "rgba(138, 43, 226, 0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, width, height);

  // 2. Render Header Branding Banner
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText("KR8 DIGITALS", 50, 48);

  ctx.fillStyle = "#e01e5a";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText("✦ OFFICIAL GRADUATION HONORS", 215, 46);

  ctx.fillStyle = "#8a7ba8";
  ctx.font = "12px monospace";
  ctx.textAlign = "right";
  ctx.fillText(`ID: ${student.id}`, width - 50, 46);
  ctx.restore();

  // 3. Render Certificate Document
  const certImgUrl = await resolveCertificateImageUrl(cert, student);
  const certImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load certificate image for social graphic."));
    img.src = certImgUrl;
  });

  // Calculate certificate placement
  const certMaxWidth = isLandscape ? width * 0.58 : width * 0.88;
  const certAspect = (certImg.naturalWidth || 2048) / (certImg.naturalHeight || 1331);
  const certW = certMaxWidth;
  const certH = Math.round(certW / certAspect);
  const certX = isLandscape ? 50 : Math.round((width - certW) / 2);
  const certY = isLandscape ? Math.round((height - certH) / 2) + 10 : 80;

  // Certificate Shadow & Glow
  ctx.save();
  ctx.shadowColor = "rgba(224, 30, 90, 0.35)";
  ctx.shadowBlur = 35;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 8;

  // Rounded Certificate
  ctx.beginPath();
  ctx.roundRect(certX, certY, certW, certH, 12);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.drawImage(certImg, certX, certY, certW, certH);
  ctx.restore();

  // Border around certificate
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(certX, certY, certW, certH, 12);
  ctx.stroke();
  ctx.restore();

  // 4. Render Right-Hand (or Bottom) Announcement Panel
  const rightX = isLandscape ? certX + certW + 40 : 60;
  const rightY = isLandscape ? certY + 10 : certY + certH + 30;
  const rightWidth = isLandscape ? width - rightX - 50 : width - 120;

  ctx.save();
  // Pill badge
  ctx.fillStyle = "rgba(224, 30, 90, 0.18)";
  ctx.beginPath();
  ctx.roundRect(rightX, rightY, 175, 28, 14);
  ctx.fill();
  ctx.strokeStyle = "rgba(224, 30, 90, 0.5)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#ff6599";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("CERTIFIED GRADUATE 🎓", rightX + 16, rightY + 18);

  // Student Name
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px sans-serif";
  const studentDisplayName = (student.name || "Graduate").toUpperCase();
  ctx.fillText(studentDisplayName, rightX, rightY + 68, rightWidth);

  // Skill Name
  ctx.fillStyle = "#d4b8ff";
  ctx.font = "bold 18px sans-serif";
  const skillTitle = cert.skillName || "Digital Specialist";
  ctx.fillText(`Certified in ${skillTitle}`, rightX, rightY + 100, rightWidth);

  // Congratulatory subtext
  ctx.fillStyle = "#a897c4";
  ctx.font = "13px sans-serif";
  const line1 = `Officially verified Certificate of ${cert.tier}.`;
  const line2 = "Mastering practical digital skills at KR8 Digitals.";
  ctx.fillText(line1, rightX, rightY + 130);
  ctx.fillText(line2, rightX, rightY + 150);

  // 5. Verification QR Code Card
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 2,
    color: { dark: "#12001f", light: "#ffffff" },
  });
  const qrImg = await new Promise<HTMLImageElement>((res, rej) => {
    const q = new Image();
    q.onload = () => res(q);
    q.onerror = rej;
    q.src = qrDataUrl;
  });

  const qrBoxY = rightY + 185;
  const qrCardW = 120;
  const qrCardH = 120;

  // White Card for QR
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(rightX, qrBoxY, qrCardW, qrCardH, 12);
  ctx.fill();
  ctx.drawImage(qrImg, rightX + 8, qrBoxY + 8, qrCardW - 16, qrCardH - 16);

  // Text next to QR Code
  const qrTextX = rightX + qrCardW + 20;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("VERIFIED ON-CHAIN & WEB", qrTextX, qrBoxY + 35);

  ctx.fillStyle = "#8a7ba8";
  ctx.font = "11px sans-serif";
  ctx.fillText("Scan QR code or click link to verify", qrTextX, qrBoxY + 58);
  ctx.fillText("authentic student credentials.", qrTextX, qrBoxY + 75);

  ctx.fillStyle = "#e01e5a";
  ctx.font = "bold 11px monospace";
  ctx.fillText("kr8digitals.com/verify", qrTextX, qrBoxY + 102);

  ctx.restore();

  return canvas.toDataURL("image/png");
}

export interface PlatformShareData {
  verifyUrl: string;
  homeUrl: string;
  shareText: string;
  platformMessages: {
    linkedin: string;
    twitter: string;
    whatsapp: string;
    facebook: string;
    telegram: string;
    emailSubject: string;
    emailBody: string;
  };
  whatsapp: string;
  twitter: string;
  linkedin: string;
  facebook: string;
  telegram: string;
  email: string;
}

/**
 * Build intelligent, platform-specific social media sharing links & messages.
 * Directly links back to KR8 DIGITALS and the authentic student verification portal.
 */
export function buildSocialShareLinks({
  student,
  cert,
  origin,
}: {
  student: Account;
  cert: CertificateRecord;
  origin?: string;
}): PlatformShareData {
  const baseOrigin =
    origin || (typeof window !== "undefined" ? window.location.origin : "https://kr8digitals.com");
  const verifyUrl = `${baseOrigin}/verify?id=${encodeURIComponent(student.id)}&cert=${encodeURIComponent(cert.id)}`;
  const homeUrl = `${baseOrigin}/`;
  const skill = cert.skillName || "Digital Skills";
  const studentName = student.name || "Graduate";
  const tier = cert.tier || "Completion";

  // 1. Intelligent LinkedIn copy (professional, in-depth, industry-focused)
  const linkedinMessage = `🎓 Thrilled to announce that I have officially graduated and earned my verified Certificate of ${tier} in ${skill} from KR8 Digitals!

During this intensive hands-on program at KR8 Digitals, I developed practical skills, delivered real-world cohort projects, and met rigorous creative standards.

You can view my verified certificate and credential record on the KR8 Digitals portal here:
${verifyUrl}

Special thanks to the KR8 Digitals mentors, coaches, and creative community for an unforgettable journey! 🚀

#KR8Digitals #CreativeTalent #DigitalSkills #${skill.replace(/[^a-zA-Z0-9]/g, "")} #ProfessionalGrowth #TechEducation`;

  // 2. Intelligent X / Twitter copy (punchy, high-engagement, tagged)
  const twitterMessage = `🎓 Proud to announce that I have officially graduated with a verified Certificate of ${tier} in ${skill} from @KR8Digitals!

Verify my credentials & portfolio: ${verifyUrl}

#KR8Digitals #CreativeSkills #Graduation #TechTalent`;

  // 3. Intelligent WhatsApp copy (conversational, warm, direct)
  const whatsappMessage = `🎓 *Exciting News!* 
I just officially completed my program and earned my verified *Certificate of ${tier} in ${skill}* from *KR8 Digitals*!

Check out my official verification record and certificate here:
👉 ${verifyUrl}

Learn more about KR8 Digitals:
🌐 ${homeUrl}`;

  // 4. Facebook copy
  const facebookMessage = `🎓 Proud to graduate from KR8 Digitals with a verified Certificate of ${tier} in ${skill}! Check out my official credentials on the KR8 verification portal: ${verifyUrl}`;

  // 5. Telegram copy
  const telegramMessage = `🎓 I just officially graduated with a verified Certificate of ${tier} in ${skill} from KR8 Digitals! Check out my official credentials: ${verifyUrl}`;

  // 6. Email copy
  const emailSubject = `Official Verification: Certificate of ${tier} - ${studentName} (${skill})`;
  const emailBody = `Hello,

I am pleased to share that I have officially graduated from KR8 Digitals and received my Certificate of ${tier} in ${skill}.

You can verify the authentic certificate, track completion, and credential validity on the official KR8 Digitals verification portal:
${verifyUrl}

Student ID: ${student.id}
Certificate Ref: ${cert.id}
Institution: KR8 Digitals (${homeUrl})

Best regards,
${studentName}`;

  return {
    verifyUrl,
    homeUrl,
    shareText: whatsappMessage,
    platformMessages: {
      linkedin: linkedinMessage,
      twitter: twitterMessage,
      whatsapp: whatsappMessage,
      facebook: facebookMessage,
      telegram: telegramMessage,
      emailSubject,
      emailBody,
    },
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterMessage)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verifyUrl)}&quote=${encodeURIComponent(facebookMessage)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(verifyUrl)}&text=${encodeURIComponent(telegramMessage)}`,
    email: `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`,
  };
}
