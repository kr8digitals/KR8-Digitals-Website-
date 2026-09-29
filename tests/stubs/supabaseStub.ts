/**
 * Test stub for src/lib/supabase.ts — simulates the KR8 Supabase cloud:
 * - `accounts` table with upsert + select semantics (shared across "devices")
 * - no-op live stream / chat tables
 * - records every upsert so tests can assert push behavior (change counts,
 *   and that real passwords are never sent)
 */
export interface UpsertCall {
  table: string;
  payload: any;
}

let accountsRows: any[] = [];
const upsertLog: UpsertCall[] = [];

export const __cloud = {
  setAccounts(rows: any[]) {
    accountsRows = rows.map((r) => ({ ...r }));
  },
  getAccounts(): any[] {
    return accountsRows.map((r) => ({ ...r }));
  },
  getUpserts(): UpsertCall[] {
    return upsertLog.slice();
  },
  clearUpserts() {
    upsertLog.length = 0;
  },
  reset() {
    accountsRows = [];
    upsertLog.length = 0;
  },
};

const maybeSingleResult = { data: null, error: null };

const client: any = {
  from(table: string) {
    const query: any = {
      select(_q: string) {
        const rows = table === "accounts" ? __cloud.getAccounts() : [];
        const result = Promise.resolve({ data: rows, error: null });
        const chainable: any = result;
        chainable.eq = () => chainable;
        chainable.neq = () => chainable;
        chainable.order = () => chainable;
        chainable.limit = () => chainable;
        chainable.maybeSingle = () => Promise.resolve(maybeSingleResult);
        chainable.single = () => Promise.resolve(maybeSingleResult);
        return chainable;
      },
      upsert(payload: any) {
        upsertLog.push({ table, payload });
        if (table === "accounts") {
          const i = accountsRows.findIndex((r) => r.id === payload.id);
          if (i >= 0) accountsRows[i] = { ...accountsRows[i], ...payload };
          else
            accountsRows.push({
              ...payload,
              created_at: new Date().toISOString(),
            });
        }
        return Promise.resolve({ data: null, error: null });
      },
      update(payload: any) {
        return Promise.resolve({ data: null, error: null });
      },
      insert(payload: any) {
        return Promise.resolve({ data: null, error: null });
      },
    };
    query.eq = () => query;
    query.neq = () => query;
    query.order = () => query;
    query.limit = () => query;
    query.maybeSingle = () => Promise.resolve(maybeSingleResult);
    return query;
  },
  channel() {
    const ch = {
      on: () => ch,
      subscribe: () => Promise.resolve(),
      unsubscribe: () => Promise.resolve(),
    };
    return ch;
  },
};

export function getSupabase() {
  return client;
}
export function isSupabaseConnected() {
  return true;
}
export function saveSupabaseConfig() {
  return true;
}
export function getStoredSupabaseConfig() {
  return { url: "stub", anonKey: "stub" };
}
