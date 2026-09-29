/**
 * Test stub for src/lib/supabase.ts — Mindset Shift cloud simulation:
 *   - mindset_shift_event          (single row, id "mindset_shift", config jsonb)
 *   - mindset_shift_registrations  (one row per participant)
 * Records every upsert so tests can assert push behaviour.
 */
export interface UpsertCall {
  table: string;
  payload: any;
}

let eventRow: any = null;
let regRows: any[] = [];
const upsertLog: UpsertCall[] = [];

export const __msCloud = {
  setEventRow(row: any) {
    eventRow = row ? { ...row } : null;
  },
  getEventRow() {
    return eventRow ? { ...eventRow } : null;
  },
  setRegs(rows: any[]) {
    regRows = rows.map((r) => ({ ...r }));
  },
  getRegs(): any[] {
    return regRows.map((r) => ({ ...r }));
  },
  getUpserts(): UpsertCall[] {
    return upsertLog.slice();
  },
  clearUpserts() {
    upsertLog.length = 0;
  },
  reset() {
    eventRow = null;
    regRows = [];
    upsertLog.length = 0;
  },
};

function rowsFor(table: string, filters: { col: string; val: any }[]): any[] {
  let rows =
    table === "mindset_shift_event"
      ? eventRow
        ? [eventRow]
        : []
      : table === "mindset_shift_registrations"
        ? regRows.slice()
        : [];
  for (const f of filters) rows = rows.filter((r) => r[f.col] === f.val);
  return rows;
}

const client: any = {
  from(table: string) {
    const filters: { col: string; val: any }[] = [];
    const all = () => Promise.resolve({ data: rowsFor(table, filters), error: null });
    const q: any = {
      select(_q: string) {
        return q;
      },
      eq(col: string, val: any) {
        filters.push({ col, val });
        return q;
      },
      neq(col: string, val: any) {
        filters.push({ col, val });
        return q;
      },
      order(_c: string) {
        return q;
      },
      limit(_n: number) {
        return q;
      },
      maybeSingle() {
        return Promise.resolve({
          data: rowsFor(table, filters)[0] ?? null,
          error: null,
        });
      },
      single() {
        return q.maybeSingle();
      },
      // Thenable so `await supabase.from(t).select("*")` works.
      then(res: any, rej: any) {
        return all().then(res, rej);
      },
      catch(rej: any) {
        return all().catch(rej);
      },
      upsert(payload: any) {
        upsertLog.push({ table, payload });
        if (table === "mindset_shift_event") {
          eventRow = { ...(eventRow || {}), ...payload };
        } else if (table === "mindset_shift_registrations") {
          const i = regRows.findIndex((r) => r.id === payload.id);
          if (i >= 0) regRows[i] = { ...regRows[i], ...payload };
          else regRows.push({ ...payload });
        }
        return Promise.resolve({ data: payload, error: null });
      },
    };
    return q;
  },
  channel() {
    const ch: any = {
      on: () => ch,
      subscribe: () => {
        /* no-op realtime in tests */
      },
      unsubscribe: () => undefined,
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
  return { url: "http://stub.local", anonKey: "stub" };
}
