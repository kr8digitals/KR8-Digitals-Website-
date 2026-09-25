import { PDFDocument } from "pdf-lib";
import QRCode from "qrcode";
import { getCertificateTemplate, type CertificateTier } from "../data/certificateTemplates";
import type { Account } from "../data/store";

const DB_NAME = "kr8_certs_db_v1";
const STORE_NAME = "certificates";

function openDb(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
          request.result.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export type CertPosition = "bottom-right" | "bottom-left" | "bottom-center";

/**
 * Format student name according to KR8 Digitals standards:
 * - ALL CAPS
 * - First name & last name preserved fully
 * - Middle name(s) abbreviated with initial when 3 or more names exist or length > 22
 * e.g. "John Thomas Theophilus" -> "JOHN T. THEOPHILUS"
 */
export function formatCertificateStudentName(rawName: string): string {
  if (!rawName) return "";
  const parts = rawName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return parts[0]?.toUpperCase() || "";
  }
  if (parts.length === 2) {
    return `${parts[0]} ${parts[1]}`.toUpperCase();
  }

  // 3 or more parts: first and last name fully written, middle name(s) abbreviated with initial
  // e.g. "John Thomas Theophilus" -> "JOHN T. THEOPHILUS"
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const middleInitials = parts
    .slice(1, parts.length - 1)
    .map((m) => `${m[0].toUpperCase()}.`)
    .join(" ");

  return `${firstName.toUpperCase()} ${middleInitials} ${lastName.toUpperCase()}`;
}

