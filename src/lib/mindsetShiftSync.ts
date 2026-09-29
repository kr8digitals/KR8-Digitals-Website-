/**
 * Mindset Shift — Supabase synchronization (mirrors src/lib/supabaseSync.ts)
 *
 * Two shared tables:
 *   - mindset_shift_event          (id = "mindset_shift", config jsonb)
 *   - mindset_shift_registrations  (one row per participant)
 *
 * Pattern (identical to accounts):
 *   1. Hydrate from Supabase on init (cloud data merges into local).
 *   2. Push local changes to Supabase (only the changed / pending rows —
 *      never the whole set, to avoid realtime feedback storms).
 *   3. Realtime subscriptions re-hydrate (debounced) when another device
 *      changes a row, so the admin queue and the public page stay live.
 *
 * Local-first: everything works with Supabase unconfigured; the cloud is a
 * best-effort shared layer for cross-device admin + participant continuity.
 */
import { getSupabase } from "./supabase";
import {
  getMsEvent,
  saveMsEvent,
  getAllMsRegistrations,
  updateMsRegistration,
  type MsEventConfig,
  type MsRegistration,
} from "../data/mindsetShift";

const EVENT_ROW_ID = "mindset_shift";

let isInitialized = false;
let eventPushTimer: ReturnType<typeof setTimeout> | null = null;
let regsHydrateTimer: ReturnType<typeof setTimeout> | null = null;
let eventHydrateTimer: ReturnType<typeof setTimeout> | null = null;
const activeChannels: { unsubscribe: () => void }[] = [];
let eventPushListener: EventListener | null = null;
let regsPushListener: EventListener | null = null;

/** Test-only: allow a simulated "device" to tear down and re-initialize. */
export function __testTeardownMsSync(): void {
  teardown();
}

function teardown() {
  for (const ch of activeChannels) {
    try {
      ch.unsubscribe();
    } catch {
      /* ignore */
    }
  }
  activeChannels.length = 0;
  if (eventPushTimer) clearTimeout(eventPushTimer);
  if (regsHydrateTimer) clearTimeout(regsHydrateTimer);
  if (eventHydrateTimer) clearTimeout(eventHydrateTimer);
  if (eventPushListener) window.removeEventListener("kr8:ms-event-updated", eventPushListener);
  if (regsPushListener) window.removeEventListener("kr8:ms-regs-updated", regsPushListener);
  eventPushListener = null;
  regsPushListener = null;
  isInitialized = false;
}

/* ---------------- field mapping (camel <-> snake) ---------------- */

function regToCloud(r: MsRegistration) {
  return {
    id: r.id,
    edition: r.edition,
    full_name: r.fullName,
    email: r.email,
    phone: r.phone,
    whatsapp: r.whatsapp || null,
    location: r.location || null,
    heard_about: r.heardAbout || null,
    hoping_to_learn: r.hopingToLearn || null,
    money_question: r.moneyQuestion || null,
    biggest_challenge: r.biggestChallenge || null,
    debt_experience: r.debtExperience || null,
    financial_situation: r.financialSituation || null,
    has_financial_goal: !!r.hasFinancialGoal,
    area_to_improve: r.areaToImprove || null,
    status: r.status,
    proof_data: r.proofData || null,
    proof_submitted_at: r.proofSubmittedAt || null,
    admin_note: r.adminNote || null,
    verified_by: r.verifiedBy || null,
    verified_at: r.verifiedAt || null,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
    deleted_at: r.deletedAt ?? null,
  };
}

function cloudToReg(row: any): Partial<MsRegistration> {
  return {
    id: row.id,
    edition: row.edition,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp || "",
    location: row.location || "",
    heardAbout: row.heard_about || "",
    hopingToLearn: row.hoping_to_learn || "",
    moneyQuestion: row.money_question || "",
    biggestChallenge: row.biggest_challenge || "",
    debtExperience: row.debt_experience || "",
    financialSituation: row.financial_situation || "",
    hasFinancialGoal: !!row.has_financial_goal,
    areaToImprove: row.area_to_improve || "",
    status: row.status,
    proofData: row.proof_data || null,
    proofSubmittedAt: row.proof_submitted_at || null,
    adminNote: row.admin_note || "",
    verifiedBy: row.verified_by || null,
    verifiedAt: row.verified_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? null,
    syncPending: false,
  };
}

