/**
 * Mindset Shift — dynamic event system (KR8 Digitals)
 *
 * Single source of truth for every Mindset Shift edition.
 * - Event config (title, theme, date, speaker, host, WhatsApp link, share
 *   copy, registration settings) is ADMIN-MANAGED via the Admin Dashboard
 *   and drives the live public /mindset-shift page — no static duplicates.
 * - Registrations are stored locally (refresh/crash-safe for the
 *   participant) AND synced to the shared Supabase table
 *   `mindset_shift_registrations` so administrators can review and verify
 *   share proofs from any device.
 *
 * Designed for future editions (8.0, 9.0, new themes/speakers/flyers):
 * all edition-specific data lives in this module's records, keyed by
 * `edition`, not in page code.
 */
import { normalizeEmail, normalizePhone } from "./store";

/* ------------------------------------------------------------------ */
/* Event configuration                                                */
/* ------------------------------------------------------------------ */

export interface MsTopic {
  title: string;
  text: string;
  icon: string;
}

export interface MsEventConfig {
  edition: string; // "7.0"
  programName: string; // "Mindset Shift"
  theme: string; // "BUILDING WEALTH"
  subtitle: string; // "How To Get Out Of Debt And Build Wealth."
  dateLabel: string; // "4th October 2026"
  timeLabel: string; // "9PM"
  locationLabel: string; // "kr8digitals.com"
  locationUrl: string;
  registrationFree: boolean;
  regOpen: boolean;
  regDeadlineLabel: string; // shown while regOpen; "" hides
  capacity: number; // 0 = unlimited
  flyer: string; // public path or "idb:" media-vault key
  speaker: {
    name: string;
    role: string;
    tagline: string;
    bio: string;
    credentials: string[];
    photo: string;
  };
  host: {
    name: string;
    role: string;
    bio: string;
    photo: string; // public path or "idb:" media-vault key
  };
  storyIntro: string;
  storyPoints: { title: string; text: string }[];
  topics: MsTopic[];
  audience: string[];
  expectations: string[];
  shareCopy: {
    whatsappStatus: string;
    facebook: string;
    instagram: string;
    x: string;
    linkedin: string;
    general: string;
  };
  whatsappGroupUrl: string; // ADMIN-MANAGED — never hard-coded in pages
  accessEnabled: boolean;
  privacyNote: string;
  seoTitle: string;
  seoDescription: string;
  startDate: string; // ISO 8601 — schema.org Event structured data ("" = omit)
}

const EVENT_KEY = "kr8_mindset_shift_event_v1";

/* All seeded values come from the official flyer, Sagacious Tehilla's
 * public website, and the verified KR8 founder record. No invented facts. */
