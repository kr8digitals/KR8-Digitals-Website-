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
  subtitle:
    "You're not bad with money — you were never taught. This Sunday, that changes.",
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
    role: "Guest Speaker · Author & Marketing Psychologist",
    tagline: "Author of Brain Seduction — six published works · psychology-driven strategist",
    bio: "Sagacious Tehilla is a psychology-driven marketing strategist, copywriter, author, and entrepreneur. His work sits at the intersection of psychology, persuasion, branding, and business growth — built on the idea that people don't buy products, they buy what their minds have already decided to believe. The same mechanics that decide what we buy decide how we think about money: what we're 'allowed' to want, what comfort means, what's 'our level.' His Brain Seduction™ framework maps how attention, trust, and desire form before a person ever says yes — and this conversation turns that lens on the beliefs quietly running your finances.",
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
    "Here's a scene. It's the 27th, and you open your banking app to do the math you've been avoiding all month. The number is smaller than your prayers. You close the app, and you tell yourself you'll sort it out from the 1st. You've said that before. The truth nobody says out loud: this is not a discipline problem, and it is not a moral failing. It's a belief problem. Long before you ever understood money, you absorbed rules about it — what you're 'allowed' to want, what success 'costs,' whether wealth is even meant for people like you. Those rules decide your finances before any budget ever gets the chance. This conversation is about finding those beliefs, the ones installed in you without your consent — and replacing the ones that are quietly keeping you poor.",
  storyPoints: [
    {
      title: "The Belief That Keeps You Poor",
      text: "“Money is evil.” “Rich people are lucky.” “This isn't my level.” Somewhere along the way you picked up rules about money — and none of them came with receipts. We start by finding them. Because you cannot replace a belief you can't see.",
    },
    {
      title: "Why More Money Doesn't Fix Your Money",
      text: "The 200k month that still ends at zero. The promotion that arrived with bigger bills, not a bigger cushion. Income without a system is a treadmill — and this is the conversation that shows you what actually turns earnings into wealth you can hold onto.",
    },
    {
      title: "Debt Is a Mindset With a Balance",
      text: "Debt doesn't just cost you interest. It costs you sleep, focus, and options — every single month. Here's how to look at what you owe without panic, and design a way out that you can actually live with — instead of another plan you'll abandon by Friday.",
    },
    {
      title: "The Shift Isn't Inspiration, It's Infrastructure",
      text: "Motivation fades in a week. A changed money-mindset compounds for a lifetime. You won't leave this room with a good feeling — you'll leave with a working system: the belief, the habit, and the first move.",
    },
  ],
  topics: [
    {
      icon: "spark",
      title: "Where Your Money Beliefs Came From",
      text: "Family, church, friends, your first salary — the invisible classroom that installed your money rules. We trace them back to the source, so you can audit them like the contracts they are.",
    },
    {
      icon: "unlock",
      title: "Getting Out of Debt Without Panic",
      text: "A calm, clear way to look at what you owe: what to attack first, how to keep your head when the numbers feel personal, and how to stop the cycle from quietly restarting.",
    },
    {
      icon: "chart",
      title: "From Income to Wealth",
      text: "Why a good salary can still leave you broke — and the sequence of decisions (spend, save, invest, build) that turns what you earn into something that stays.",
    },
    {
      icon: "shield",
      title: "Spending Without Shame",
      text: "The “oops” purchase. The flex you can't afford. The money you hide from the people you love. How to make money decisions from clarity — not from emotion, pressure, or appearances.",
    },
    {
      icon: "trophy",
      title: "Designing Your Next Five Years",
      text: "Leave with a plan, not a feeling: your first concrete move out of survival mode, and the one habit that protects everything else you build.",
    },
  ],
  audience: [
    "You've said “I'll start next month” — and you meant it every single time",
    "Your money runs out before your salary does, and you're tired of the juggling act",
    "You're carrying debt that feels heavier than you can say out loud",
    "You earn decently, but you can't seem to hold onto anything",
    "You've tried budgets, trackers, and “no-spend” challenges — and the numbers still win",
    "You feel quietly behind your own age, and you suspect the problem isn't your effort",
    "You want out of survival mode but don't know the first real step — this is it",
  ],
  expectations: [
    "A straight, no-hype conversation — no fake urgency, no “secret to riches,” just the psychology of money in plain language",
    "Your own answers shape the conversation — the onboarding questions tell the team exactly where to speak to you",
    "Practical next steps you can take before the week is out, not just a good feeling",
    "The edition's WhatsApp space — unlocked the moment you finish registering, no sharing required",
    "Free. Your only cost is showing up with an open mind",
  ],
  shareCopy: {
    whatsappStatus:
      "I just claimed my seat at Mindset Shift 7.0 — a free conversation on getting out of debt and building wealth. This Sunday, 9PM.\n\nIf money has been a quiet stress in your life, you should be there too. 👉 kr8digitals.com/mindset-shift",
    facebook:
      "The hardest part of being broke is never the money. It's the thinking.\n\nMindset Shift 7.0 is not another budgeting lecture. It's about the psychology of why money keeps leaving before it lands — and how to change what's running the show.\n\n📅 Sunday, 4th October · 9PM\n📍 Online — kr8digitals.com\n🎙 Sagacious Tehilla (author, six books) in conversation with Timfire (KR8 Digitals)\n\nIt's free. And honestly? I'd rather you heard it from me than from anywhere else. 👉 kr8digitals.com/mindset-shift",
    instagram:
      "You're not bad with money. You were never taught.\n\nMindset Shift 7.0 — the free conversation that changes that. Get out of debt. Build wealth. Understand why the numbers keep winning.\n\n📅 4th October · 9PM · online\n🎙 Sagacious Tehilla × Timfire (KR8 Digitals)\n\nSave the flyer, claim your seat — and send this to one person who's still stuck. Link in bio 👆\n\n#MindsetShift #BuildingWealth #DebtFree #MoneyMindset #KR8Digitals",
    x:
      "Income without a system is a treadmill.\n\nMindset Shift 7.0 — the free conversation on why money keeps leaving before it lands, and how to change the belief running the show.\n\nSagacious Tehilla (author, 6 books) × Timfire (KR8 Digitals)\n\nSun, 4 Oct · 9PM · kr8digitals.com/mindset-shift",
    linkedin:
      "Wealth is rarely an accident of a big payday. It is a sequence of deliberate decisions — and most of those decisions are made by beliefs we inherited without checking.\n\nJoin Mindset Shift 7.0 on 4th October at 9PM (kr8digitals.com) as Sagacious Tehilla, psychology-driven strategist and author of six works, and Timfire, Founder of KR8 Digitals, examine BUILDING WEALTH: how to get out of debt and build wealth.\n\nRegistration is free: kr8digitals.com/mindset-shift",
    general:
      "I just claimed my seat at Mindset Shift 7.0 — BUILDING WEALTH: how to get out of debt and build wealth. It's a free conversation this Sunday, 9PM, online, and it's not your usual motivational talk.\n\nIf money has been a quiet stress in your life, come. If you know someone it should reach more than you — send it to them.\n\n👉 kr8digitals.com/mindset-shift",
  },
  whatsappGroupUrl: "",
  accessEnabled: true,
  privacyNote:
    "What you share here stays between you and the team. Your name, contact details, and the honest answers you give are never published, never shown publicly, and never used to sell you anything — they only shape how this conversation helps you.",
  seoTitle: "Mindset Shift 7.0 — Get Out of Debt & Build Wealth | KR8 Digitals",
  startDate: "2026-10-04T21:00:00+01:00",
  seoDescription:
    "You're not bad with money — you were never taught. Mindset Shift 7.0 is the free, online conversation on how to get out of debt and build wealth, with Sagacious Tehilla (author, six books), hosted by Timfire. 4th October 2026, 9PM. Claim your free seat at kr8digitals.com/mindset-shift.",
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