/* Cloud fields that determine whether a local row is out of date. */
const CLOUD_REG_FIELDS = [
  "status",
  "proofData",
  "proofSubmittedAt",
  "adminNote",
  "verifiedBy",
  "verifiedAt",
] as const;

function regCloudStale(local: MsRegistration, cloud: Partial<MsRegistration>): boolean {
  return CLOUD_REG_FIELDS.some((f) => JSON.stringify(local[f]) !== JSON.stringify(cloud[f]));
}

function sameMsEvent(a: MsEventConfig, b: MsEventConfig): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/* ------------------------------- push ------------------------------- */

export async function syncMsEventToCloud(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const cfg = getMsEvent();
  try {
    await supabase.from("mindset_shift_event").upsert({
      id: EVENT_ROW_ID,
      edition: cfg.edition,
      config: cfg as unknown as Record<string, unknown>,
      updated_at: Date.now(),
    });
  } catch (err) {
    console.warn("Mindset Shift event cloud sync failed:", err);
  }
}

export async function syncMsRegistrationToCloud(r: MsRegistration): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("mindset_shift_registrations").upsert(regToCloud(r));
    return !error;
  } catch (err) {
    console.warn("Mindset Shift registration cloud sync failed:", err);
    return false;
  }
}

/** Push only the pending rows, then clear their pending flag locally. */
async function pushPendingRegistrations() {
  const regs = getAllMsRegistrations(); // tombstones too — deletions push as well
  const pending = regs.filter((r) => r.syncPending);
  if (pending.length === 0) return;
  for (const r of pending) {
    const ok = await syncMsRegistrationToCloud(r);
    if (ok) updateMsRegistration(r.id, { syncPending: false });
  }
}

/* ----------------------------- hydrate ------------------------------ */

export async function hydrateMsEventFromCloud(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    const { data, error } = await supabase
      .from("mindset_shift_event")
      .select("*")
      .eq("id", EVENT_ROW_ID)
      .maybeSingle();
    if (error || !data) return;
    const cloud = data.config as MsEventConfig;
    if (!cloud) return;
    const local = getMsEvent();
    if (!sameMsEvent(local, cloud)) {
      saveMsEvent(cloud); // merges over defaults; dispatches kr8:ms-event-updated
    }
  } catch (err) {
    console.warn("Mindset Shift event hydration failed:", err);
  }
}

