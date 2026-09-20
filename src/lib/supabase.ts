import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Default verified Supabase credentials for KR8 Digitals
const DEFAULT_SUPABASE_URL = "https://yuvslnjoutjohxgsxprb.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_1okkWO6Qwn7mmuvbFLZdmQ_6SZb0uo0";

// Retrieve keys from environment, browser localStorage, or default production configuration
const getSupabaseEnv = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  let localUrl = "";
  let localKey = "";

  if (typeof window !== "undefined") {
    try {
      localUrl = localStorage.getItem("kr8_supabase_url") || "";
      localKey = localStorage.getItem("kr8_supabase_anon_key") || "";
    } catch {
      // Storage access blocked or restricted
    }
  }

  const url = (localUrl || envUrl || DEFAULT_SUPABASE_URL).trim();
  const anonKey = (localKey || envKey || DEFAULT_SUPABASE_ANON_KEY).trim();

  return { url, anonKey };
};

let clientInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseEnv();

  if (!url || !anonKey) {
    return null;
  }

  if (!clientInstance) {
    try {
      clientInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    } catch (err) {
      console.error("Failed to initialize Supabase client:", err);
      return null;
    }
  }

  return clientInstance;
}

export function isSupabaseConnected(): boolean {
  return getSupabase() !== null;
}

export function saveSupabaseConfig(url: string, anonKey: string): boolean {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("kr8_supabase_url", url.trim());
      localStorage.setItem("kr8_supabase_anon_key", anonKey.trim());
      clientInstance = null; // reset client instance to reload with new keys
      window.dispatchEvent(new Event("kr8:supabase-configured"));
    }
    return true;
  } catch {
    return false;
  }
}

export function getStoredSupabaseConfig() {
  return getSupabaseEnv();
}