export const DEFAULT_MS_EVENT: MsEventConfig = {
  edition: "7.0",
  programName: "Mindset Shift",
  theme: "BUILDING WEALTH",
  subtitle: "How To Get Out Of Debt And Build Wealth.",
  dateLabel: "4th October 2026",
  timeLabel: "9PM",
  locationLabel: "kr8digitals.com",
  locationUrl: "https://kr8digitals.com/mindset-shift",
  registrationFree: true,
  regOpen: true,
  regDeadlineLabel: "",
  capacity: 0,
  flyer: "/events/mindset-shift-7-flyer.jpg",
  speaker: {
    name: "Sagacious Tehilla",
    role: "Guest Speaker",
    tagline: "Psychology-Driven Marketing Strategist · Copywriter · Business Growth Consultant",
    bio: "Sagacious Tehilla is a psychology-driven marketing strategist, copywriter, author, and entrepreneur. His work sits at the intersection of psychology, persuasion, branding, and business growth — built on the idea that people don't buy products, they buy what their minds have already decided to believe. He has worked with founders, CEOs, business owners, agencies, personal brands, organizations, politicians, and celebrities, and his campaigns and systems have helped businesses sell thousands of digital products and generate millions in revenue. His Brain Seduction™ framework maps how attention, trust, desire, and buying decisions form before a person ever says yes.",
    credentials: [
      "Author of six published works, including Brain Seduction, Subconscious Marketing, Expert Visibility and The Fake Life Detector",
      "Creator of the Brain Seduction™ and Subconscious Marketing™ frameworks",
      "Speaks on marketing psychology, consumer behaviour, brand positioning, sales, customer trust, digital business, personal branding, and business growth",
      "Worked with founders, CEOs, startups, agencies, organizations, politicians, and celebrities",
    ],
    photo: "/events/sagacious-tehilla.png",
  },
  host: {
    name: "Timfire (Kenneth Timothy)",
    role: "Host · Founder, KR8 Digitals",
    bio: "Timfire — Kenneth Timothy Iziogo — is the founder and CEO of KR8 Digitals, the creator behind the Mindset Shift program. Mindset Shift is a recurring conversation series held twice every month — the first Sunday and the third Sunday — built for people ready to rethink how they think about money, business, and the future they are building. Timfire creates the environment; the conversation does the work.",
    photo: "/founder_timfire.jpg",
  },
  storyIntro:
    "Most people are not broke because they earn too little. They are stuck because of how money moves through their thinking. Income without a system is a treadmill: more hours, more stress, and the same number at the end of the month. Debt is not only a number on a statement — it is a daily tax on your attention, your choices, and your peace of mind. This conversation is about what happens when you step back and look at the whole picture: the beliefs, habits, and decisions that quietly decide whether money flows past you or stays with you long enough to become wealth.",
  storyPoints: [
    {
      title: "Earning Is Not Wealth",
      text: "A high income and a strong balance sheet are two different things. We look at why so many high earners stay financially fragile — and what separates income from wealth you can actually build on.",
    },
    {
      title: "Debt Changes How You Decide",
      text: "When debt is running the background of your life, every financial decision is made under pressure. We explore how to think about debt, obligations, and repayment with clarity instead of panic.",
    },
    {
      title: "Mindset Is Infrastructure",
      text: "Your beliefs about money were installed long before you understood money. Some of them serve you. Some of them are running your life without your consent. You can inspect them — and replace the ones that cost you.",
    },
    {
      title: "Wealth Is Built Intentionally",
      text: "Wealth is rarely an accident of a big payday. It is a sequence of deliberate decisions — about spending, saving, investing, and value creation — made consistently over time. This conversation is about designing that sequence.",
    },
  ],
  topics: [
    {
      icon: "chart",
      title: "Understanding Your Relationship With Money",
      text: "Which beliefs, habits, and decisions are quietly steering the way you earn, spend, save, invest, and manage money — and how to see them clearly.",
    },
    {
      icon: "unlock",
      title: "Getting Out of Debt",
      text: "How to think intentionally about debt and financial obligations — repayment strategies, rebuilding stability, and breaking the cycle that keeps pulling you back.",
    },
    {
      icon: "trophy",
      title: "Building Wealth",
      text: "Moving beyond the idea that wealth is simply a high income: wealth-building principles, financial discipline, value creation, and long-term thinking.",
    },
    {
      icon: "spark",
      title: "Money Philosophy",
      text: "Examining the beliefs you inherited about money — where they came from, which ones still serve you, and how to build a philosophy that works in your favour.",
    },
    {
      icon: "check",
      title: "Making Better Financial Decisions",
      text: "Choosing from clarity instead of emotion, pressure, or appearances. Practical ways to slow down, think through the real cost of a decision, and act with confidence.",
    },
  ],
  audience: [
    "You want to understand money better — beyond the basics",
    "You are currently dealing with debt and want a clearer path out",
    "You earn well but struggle to retain what you make",
    "You want to build wealth over time, not just chase income",
    "You are ready to rethink your relationship with money",
    "You want to improve your daily financial habits",
    "You are interested in business and personal growth",
    "You want practical perspectives on wealth-building you can actually use",
  ],
  expectations: [
    "A straight, no-hype conversation on debt, money mindset, and wealth-building",
    "Practical frameworks you can apply the week after the event",
    "The chance to ask your own money questions into the open",
    "A free registration — your only cost is showing up with an open mind",
  ],
  shareCopy: {
    whatsappStatus:
      "Mindset Shift 7.0 is this Sunday, 4th October, 9PM at kr8digitals.com.\n\nThis one is different: BUILDING WEALTH — How To Get Out Of Debt And Build Wealth, with guest speaker Sagacious Tehilla (psychology-driven marketing strategist & author), hosted by Timfire.\n\nFree to register. 👉 kr8digitals.com/mindset-shift",
    facebook:
      "Most people are not broke because they earn too little. They are stuck because of how money moves through their thinking.\n\nThat is exactly what Mindset Shift 7.0 is about.\n\n📅 4th October 2026 · 9PM\n📍 kr8digitals.com\n🎙 Guest speaker: Sagacious Tehilla — psychology-driven marketing strategist, copywriter & author of Brain Seduction and five other works\n🎙 Host: Timfire (Kenneth Timothy), Founder of KR8 Digitals\n\nTheme: BUILDING WEALTH — How To Get Out Of Debt And Build Wealth.\n\nRegistration is free.\n👉 kr8digitals.com/mindset-shift\n\nTag someone who needs this conversation.",
    instagram:
      "Mindset Shift 7.0 🧠💸\n\nBUILDING WEALTH: How To Get Out Of Debt And Build Wealth.\n\nGuest speaker: Sagacious Tehilla — psychology-driven marketing strategist & author. Host: Timfire, KR8 Digitals.\n\n4th October · 9PM · kr8digitals.com\nFree registration.\nLink in bio 👆\n\n#MindsetShift #BuildingWealth #DebtFree #WealthBuilding #KR8Digitals #MoneyMindset",
    x:
      "Income without a system is a treadmill.\n\nMindset Shift 7.0 — BUILDING WEALTH: How To Get Out Of Debt And Build Wealth.\n\nSagacious Tehilla (marketing psychologist & author) on stage with Timfire (KR8 Digitals).\n\nSun, 4 Oct · 9PM · kr8digitals.com\nFree registration → kr8digitals.com/mindset-shift",
    linkedin:
      "Wealth is rarely an accident of a big payday. It is a sequence of deliberate decisions — about spending, saving, investing, and value creation — made consistently over time.\n\nJoin Mindset Shift 7.0 on 4th October at 9PM (kr8digitals.com) as Sagacious Tehilla, psychology-driven marketing strategist and author, explores BUILDING WEALTH: how to get out of debt and build wealth — hosted by Timfire, Founder of KR8 Digitals.\n\nRegistration is free: kr8digitals.com/mindset-shift",
    general:
      "Mindset Shift 7.0 — BUILDING WEALTH: How To Get Out Of Debt And Build Wealth.\n\nGuest speaker: Sagacious Tehilla · Host: Timfire (KR8 Digitals)\n4th October 2026 · 9PM · kr8digitals.com\n\nRegistration is free: kr8digitals.com/mindset-shift",
  },
  whatsappGroupUrl: "",
  accessEnabled: true,
  privacyNote:
    "Your registration details and financial reflections are private. They are used only to make the event conversation more relevant — they are never published, shared publicly, or shown on your profile.",
  seoTitle: "Mindset Shift 7.0 — Building Wealth | KR8 Digitals",
  startDate: "2026-10-04T21:00:00+01:00",
  seoDescription:
    "Mindset Shift 7.0: BUILDING WEALTH — How To Get Out Of Debt And Build Wealth. Free event with guest speaker Sagacious Tehilla, hosted by Timfire. 4th October 2026, 9PM, at kr8digitals.com. Register free.",
};

