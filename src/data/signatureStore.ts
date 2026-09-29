/**
 * KR8 Digitals — Coach & Administrator Signatures Architecture
 * Maps skills to coaches and their verified digital signatures.
 * Enables dynamic signature management from the Admin Dashboard for current and future skills.
 */

export interface SignatureRecord {
  id: string;
  role: "coach" | "admin";
  skillKey?: string; // normalized skill key e.g. "graphic", "video", "web", "content_creation", "frontend", etc.
  coachName: string;
  title: string;
  signatureUrl: string;
  updatedAt: string;
}

export const DEFAULT_SIGNATURES: SignatureRecord[] = [
  {
    id: "sig_admin",
    role: "admin",
    coachName: "Kenneth Timothy Iziogo (Timfire)",
    title: "Executive Director / Lead Administrator",
    signatureUrl: "/signatures/admin_signature.png",
    updatedAt: "2026-09-26T00:00:00.000Z",
  },
  {
    id: "sig_graphic",
    role: "coach",
    skillKey: "graphic",
    coachName: "Graphic Design Coach",
    title: "Lead Graphic Design & Visual Identity Coach",
    signatureUrl: "/signatures/graphic_design_coach_signature.png",
    updatedAt: "2026-09-26T00:00:00.000Z",
  },
  {
    id: "sig_video",
    role: "coach",
    skillKey: "video",
    coachName: "Video Editing Coach",
    title: "Lead Video Editing & Motion Animation Coach",
    signatureUrl: "/signatures/video_editing_coach_signature.png",
    updatedAt: "2026-09-26T00:00:00.000Z",
  },
  {
    id: "sig_web",
    role: "coach",
    skillKey: "web",
    coachName: "Website Development Coach",
    title: "Lead WordPress & Web Systems Coach",
    signatureUrl: "/signatures/web_dev_coach_signature.png",
    updatedAt: "2026-09-26T00:00:00.000Z",
  },
  {
    id: "sig_content",
    role: "coach",
    skillKey: "content_creation",
    coachName: "Content Creation Coach",
    title: "Lead Content Creation & Brand Strategy Coach",
    signatureUrl: "/signatures/content_creation_coach_signature.png",
    updatedAt: "2026-09-26T00:00:00.000Z",
  },
  {
    id: "sig_frontend",
    role: "coach",
    skillKey: "frontend",
    coachName: "Nonye Mercy",
    title: "Lead Front-End Development Instructor",
    signatureUrl: "/signatures/web_dev_coach_signature.png",
    updatedAt: "2026-09-26T00:00:00.000Z",
  },
];

const SIGNATURES_STORAGE_KEY = "kr8_signatures_v1";

let memorySignatures: SignatureRecord[] | null = null;

export function getSignatures(): SignatureRecord[] {
  if (memorySignatures) return memorySignatures;
  if (typeof window === "undefined") return DEFAULT_SIGNATURES;

  try {
    const raw = localStorage.getItem(SIGNATURES_STORAGE_KEY);
    if (!raw) {
      memorySignatures = DEFAULT_SIGNATURES;
      return memorySignatures;
    }
    const parsed = JSON.parse(raw) as SignatureRecord[];
    // Ensure admin signature exists
    const hasAdmin = parsed.some((s) => s.role === "admin");
    if (!hasAdmin) {
      parsed.unshift(DEFAULT_SIGNATURES[0]);
    }
    memorySignatures = parsed;
    return memorySignatures;
  } catch {
    memorySignatures = DEFAULT_SIGNATURES;
    return memorySignatures;
  }
}

function persistSignatures(records: SignatureRecord[]): void {
  memorySignatures = records;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SIGNATURES_STORAGE_KEY, JSON.stringify(records));
      window.dispatchEvent(new Event("kr8:signatures-updated"));
    } catch (e) {
      console.warn("Could not save signatures to localStorage:", e);
    }
  }
}

export function normalizeSkill(skill: string): string {
  const s = (skill || "").toLowerCase().trim();
  if (s.includes("graphic")) return "graphic";
  if (s.includes("video")) return "video";
  if (s.includes("frontend") || s.includes("front-end")) return "frontend";
  if (s.includes("web") || s.includes("wordpress")) return "web";
  if (s.includes("content") || s.includes("social") || s.includes("smm")) return "content_creation";
  if (s.includes("ui") || s.includes("ux")) return "uiux";
  return s.replace(/[^a-z0-9_]/g, "_");
}

export function getCoachSignatureForSkill(skillKey: string): SignatureRecord {
  const norm = normalizeSkill(skillKey);
  const all = getSignatures();
  const found = all.find((s) => s.role === "coach" && s.skillKey === norm);
  if (found) return found;

  // Fallback to graphic or first coach signature if no custom signature exists yet
  const fallback = all.find((s) => s.role === "coach") || DEFAULT_SIGNATURES[1];
  return fallback;
}

export function getAdminSignature(): SignatureRecord {
  const all = getSignatures();
  const found = all.find((s) => s.role === "admin");
  return found || DEFAULT_SIGNATURES[0];
}

export function saveSignature(
  record: Omit<SignatureRecord, "id" | "updatedAt"> & { id?: string }
): SignatureRecord {
  const all = getSignatures();
  const id = record.id || "sig_" + Date.now().toString(36);
  const updatedRecord: SignatureRecord = {
    ...record,
    id,
    skillKey: record.role === "coach" && record.skillKey ? normalizeSkill(record.skillKey) : undefined,
    updatedAt: new Date().toISOString(),
  };

  const existingIdx = all.findIndex((s) => s.id === id);
  let updatedList: SignatureRecord[];
  if (existingIdx >= 0) {
    updatedList = [...all];
    updatedList[existingIdx] = updatedRecord;
  } else {
    updatedList = [updatedRecord, ...all];
  }

  persistSignatures(updatedList);
  return updatedRecord;
}

export function deleteSignature(id: string): void {
  // Prevent deleting administrator signature
  const all = getSignatures();
  const target = all.find((s) => s.id === id);
  if (target?.role === "admin") {
    throw new Error("The Administrator Signature cannot be deleted. You can edit/replace it instead.");
  }
  const filtered = all.filter((s) => s.id !== id);
  persistSignatures(filtered);
}

export function resetSignaturesToDefault(): void {
  persistSignatures(DEFAULT_SIGNATURES);
}