export async function generateVerifyQrCode(verifyUrl: string): Promise<string> {
  return QRCode.toDataURL(verifyUrl, {
    width: 320,
    margin: 1,
    color: {
      dark: "#12001f",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load certificate template image: ${src} (${e})`));
    img.src = src;
  });
}

let fontLoadedPromise: Promise<boolean> | null = null;
export async function ensureEncodeSansFont(): Promise<boolean> {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (fontLoadedPromise) return fontLoadedPromise;

  fontLoadedPromise = (async () => {
    try {
      if (document.fonts.check('bold 16px "Encode Sans"')) {
        return true;
      }
      const font = new FontFace("Encode Sans", "url(/fonts/EncodeSans-Bold.ttf)", {
        weight: "700",
        style: "normal",
      });
      const loaded = await font.load();
      document.fonts.add(loaded);
      await document.fonts.ready;
      return true;
    } catch (err) {
      console.warn("Could not load Encode Sans local TTF font, falling back to CSS:", err);
      return false;
    }
  })();

  return fontLoadedPromise;
}

export interface DynamicDescriptionParams {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  courseName: string;
  achievementText: string;
}

/**
 * Renders dynamic skill text on the reusable certificate template.
 * Highlights the skill name in KR8 magenta styling and prints the
 * achievement description in rich purple, centered at the standard coordinates.
 */
export function renderDynamicCertificateDescription({
  ctx,
  width,
  height,
  courseName,
  achievementText,
}: DynamicDescriptionParams) {
  const descFontSize = Math.max(18, Math.round(height * 0.027)); // ~36px at 1331h, ~57px at 2121h
  const lineHeight = Math.round(height * 0.0417); // ~55.5px at 1331h
  const centerX = Math.round(width * 0.3672); // Centered at 36.72% of canvas width
  const maxLineWidth = Math.round(width * 0.62); // Paragraph bounds

  const purpleColor = "#481650"; // Deep KR8 obsidian purple
  const magentaColor = "#C72A80"; // KR8 signature magenta highlight

  ctx.save();
  ctx.font = `bold ${descFontSize}px "Encode Sans", sans-serif`;
  ctx.textBaseline = "alphabetic";

  // Build word tokens with their respective colors
  const prefixWords = "For successfully completing a".split(/\s+/);
  const skillWords = courseName.trim().split(/\s+/);
  const suffixWords = `course with KR8 Digitals ${achievementText}`.split(/\s+/);

  const tokens: Array<{ word: string; color: string; width: number }> = [];

  for (const w of prefixWords) {
    tokens.push({ word: w, color: purpleColor, width: ctx.measureText(w).width });
  }
  for (const w of skillWords) {
    tokens.push({ word: w, color: magentaColor, width: ctx.measureText(w).width });
  }
  for (const w of suffixWords) {
    tokens.push({ word: w, color: purpleColor, width: ctx.measureText(w).width });
  }

  const spaceWidth = ctx.measureText(" ").width;

  // Wrap tokens into balanced lines
  interface LineData {
    tokens: Array<{ word: string; color: string; width: number }>;
    totalWidth: number;
  }
  const lines: LineData[] = [];
  let currentTokens: Array<{ word: string; color: string; width: number }> = [];
  let currentWidth = 0;

  for (const token of tokens) {
    const projected = currentWidth === 0 ? token.width : currentWidth + spaceWidth + token.width;
    if (projected > maxLineWidth && currentTokens.length > 0) {
      lines.push({ tokens: currentTokens, totalWidth: currentWidth });
      currentTokens = [token];
      currentWidth = token.width;
    } else {
      currentTokens.push(token);
      currentWidth = projected;
    }
  }
  if (currentTokens.length > 0) {
    lines.push({ tokens: currentTokens, totalWidth: currentWidth });
  }

  // Baseline positioning: for 3 lines, first baseline is at ~53.94% of canvas height
  let startY = Math.round(height * 0.5394);
  if (lines.length > 3) {
    startY = Math.round(height * 0.5394 - (lines.length - 3) * lineHeight * 0.4);
  }

  // Draw lines centered at centerX
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let lineX = Math.round(centerX - line.totalWidth / 2);
    const lineY = startY + i * lineHeight;

    for (const token of line.tokens) {
      ctx.fillStyle = token.color;
      ctx.fillText(token.word, lineX, lineY);
      lineX += Math.round(token.width + spaceWidth);
    }
  }

  ctx.restore();
}

export interface GeneratedCertificateResult {
  certId: string;
  imageUrl: string;
  pdfBytes: Uint8Array;
  qrCodeUrl: string;
  verifyUrl: string;
  formattedName: string;
  templateUrl: string;
  achievementText: string;
  tier: CertificateTier;
  skillKey: string;
  courseName: string;
}

/**
 * Automatically creates and generates the student's certificate:
 * - Selects the correct template for skill and tier
 * - Formats registered name in ALL CAPS using Encode Sans Bold
 * - Positions name centered above the designated baseline line
 * - Automatically generates unique QR code pointing to /verify?id=...&cert=...
 * - Draws subtle verification badge with KR8 ID and Scan to Verify
 * - Dynamically renders the skill name and description if reusable template is used
 * - Exports both crisp image and downloadable PDF
 */
export async function generateAutomaticCertificate(params: {
  student: Account;
  skillKey: string;
  tier: CertificateTier;
  courseName?: string;
  additionalNotes?: string;
  origin?: string;
  certId?: string;
}): Promise<GeneratedCertificateResult> {
  const { student, skillKey, tier, origin, courseName } = params;

  // 1. Resolve template configuration
  const config = getCertificateTemplate(skillKey, tier, courseName);
  const certId =
    params.certId ||
    `CERT-KR8-${student.id.replace(/[^A-Za-z0-9]/g, "")}-${Date.now().toString(36).toUpperCase()}`;

  const baseOrigin =
    origin || (typeof window !== "undefined" ? window.location.origin : "https://kr8digitals.com");
  const verifyUrl = `${baseOrigin}/verify?id=${encodeURIComponent(student.id)}&cert=${encodeURIComponent(certId)}`;

  // 2. Load font, template image, and QR code in parallel
  const [, certImg, qrDataUrl] = await Promise.all([
    ensureEncodeSansFont(),
    loadImage(config.templateUrl),
    generateVerifyQrCode(verifyUrl),
  ]);

  const qrImg = await loadImage(qrDataUrl);

  // 3. Initialize Canvas with native template dimensions
  const width = certImg.naturalWidth || certImg.width || 2048;
  const height = certImg.naturalHeight || certImg.height || 1331;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize 2D canvas context for certificate.");

  // Draw certificate template
  ctx.drawImage(certImg, 0, 0, width, height);

  // 4. Format & Render Student Name
  const formattedName = formatCertificateStudentName(student.name);

  // Baseline at Y = 50.7% of height, centered at X = 50.0% of width
  const centerX = Math.round(width * config.geometry.nameCenterRatioX);
  const baselineY = Math.round(height * config.geometry.nameBaselineRatioY);
  const maxAllowedWidth = Math.round(width * config.geometry.nameMaxRatioWidth);

  // Base font size: approx 3.7% of image width
  let fontSize = Math.round(width * 0.037);
  ctx.font = `bold ${fontSize}px "Encode Sans", sans-serif`;
  let textWidth = ctx.measureText(formattedName).width;

  // Auto-scale font down if name exceeds maximum line width
  while (textWidth > maxAllowedWidth && fontSize > 24) {
    fontSize -= 2;
    ctx.font = `bold ${fontSize}px "Encode Sans", sans-serif`;
    textWidth = ctx.measureText(formattedName).width;
  }

  // Draw name text
  ctx.save();
  ctx.fillStyle = "#12001f"; // Rich dark obsidian matching template text
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  // Lift above baseline so characters do not collide with the drawn line
  const textY = baselineY - Math.max(6, Math.round(fontSize * 0.12));
  ctx.fillText(formattedName, centerX, textY);
  ctx.restore();

  // 4b. Dynamic Skill Name & Description Rendering for Reusable Template
  if (config.isDynamicSkillText) {
    renderDynamicCertificateDescription({
      ctx,
      width,
      height,
      courseName: config.courseName,
      achievementText: config.achievementText,
    });
  }

  // 5. Draw QR Code Badge in Bottom-Right Corner
  const qrSize = Math.max(120, Math.min(240, Math.round(width * config.geometry.qrRatioWidth)));
  const padding = Math.round(qrSize * 0.08);
  const captionHeight = Math.round(qrSize * 0.22);
  const cardWidth = qrSize + padding * 2;
  const cardHeight = qrSize + padding * 2 + captionHeight;

  const marginX = Math.round(width * config.geometry.qrBottomRightMarginRatioX);
  const marginY = Math.round(height * config.geometry.qrBottomRightMarginRatioY);

  const qrX = width - cardWidth - marginX;
  const qrY = height - cardHeight - marginY;

  ctx.save();
  // Card Shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = Math.round(qrSize * 0.08);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.round(qrSize * 0.03);

  // Rounded White Container
  const cornerRadius = Math.round(cardWidth * 0.06);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(qrX, qrY, cardWidth, cardHeight, cornerRadius);
  ctx.fill();
  ctx.restore();

  // Card Border
  ctx.strokeStyle = "rgba(18, 0, 31, 0.16)";
  ctx.lineWidth = Math.max(1, Math.round(width * 0.001));
  ctx.beginPath();
  ctx.roundRect(qrX, qrY, cardWidth, cardHeight, cornerRadius);
  ctx.stroke();

  // Draw QR Image
  ctx.drawImage(qrImg, qrX + padding, qrY + padding, qrSize, qrSize);

  // Draw "SCAN TO VERIFY"
  ctx.fillStyle = "#12001f";
  ctx.font = `bold ${Math.round(qrSize * 0.075)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    "SCAN TO VERIFY",
    qrX + cardWidth / 2,
    qrY + padding + qrSize + captionHeight * 0.35
  );

  // Draw Student ID
  ctx.fillStyle = "#7a1fa8";
  ctx.font = `bold ${Math.round(qrSize * 0.062)}px monospace`;
  ctx.fillText(
    student.id,
    qrX + cardWidth / 2,
    qrY + padding + qrSize + captionHeight * 0.75
  );

  const finalImageUrl = canvas.toDataURL("image/jpeg", 0.94);

  // 6. Generate Downloadable PDF with Exact Dimensions
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([width, height]);
  const imgBytes = await fetch(finalImageUrl).then((r) => r.arrayBuffer());
  const embeddedImage = await pdfDoc.embedJpg(imgBytes);
  page.drawImage(embeddedImage, {
    x: 0,
    y: 0,
    width,
    height,
  });
  const pdfBytes = await pdfDoc.save();

  return {
    certId,
    imageUrl: finalImageUrl,
    pdfBytes,
    qrCodeUrl: qrDataUrl,
    verifyUrl,
    formattedName,
    templateUrl: config.templateUrl,
    achievementText: config.achievementText,
    tier,
    skillKey: config.skillKey,
    courseName: config.courseName,
  };
}

export async function saveCertificateData(
  studentId: string,
  data: { fileType: "image" | "pdf"; imageUrl: string; pdfBytes?: Uint8Array }
) {
  try {
    const db = await openDb();
    if (db) {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(data, studentId);
      await new Promise((resolve) => {
        tx.oncomplete = resolve;
      });
    }
  } catch (err) {
    console.warn("Could not write certificate to IndexedDB:", err);
  }
}

export async function getCertificateData(
  studentId: string
): Promise<{ fileType: "image" | "pdf"; imageUrl: string; pdfBytes?: Uint8Array } | null> {
  try {
    const db = await openDb();
    if (db) {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(studentId);
      return await new Promise((resolve) => {
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function processGraduationCertificate(
  _file: File,
  studentId: string,
  origin?: string,
  _position?: CertPosition
): Promise<{ fileType: "image" | "pdf"; imageUrl: string; pdfBytes: Uint8Array }> {
  const verifyUrl = `${origin || "https://kr8digitals.com"}/verify?id=${encodeURIComponent(studentId)}`;
  const qr = await generateVerifyQrCode(verifyUrl);
  return {
    fileType: "image",
    imageUrl: qr,
    pdfBytes: new Uint8Array(),
  };
}

export function downloadCertificatePdf(studentName: string, pdfBytes: Uint8Array | Blob | string) {
  let blob: Blob;
  if (pdfBytes instanceof Blob) {
    blob = pdfBytes;
  } else if (pdfBytes instanceof Uint8Array) {
    blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  } else if (typeof pdfBytes === "string" && pdfBytes.startsWith("data:")) {
    const base64 = pdfBytes.split(",")[1];
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    blob = new Blob([bytes], { type: "application/pdf" });
  } else {
    // If it's a URL, open or trigger download
    const a = document.createElement("a");
    a.href = String(pdfBytes);
    a.download = `KR8-Certificate-${studentName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `KR8-Certificate-${studentName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
