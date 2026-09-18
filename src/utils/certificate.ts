import { PDFDocument, rgb } from "pdf-lib";
import QRCode from "qrcode";

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

export async function generateVerifyQrCode(studentId: string, origin?: string): Promise<string> {
  const baseOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "https://kr8digitals.com");
  const verifyUrl = `${baseOrigin}/verify?id=${encodeURIComponent(studentId)}`;
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

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function overlayQrOnImage(
  imageSource: File | string,
  qrDataUrl: string,
  studentId: string,
  position: CertPosition = "bottom-right"
): Promise<{ imageUrl: string; pdfBytes: Uint8Array }> {
  const imageSrc = typeof imageSource === "string" ? imageSource : await readFileAsDataUrl(imageSource);
  const [certImg, qrImg] = await Promise.all([loadImage(imageSrc), loadImage(qrDataUrl)]);

  const canvas = document.createElement("canvas");
  const width = certImg.naturalWidth || certImg.width || 1600;
  const height = certImg.naturalHeight || certImg.height || 1130;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize 2D canvas context.");

  // Draw the original certificate image
  ctx.drawImage(certImg, 0, 0, width, height);

  // Calculate QR badge sizing (approx 11% of width, bounded between 110 and 220 px)
  const qrSize = Math.max(110, Math.min(220, Math.round(width * 0.11)));
  const padding = Math.round(qrSize * 0.08);
  const captionHeight = Math.round(qrSize * 0.18);
  const cardWidth = qrSize + padding * 2;
  const cardHeight = qrSize + padding * 2 + captionHeight;
  const margin = Math.round(width * 0.035);

  let x = width - cardWidth - margin;
  if (position === "bottom-left") {
    x = margin;
  } else if (position === "bottom-center") {
    x = Math.round((width - cardWidth) / 2);
  }
  const y = height - cardHeight - margin;

  // Draw clean white rounded container with subtle border
  const cornerRadius = Math.round(cardWidth * 0.06);
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = Math.round(qrSize * 0.08);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.round(qrSize * 0.03);

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(x, y, cardWidth, cardHeight, cornerRadius);
  ctx.fill();

  ctx.restore();

  // Subtle border around card
  ctx.strokeStyle = "rgba(18, 0, 31, 0.15)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, cardWidth, cardHeight, cornerRadius);
  ctx.stroke();

  // Draw QR code image
  ctx.drawImage(qrImg, x + padding, y + padding, qrSize, qrSize);

  // Draw "Scan to Verify" label
  ctx.fillStyle = "#12001f";
  ctx.font = `bold ${Math.round(qrSize * 0.075)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SCAN TO VERIFY", x + cardWidth / 2, y + padding + qrSize + captionHeight * 0.35);

  // Draw KR8 ID label
  ctx.fillStyle = "#7a1fa8";
  ctx.font = `${Math.round(qrSize * 0.06)}px monospace`;
  ctx.fillText(studentId, x + cardWidth / 2, y + padding + qrSize + captionHeight * 0.75);

  const finalImageUrl = canvas.toDataURL("image/jpeg", 0.92);

  // Generate downloadable PDF with matching dimensions
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

  return { imageUrl: finalImageUrl, pdfBytes };
}

export async function overlayQrOnPdf(
  pdfFile: File,
  qrDataUrl: string,
  _studentId: string,
  position: CertPosition = "bottom-right"
): Promise<{ pdfBytes: Uint8Array; previewUrl: string }> {
  const arrayBuffer = await readFileAsArrayBuffer(pdfFile);
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  const page = pages[0] || pdfDoc.addPage();
  const { width, height: _height } = page.getSize();

  const qrBase64 = qrDataUrl.split(",")[1];
  const qrBytes = Uint8Array.from(atob(qrBase64), (c) => c.charCodeAt(0));
  const qrImage = await pdfDoc.embedPng(qrBytes);

  const qrSize = Math.max(70, Math.min(130, Math.round(width * 0.12)));
  const padding = Math.round(qrSize * 0.08);
  const cardWidth = qrSize + padding * 2;
  const cardHeight = qrSize + padding * 2;
  const margin = Math.round(width * 0.04);

  let x = width - cardWidth - margin;
  if (position === "bottom-left") {
    x = margin;
  } else if (position === "bottom-center") {
    x = Math.round((width - cardWidth) / 2);
  }
  const y = margin; // In PDF, y=0 is bottom

  // White backing rectangle for QR code
  page.drawRectangle({
    x,
    y,
    width: cardWidth,
    height: cardHeight,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });

  page.drawImage(qrImage, {
    x: x + padding,
    y: y + padding,
    width: qrSize,
    height: qrSize,
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const previewUrl = URL.createObjectURL(blob);

  return { pdfBytes, previewUrl };
}

export async function processGraduationCertificate(
  file: File,
  studentId: string,
  origin?: string,
  position: CertPosition = "bottom-right"
): Promise<{
  fileType: "image" | "pdf";
  imageUrl: string;
  pdfBytes: Uint8Array;
}> {
  const qrDataUrl = await generateVerifyQrCode(studentId, origin);

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const { pdfBytes, previewUrl } = await overlayQrOnPdf(file, qrDataUrl, studentId, position);
    return {
      fileType: "pdf",
      imageUrl: previewUrl,
      pdfBytes,
    };
  }

  // Otherwise treat as image
  const { imageUrl, pdfBytes } = await overlayQrOnImage(file, qrDataUrl, studentId, position);
  return {
    fileType: "image",
    imageUrl,
    pdfBytes,
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
