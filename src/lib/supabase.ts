import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * KR8 Digitals — browser Supabase client.
 *
 * SECURITY: configuration comes from build-time environment variables ONLY.
 * The previous hard-coded fallback project and the localStorage config store
 * have been deleted. The service-role key must never appear in any VITE_
 * variable — privileged operations go through the server functions in /api.
 */
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || "";
const anonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() ||
  "";

let clientInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!clientInstance) {
    try {
      clientInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch {
      return null;
    }
  }
  return clientInstance;
}

export function isSupabaseConnected(): boolean {
  return getSupabase() !== null;
}