/**
 * Access model (v2): completing onboarding grants WhatsApp access
 * immediately — there is no share-before-access gate. The legacy
 * proof/verification statuses are retained for rows created before the
 * change and for admin moderation (approve / reject) edge cases.
 */
export type MsRegStatus =
  | "registered" // no access (revoked, or pre-v2 row) — re-onboard to restore
  | "share_submitted" // legacy: proof uploaded, awaiting admin review
  | "access_granted" // onboarding complete — WhatsApp access unlocked
  | "rejected" // admin rejected the registration (final)
  | "needs_resubmission"; // legacy: admin asked for a new screenshot

export const MS_STATUS_LABELS: Record<MsRegStatus, string> = {
  registered: "No Access (revoked)",
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
  // Adaptive onboarding (v2) — the wizard's branch answers, used by the
  // speaker to pick the right approach. Optional: pre-v2 rows have none.
  whyHere: string; // opener choice label
  debtDuration: string; // "how long" choice (debt branch)
  moneyStress: string; // "silent stress in the home" choice
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
  whyHere: string;
  debtDuration: string;
  moneyStress: string;
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
    whyHere: input.whyHere.trim(),
    debtDuration: input.debtDuration.trim(),
    moneyStress: input.moneyStress.trim(),
    // v2 access model: completing onboarding unlocks the WhatsApp space
    // immediately — no share gate, no proof, no waiting on verification.
    status: "access_granted",
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
 * Admin revokes previously granted WhatsApp access. The participant loses
 * the link immediately and can restore it by completing onboarding again.
 * The note records who revoked and why (internal, admin-visible only).
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