function loadMsEvent(): MsEventConfig {
  try {
    const raw =
      typeof localStorage !== "undefined" ? localStorage.getItem(EVENT_KEY) : null;
    if (!raw) return DEFAULT_MS_EVENT;
    const stored = JSON.parse(raw) as Partial<MsEventConfig>;
    // Deep-merge over defaults so new fields added in future updates never
    // leave older devices with undefined values.
    return {
      ...DEFAULT_MS_EVENT,
      ...stored,
      speaker: { ...DEFAULT_MS_EVENT.speaker, ...(stored.speaker || {}) },
      host: { ...DEFAULT_MS_EVENT.host, ...(stored.host || {}) },
      shareCopy: { ...DEFAULT_MS_EVENT.shareCopy, ...(stored.shareCopy || {}) },
      storyPoints: Array.isArray(stored.storyPoints) ? stored.storyPoints : DEFAULT_MS_EVENT.storyPoints,
      topics: Array.isArray(stored.topics) ? stored.topics : DEFAULT_MS_EVENT.topics,
      audience: Array.isArray(stored.audience) ? stored.audience : DEFAULT_MS_EVENT.audience,
      expectations: Array.isArray(stored.expectations) ? stored.expectations : DEFAULT_MS_EVENT.expectations,
    };
  } catch {
    return DEFAULT_MS_EVENT;
  }
}

