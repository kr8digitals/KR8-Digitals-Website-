/**
 * KR8 Digitals — data bootstrap (formerly the localStorage→Supabase sync).
 *
 * The legacy implementation mirrored the browser's localStorage `accounts`
 * vault into an open Supabase `accounts` table. That model is gone: the
 * browser now keeps only an in-memory mirror, and every read/write goes
 * through the secure server API (`src/data/db.ts` + `/api/*`), which checks
 * Supabase Auth and `user_roles` server-side.
 *
 * The exported names are kept so existing imports continue to work.
 */
import { bootstrapStore } from "../data/db";

export function initSupabaseSync(): void {
  void bootstrapStore();
}

/** Re-pull the latest roster/content (used by Verify + Admin retry flows). */
export async function hydrateAccountsFromSupabase(): Promise<void> {
  await bootstrapStore();
}
