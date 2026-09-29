// Bundle entry for the cross-device E2E test: exposes the REAL store + sync
// layer (with the Supabase client swapped for a stub via esbuild plugin).
export * from "../src/data/store";
export * from "../src/lib/supabaseSync";