export function getMsEvent(): MsEventConfig {
  return loadMsEvent();
}

export function saveMsEvent(patch: Partial<MsEventConfig>): MsEventConfig {
  const next = { ...loadMsEvent(), ...patch };
  try {
    localStorage.setItem(EVENT_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn("Mindset Shift event save failed:", err);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:ms-event-updated"));
    window.dispatchEvent(new Event("storage"));
  }
  return next;
}

export function resetMsEvent(): MsEventConfig {
  try {
    localStorage.removeItem(EVENT_KEY);
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:ms-event-updated"));
    window.dispatchEvent(new Event("storage"));
  }
  return DEFAULT_MS_EVENT;
}

/* ------------------------------------------------------------------ */
/* Registrations                                                      */
/* ------------------------------------------------------------------ */

export type MsRegStatus =
  | "registered" // just registered, sharing not yet proven
  | "share_submitted" // proof uploaded, awaiting admin review
  | "access_granted" // verified — WhatsApp access unlocked
  | "rejected" // proof rejected (final)
  | "needs_resubmission"; // admin asked for a new screenshot

export const MS_STATUS_LABELS: Record<MsRegStatus, string> = {
  registered: "Registered",
  share_submitted: "Awaiting Share Verification",
  access_granted: "Access Granted",
  rejected: "Rejected",
  needs_resubmission: "Needs Resubmission",
};

export interface MsRegistration {
  id: string; // confirmation code, e.g. MS7-K3F9QZ
  edition: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string; // "" if same as phone
  location: string;
  heardAbout: string;
  hopingToLearn: string;
  moneyQuestion: string;
  biggestChallenge: string;
  debtExperience: string; // enum-style option label
  financialSituation: string; // range/option label (never exact figures)
  hasFinancialGoal: boolean;
  areaToImprove: string;
  status: MsRegStatus;
  proofKey: string | null; // "idb:" media-vault key (local copy)
  proofData: string | null; // base64 data URL (synced to cloud)
  proofSubmittedAt: number | null;
  adminNote: string; // internal — admin visible only
  verifiedBy: string | null;
  verifiedAt: number | null;
  createdAt: number;
  updatedAt: number;
  syncPending: boolean; // true until successfully pushed to Supabase
  deletedAt: number | null; // tombstone — soft-deleted, hidden everywhere
}

const REGS_KEY = "kr8_mindset_shift_registrations_v1";

function loadRegs(): MsRegistration[] {
  try {
    const raw =
      typeof localStorage !== "undefined" ? localStorage.getItem(REGS_KEY) : null;
    return raw ? (JSON.parse(raw) as MsRegistration[]) : [];
  } catch {
    return [];
  }
}

/** Rows that are not soft-deleted. Every consumer (admin, public page,
 *  dedupe, stats) sees only these. */
function activeRegs(regs: MsRegistration[]): MsRegistration[] {
  return regs.filter((r) => !r.deletedAt);
}

export function getMsRegistrations(): MsRegistration[] {
  return activeRegs(loadRegs());
}

/** Sync-layer only: includes tombstones so deletions are pushed to the
 *  cloud and applied on other devices instead of resurrecting. */
export function getAllMsRegistrations(): MsRegistration[] {
  return loadRegs();
}

function saveRegs(regs: MsRegistration[]) {
  try {
    localStorage.setItem(REGS_KEY, JSON.stringify(regs));
  } catch (err) {
    console.warn("Mindset Shift registrations save failed:", err);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:ms-regs-updated"));
    window.dispatchEvent(new Event("storage"));
  }
}

function normEmail(v: string): string {
  return normalizeEmail(v);
}
function normPhone(v: string): string {
  // Canonical app-wide normalization (store.ts): "0801 234 5678" and
  // "+234 801 234 5678" resolve to the same key → no duplicate registrations.
  return normalizePhone(v);
}

export function generateMsId(edition: string): string {
  // Integer part only: edition "7.0" → "MS7-…" (not "MS70").
  const e = edition.split(".")[0] || edition.replace(/[^\d]/g, "");
  const rand = (Math.random().toString(36) + "000000").slice(2, 8).toUpperCase();
  return `MS${e}-${Date.now().toString(36).toUpperCase().slice(-4)}${rand}`;
}

export interface MsRegisterInput {
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  heardAbout: string;
  hopingToLearn: string;
  moneyQuestion: string;
  biggestChallenge: string;
  debtExperience: string;
  financialSituation: string;
  hasFinancialGoal: boolean;
  areaToImprove: string;
}

/**
 * Register (or resume an existing registration).
 * Dedupe: same edition + same normalized email OR phone → existing record.
 * A participant who refreshes / returns later never gets a duplicate.
 */
export function registerForMsEvent(
  input: MsRegisterInput
): { registration: MsRegistration; existing: boolean } {
  const regs = loadRegs();
  const edition = loadMsEvent().edition;
  const email = normEmail(input.email);
  const phone = normPhone(input.phone);

  const found = activeRegs(regs).find(
    (r) =>
      r.edition === edition &&
      ((email && normEmail(r.email) === email) ||
        (phone.length >= 7 && normPhone(r.phone) === phone))
  );

  if (found) {
    return { registration: found, existing: true };
  }

  const now = Date.now();
  const registration: MsRegistration = {
    id: generateMsId(edition),
    edition,
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    // Store the CANONICAL phone ("+2348012345678") so every device, the
    // admin panel, and the cloud row all compare/look up identically.
    phone: input.phone.trim() ? normalizePhone(input.phone) : "",
    whatsapp: input.whatsapp.trim() ? normalizePhone(input.whatsapp) : "",
    location: input.location.trim(),
    heardAbout: input.heardAbout.trim(),
    hopingToLearn: input.hopingToLearn.trim(),
    moneyQuestion: input.moneyQuestion.trim(),
    biggestChallenge: input.biggestChallenge.trim(),
    debtExperience: input.debtExperience,
    financialSituation: input.financialSituation,
    hasFinancialGoal: input.hasFinancialGoal,
    areaToImprove: input.areaToImprove.trim(),
    status: "registered",
    proofKey: null,
    proofData: null,
    proofSubmittedAt: null,
    adminNote: "",
    verifiedBy: null,
    verifiedAt: null,
    createdAt: now,
    updatedAt: now,
    syncPending: true,
    deletedAt: null,
  };
  regs.push(registration);
  saveRegs(regs);
  return { registration, existing: false };
}

export function findMsRegistration(id: string): MsRegistration | undefined {
  return activeRegs(loadRegs()).find((r) => r.id === id);
}

export function updateMsRegistration(
  id: string,
  patch: Partial<MsRegistration>
): MsRegistration | undefined {
  const regs = loadRegs();
  const idx = regs.findIndex((r) => r.id === id);
  if (idx === -1 || regs[idx].deletedAt) return undefined;
  // An explicit patch.syncPending (e.g. the sync layer's post-push clear) is
  // honored; every other update marks the row pending for push.
  regs[idx] = { ...regs[idx], ...patch, updatedAt: Date.now(), syncPending: patch.syncPending !== undefined ? patch.syncPending : true };
  saveRegs(regs);
  return regs[idx];
}

/** Participant submits proof of sharing (base64 data URL + local vault key). */
export function submitMsProof(
  id: string,
  proofKey: string,
  proofData: string
): MsRegistration | undefined {
  return updateMsRegistration(id, {
    proofKey,
    proofData,
    proofSubmittedAt: Date.now(),
    status: "share_submitted",
    adminNote: "",
    verifiedBy: null,
    verifiedAt: null,
  });
}

export type MsVerificationDecision = "approved" | "rejected" | "resubmit";

/** Admin verification action. Approval flips status to access_granted. */
export function setMsVerification(
  id: string,
  decision: MsVerificationDecision,
  adminName: string,
  note: string
): MsRegistration | undefined {
  const status: MsRegStatus =
    decision === "approved"
      ? "access_granted"
      : decision === "rejected"
        ? "rejected"
        : "needs_resubmission";
  return updateMsRegistration(id, {
    status,
    adminNote: note,
    verifiedBy: adminName,
    verifiedAt: Date.now(),
  });
}

/**
 * Admin soft-deletes a registration. The row becomes a tombstone: hidden
 * from every list, lookup, resume code, and stat — and pushed to the cloud
 * so other devices apply the deletion instead of resurrecting the row.
 */
export function deleteMsRegistration(id: string): MsRegistration | undefined {
  const regs = loadRegs();
  const idx = regs.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  if (regs[idx].deletedAt) return regs[idx];
  regs[idx] = { ...regs[idx], deletedAt: Date.now(), updatedAt: Date.now(), syncPending: true };
  saveRegs(regs);
  return regs[idx];
}

/**
 * Admin revokes previously granted WhatsApp access. The participant moves
 * back to the share-verification step and must earn access again. The note
 * records who revoked and why (internal, admin-visible only).
 */
export function revokeMsAccess(
  id: string,
  adminName: string,
  note: string
): MsRegistration | undefined {
  return updateMsRegistration(id, {
    status: "registered",
    adminNote: note.trim()
      ? `${note.trim()} — access revoked`
      : "Access revoked by admin.",
    verifiedBy: adminName,
    verifiedAt: Date.now(),
  });
}

export function hasMsAccess(reg: MsRegistration | undefined): boolean {
  if (!reg) return false;
  const ev = loadMsEvent();
  return reg.status === "access_granted" && ev.accessEnabled && !!ev.whatsappGroupUrl;
}

/** The access code a participant uses to resume their flow after leaving. */
export function findByResumeCode(code: string): MsRegistration | undefined {
  const c = (code || "").trim().toUpperCase();
  if (!c) return undefined;
  return activeRegs(loadRegs()).find((r) => r.id.toUpperCase() === c);
}

/* ------------------------------------------------------------------ */
/* Analytics (admin)                                                  */
/* ------------------------------------------------------------------ */

export interface MsStats {
  total: number;
  byStatus: Record<MsRegStatus, number>;
  bySource: Record<string, number>;
  daily: { day: string; count: number }[]; // last 14 days
  grantedAccess: number;
}

export function getMsStats(): MsStats {
  const regs = activeRegs(loadRegs()).filter((r) => r.edition === loadMsEvent().edition);
  const byStatus: Record<MsRegStatus, number> = {
    registered: 0,
    share_submitted: 0,
    access_granted: 0,
    rejected: 0,
    needs_resubmission: 0,
  };
  const bySource: Record<string, number> = {};
  for (const r of regs) {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    const src = r.heardAbout || "Not specified";
    bySource[src] = (bySource[src] || 0) + 1;
  }
  const daily: { day: string; count: number }[] = [];
  // Local-date buckets (Lagos, not UTC) so "today" means the participant's
  // actual day wherever the admin is.
  const localDayKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = localDayKey(d);
    const count = regs.filter((r) => localDayKey(new Date(r.createdAt)) === key).length;
    daily.push({ day: key, count });
  }
  return {
    total: regs.length,
    byStatus,
    bySource,
    daily,
    grantedAccess: byStatus.access_granted,
  };
}

