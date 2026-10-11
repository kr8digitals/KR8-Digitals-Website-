/**
 * KR8 Digitals — remote-backed application state.
 *
 * Every domain that used to live in browser localStorage is now served from
 * Supabase through the secure server API. This module keeps an IN-MEMORY
 * mirror (never localStorage) so the existing UI can keep its synchronous
 * getters, while every mutation is flushed to the database.
 *
 * Hydration order (bootstrapStore):
 *   1. /api/site               → public content, skill settings, counts, feed
 *   2. /api/me                 → the signed-in user's own profile/certs
 *   3. /api/admin/students     → full roster (only when the user is staff)
 *   4. /api/leaderboard        → public safe-fields roster for rankings
 */
import {
  apiActivity,
  apiAdminContent,
  apiAdminRoster,
  apiAdminSkills,
  apiAttendanceAll,
  apiAttendanceMine,
  apiFetch,
  apiLeaderboard,
  apiMe,
  apiSite,
  type ApiAccount,
  type ApiCertificate,
  type ApiNotification,
} from "../lib/api";

export type RemoteAccount = ApiAccount & {
  certificates?: ApiCertificate[];
  notifications?: ApiNotification[];
};

/* ------------------------------------------------------------------ */
/* in-memory state (never persisted to the browser)                    */
/* ------------------------------------------------------------------ */

const docCache = new Map<string, unknown>();
const pendingDocs = new Map<string, unknown>();
const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

export let accountsCache: RemoteAccount[] = [];
export let feedCache: Record<string, unknown>[] = [];
export let attendanceCache: Record<string, unknown>[] = [];
export let attendanceTypesCache: Record<string, boolean> = {};
export let countsCache = { students: 0, tribe: 0, graduated: 0 };
export let hydrated = false;
let bootstrapPromise: Promise<void> | null = null;

export function setAccountsCache(list: RemoteAccount[]): void {
  accountsCache = list;
}

export function upsertAccountCache(account: RemoteAccount): void {
  const key = (account.id || "").replace(/[\s-]/g, "").toUpperCase();
  const idx = accountsCache.findIndex((a) => (a.id || "").replace(/[\s-]/g, "").toUpperCase() === key);
  if (idx >= 0) {
    accountsCache[idx] = { ...accountsCache[idx], ...account };
  } else {
    accountsCache.push(account);
  }
}

export function setFeedCache(list: Record<string, unknown>[]): void {
  feedCache = list;
}

export function removeAccountCache(id: string): void {
  const key = (id || "").replace(/[\s-]/g, "").toUpperCase();
  accountsCache = accountsCache.filter((a) => (a.id || "").replace(/[\s-]/g, "").toUpperCase() !== key);
}

/* ------------------------------------------------------------------ */
/* generic doc mirror (historic localStorage keys → server docs)        */
/* ------------------------------------------------------------------ */

export function docGet<T>(key: string, fallback: T): T {
  if (docCache.has(key)) return docCache.get(key) as T;
  return fallback;
}

/** Sync alias: undefined when the doc has not been hydrated yet. */
export function docGetSync<T = unknown>(key: string): T | undefined {
  return docCache.has(key) ? (docCache.get(key) as T) : undefined;
}

/** Sync alias for docSet (server flush is debounced). */
export function docSetSync(key: string, value: unknown): void {
  docSet(key, value);
}

export function docSet(key: string, value: unknown): void {
  docCache.set(key, value);
  scheduleDocPersist(key, value);
}

const TABLE_KEYS: Record<string, "announcements" | "testimonials" | "team" | "skills" | "feed"> = {
  kr8_announcements_v2: "announcements",
  kr8_testimonials_v16: "testimonials",
  kr8_team_v2: "team",
  kr8_skill_settings_v3: "skills",
  kr8_feed_v3: "feed",
};

function scheduleDocPersist(key: string, value: unknown): void {
  pendingDocs.set(key, value);
  const existing = pendingTimers.get(key);
  if (existing) clearTimeout(existing);
  pendingTimers.set(
    key,
    setTimeout(() => {
      pendingTimers.delete(key);
      void flushDoc(key);
    }, 700)
  );
}

async function flushDoc(key: string): Promise<void> {
  const value = pendingDocs.get(key);
  if (value === undefined) return;
  pendingDocs.delete(key);
  const table = TABLE_KEYS[key];
  try {
    if (table === "skills") {
      const entries = (value || {}) as Record<string, { regOpen?: boolean; whatsapp?: string; available?: boolean; suffix?: string; name?: string }>;
      for (const [skill, patch] of Object.entries(entries)) {
        await apiAdminSkills({ skill, ...patch });
      }
      return;
    }
    if (table === "announcements") {
      await apiAdminContent({ kind: "announcements", items: value });
      return;
    }
    if (table === "testimonials") {
      await apiAdminContent({ kind: "testimonials", items: value });
      return;
    }
    if (table === "team") {
      await apiAdminContent({ kind: "team", items: value });
      return;
    }
    if (table === "feed") {
      const items = (value || []) as Record<string, unknown>[];
      // Only push the newest item(s) that have not been marked synced.
      for (const item of items) {
        if (item._synced) continue;
        item._synced = true;
        await apiActivity({
          kind: item.kind,
          name: item.name,
          skill: item.skill,
          avatar: item.avatar,
          customAction: item.customAction,
        });
      }
      return;
    }
    // Generic document (site_content / site_settings style).
    await apiAdminContent({ kind: "doc", key, data: value });
  } catch {
    // Admin-only writes silently no-op for non-admins (public viewers).
  }
}

