// Bundle entry for the Mindset Shift architecture test: exposes the REAL
// event data layer + sync layer (Supabase client swapped for a stub via an
// esbuild plugin).
export * from "../src/data/mindsetShift";
export * from "../src/lib/mindsetShiftSync";
export { __msCloud } from "./stubs/msSupabaseStub";