/* ------------------------------------------------------------------ */
/* Supabase schema (admin runs via Cloud Sync → Copy SQL)             */
/* ------------------------------------------------------------------ */

export const MS_SUPABASE_SQL = `
-- Mindset Shift event tables (KR8 Digitals)
create table if not exists public.mindset_shift_registrations (
  id text primary key,
  edition text not null default '7.0',
  full_name text not null,
  email text not null,
  phone text not null,
  whatsapp text,
  location text,
  heard_about text,
  hoping_to_learn text,
  money_question text,
  biggest_challenge text,
  debt_experience text,
  financial_situation text,
  has_financial_goal boolean default false,
  area_to_improve text,
  status text not null default 'registered',
  proof_data text,
  proof_submitted_at bigint,
  admin_note text,
  verified_by text,
  verified_at bigint,
  created_at bigint not null,
  updated_at bigint not null,
  deleted_at bigint
);

-- Migration for tables created before soft-delete existed
alter table public.mindset_shift_registrations add column if not exists deleted_at bigint;

create table if not exists public.mindset_shift_event (
  id text primary key,
  edition text not null,
  config jsonb not null,
  updated_at bigint not null
);

alter publication supabase_realtime add table public.mindset_shift_registrations;
alter publication supabase_realtime add table public.mindset_shift_event;
`;
