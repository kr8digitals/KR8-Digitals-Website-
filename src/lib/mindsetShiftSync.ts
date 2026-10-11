/**
 * Mindset Shift — server synchronization (formerly a localStorage mirror).
 *
 * Event configuration lives in `mindset_events`, registrations in
 * `mindset_registrations` — both reached through `/api/mindset`, which checks
 * admin roles server-side. This module simply hydrates the in-memory caches in
 * src/data/mindsetShift.ts; nothing is persisted in the browser.
 */
import {
  getMsEvent,
  getAllMsRegistrations,
  __setMsEventCache,
  __setMsRegsCache,
  type MsEventConfig,
  type MsRegistration,
} from "../data/mindsetShift";
import { apiMindset } from "./api";

let isInitialized = false;

export function initMindsetShiftSync(): void {
  if (isInitialized) return;
  isInitialized = true;
  void hydrateMindsetFromServer();
}

export async function hydrateMindsetFromServer(): Promise<void> {
  // Public event configuration.
  try {
    const res = (await apiMindset(undefined, "")) as { ok: boolean; events?: unknown[] };
    const events = (res.events || []) as { code: string; config: MsEventConfig }[];
    const current = events.find((e) => e.code === (getMsEvent().edition || "mindset_shift")) || events[0];
    if (current?.config) __setMsEventCache(current.config);
  } catch {
    /* keep defaults */
  }

  // Admin registration queue (server rejects non-staff).
  try {
    const res = (await apiMindset(undefined, "?registrations=1")) as { ok: boolean; registrations?: unknown[] };
    const regs = (res.registrations || []) as MsRegistration[];
    if (Array.isArray(regs)) __setMsRegsCache(regs);
  } catch {
    /* not staff — the local session cache stays */
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:ms-event-updated"));
    window.dispatchEvent(new Event("kr8:ms-regs-updated"));
  }
}

/** Test-only teardown hook (kept for compatibility). */
export function __testTeardownMsSync(): void {
  isInitialized = false;
}

// Re-exported so callers that used the sync module keep working.
export { getAllMsRegistrations };