export async function hydrateMsRegistrationsFromCloud(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    const { data, error } = await supabase.from("mindset_shift_registrations").select("*");
    if (error || !data) return;
    const local = getAllMsRegistrations(); // include tombstones so they can't resurrect
    const localMap = new Map(local.map((r) => [r.id, r]));
    let changedAny = false;
    for (const row of data) {
      const cloud = cloudToReg(row);
      const existing = localMap.get(cloud.id!);
      if (cloud.deletedAt) {
        // Cloud tombstone: apply locally if this row still exists; never import as active.
        if (existing && !existing.deletedAt) {
          existing.deletedAt = cloud.deletedAt;
          existing.syncPending = false;
          changedAny = true;
        }
        continue;
      }
      if (existing && existing.deletedAt) continue; // local delete still authoritative until pushed
      if (!existing) {
        localMap.set(cloud.id!, {
          id: cloud.id!,
          edition: cloud.edition || "",
          fullName: cloud.fullName || "",
          email: cloud.email || "",
          phone: cloud.phone || "",
          whatsapp: cloud.whatsapp || "",
          location: cloud.location || "",
          heardAbout: cloud.heardAbout || "",
          hopingToLearn: cloud.hopingToLearn || "",
          moneyQuestion: cloud.moneyQuestion || "",
          biggestChallenge: cloud.biggestChallenge || "",
          debtExperience: cloud.debtExperience || "",
          financialSituation: cloud.financialSituation || "",
          hasFinancialGoal: !!cloud.hasFinancialGoal,
          areaToImprove: cloud.areaToImprove || "",
          status: cloud.status || "registered",
          proofKey: null,
          proofData: cloud.proofData || null,
          proofSubmittedAt: cloud.proofSubmittedAt || null,
          adminNote: cloud.adminNote || "",
          verifiedBy: cloud.verifiedBy || null,
          verifiedAt: cloud.verifiedAt || null,
          createdAt: cloud.createdAt || Date.now(),
          updatedAt: cloud.updatedAt || Date.now(),
          syncPending: false,
        } as MsRegistration);
        changedAny = true;
      } else if (regCloudStale(existing, cloud)) {
        // Cloud is authoritative for verification/proof fields.
        localMap.set(
          existing.id,
          {
            ...existing,
            status: cloud.status ?? existing.status,
            proofData: cloud.proofData ?? existing.proofData,
            proofSubmittedAt: cloud.proofSubmittedAt ?? existing.proofSubmittedAt,
            adminNote: cloud.adminNote ?? existing.adminNote,
            verifiedBy: cloud.verifiedBy ?? existing.verifiedBy,
            verifiedAt: cloud.verifiedAt ?? existing.verifiedAt,
            syncPending: false,
          } as MsRegistration
        );
        changedAny = true;
      }
    }
    if (changedAny) {
      // Import the merged set without re-dispatching a push we just received.
      const merged = Array.from(localMap.values());
      try {
        localStorage.setItem("kr8_mindset_shift_registrations_v1", JSON.stringify(merged));
      } catch {
        /* ignore */
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("kr8:ms-regs-updated"));
      }
    }
  } catch (err) {
    console.warn("Mindset Shift registrations hydration failed:", err);
  }
}

/* ------------------------------ init -------------------------------- */

if (typeof window !== "undefined") {
  // Re-initialize when the admin (re)configures Supabase credentials.
  window.addEventListener("kr8:supabase-configured", () => {
    teardown();
    initMindsetShiftSync();
  });
}

export function initMindsetShiftSync(): void {
  if (typeof window === "undefined" || isInitialized) return;
  const supabase = getSupabase();
  if (!supabase) return;

  isInitialized = true;

  // 1. Initial hydration
  hydrateMsEventFromCloud();
  hydrateMsRegistrationsFromCloud();

  // 2. Push local changes (debounced; only pending rows are pushed).
  eventPushListener = () => {
    if (eventPushTimer) clearTimeout(eventPushTimer);
    eventPushTimer = setTimeout(() => syncMsEventToCloud(), 600);
  };
  regsPushListener = () => {
    // Slight delay so rapid multi-field saves coalesce into one push batch.
    setTimeout(() => pushPendingRegistrations(), 400);
  };
  window.addEventListener("kr8:ms-event-updated", eventPushListener);
  window.addEventListener("kr8:ms-regs-updated", regsPushListener);

  // 3. Realtime subscriptions (debounced re-hydration).
  try {
    const regsChannel = supabase
      .channel("public:mindset_shift_registrations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mindset_shift_registrations" },
        () => {
          if (regsHydrateTimer) clearTimeout(regsHydrateTimer);
          regsHydrateTimer = setTimeout(() => hydrateMsRegistrationsFromCloud(), 800);
        }
      );
    activeChannels.push(regsChannel);
    regsChannel.subscribe();

    const eventChannel = supabase
      .channel("public:mindset_shift_event")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mindset_shift_event" },
        () => {
          if (eventHydrateTimer) clearTimeout(eventHydrateTimer);
          eventHydrateTimer = setTimeout(() => hydrateMsEventFromCloud(), 800);
        }
      );
    activeChannels.push(eventChannel);
      eventChannel.subscribe();
  } catch (err) {
    console.warn("Mindset Shift realtime init error:", err);
  }
}