/* ------------------------------------------------------------------ */
/* attendance                                                          */
/* ------------------------------------------------------------------ */

export function setAttendanceCache(subs: Record<string, unknown>[]): void {
  attendanceCache = subs;
}
export function setAttendanceTypesCache(types: Record<string, boolean>): void {
  attendanceTypesCache = types;
}

/* ------------------------------------------------------------------ */
/* bootstrap                                                           */
/* ------------------------------------------------------------------ */

export function bootstrapStore(): Promise<void> {
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = doBootstrap().finally(() => {
    // Allow later explicit re-bootstraps (e.g. after login).
    setTimeout(() => {
      bootstrapPromise = null;
    }, 500);
  });
  return bootstrapPromise;
}

async function doBootstrap(): Promise<void> {
  // 1) public site bundle
  try {
    const { site } = await apiSite();
    for (const [k, v] of Object.entries(site.docs || {})) docCache.set(k, v);
    for (const [k, v] of Object.entries(site.settings || {})) {
      if (!docCache.has(k)) docCache.set(k, v);
      else if (k === "attendance_types") docCache.set(k, v);
    }
    // Table-shaped domains exposed with the historic client keys:
    docCache.set("kr8_announcements_v2", site.announcements || []);
    docCache.set("kr8_testimonials_v16", site.testimonials || []);
    docCache.set("kr8_team_v2", site.teamMembers || []);
    const skillSettings: Record<string, unknown> = {};
    for (const s of site.skills || []) {
      skillSettings[s.key] = {
        regOpen: s.regOpen,
        whatsapp: s.whatsapp,
        available: s.available,
        suffix: s.suffix,
        name: s.name,
      };
    }
    docCache.set("kr8_skill_settings_v3", skillSettings);
    feedCache = (site.feed || []).map((f) => ({ ...f, _synced: true }));
    docCache.set("kr8_feed_v3", feedCache);
    countsCache = site.counts || { students: 0, tribe: 0, graduated: 0 };
    if (site.settings?.attendance_types) {
      attendanceTypesCache = site.settings.attendance_types as Record<string, boolean>;
    }
  } catch {
    /* offline / unconfigured — the UI falls back to built-in defaults */
  }

  // 2) own profile + attendance (signed-in)
  let myAccount: RemoteAccount | null = null;
  try {
    const { account } = await apiMe();
    myAccount = account;
    upsertAccountCache(account);
  } catch {
    /* not signed in */
  }

  // 3) staff roster (full private fields) — server enforces user_roles
  let isStaff = false;
  try {
    const { accounts } = await apiAdminRoster();
    if (accounts && accounts.length > 0) {
      isStaff = true;
      accountsCache = accounts as RemoteAccount[];
    }
  } catch {
    /* not staff */
  }

  // 4) public leaderboard rows fill the ranking surface for everyone else
  if (!isStaff) {
    try {
      const { rows } = await apiLeaderboard(200);
      for (const row of rows) {
        const key = (row.id || "").replace(/[\s-]/g, "").toUpperCase();
        const idx = accountsCache.findIndex((a) => (a.id || "").replace(/[\s-]/g, "").toUpperCase() === key);
        if (idx >= 0) accountsCache[idx] = { ...accountsCache[idx], ...row, ...(myAccount && myAccount.id === row.id ? myAccount : {}) };
        else accountsCache.push(row as RemoteAccount);
      }
    } catch {
      /* ignore */
    }
  }

  // 5) attendance lists
  try {
    if (myAccount) {
      const { submissions } = await apiAttendanceMine();
      attendanceCache = submissions;
    }
    if (isStaff) {
      const all = await apiAttendanceAll();
      attendanceCache = all.submissions;
      attendanceTypesCache = all.types || attendanceTypesCache;
    }
  } catch {
    /* ignore */
  }

  hydrated = true;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:accounts-updated"));
    window.dispatchEvent(new Event("kr8:skills-updated"));
    window.dispatchEvent(new Event("kr8:attendance-updated"));
    window.dispatchEvent(new Event("kr8:feed-updated"));
    window.dispatchEvent(new Event("storage"));
  }
}

/* ------------------------------------------------------------------ */
/* account mutations                                                   */
/* ------------------------------------------------------------------ */

export async function pushStudentPatch(idOrUserId: string, patch: Record<string, unknown>, opts: { byUserId?: string } = {}): Promise<RemoteAccount | null> {
  try {
    const body = opts.byUserId ? { userId: opts.byUserId, patch } : { id: idOrUserId, patch };
    const { account } = await apiFetch<{ ok: boolean; account?: RemoteAccount }>("/api/admin/students", {
      method: "PATCH",
      body,
    });
    if (account) {
      upsertAccountCache(account);
      return account;
    }
    return null;
  } catch {
    return null;
  }
}
