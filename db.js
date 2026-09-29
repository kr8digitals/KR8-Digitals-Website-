/**
 * db.js — Server-side Supabase client for the KR8 Digitals Node.js runtime.
 *
 * Hostinger auto-injects the Supabase environment variables for Node.js
 * apps. This module reads them and exposes a ready-to-use client, plus a
 * connection test against the main "accounts" table.
 *
 * Run directly to verify the connection:
 *   node db.js
 *
 * Import from other server code:
 *   import { supabase } from "./db.js";
 *
 * NOTE: The browser app already talks to Supabase on its own via
 * src/lib/supabase.ts (VITE_ build-time vars). This file is the
 * NODE/SERVER side of the same integration.
 */
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "node:url";
import ws from "ws";

// ---------------------------------------------------------------------------
// Environment configuration
//
// Primary names are Hostinger's auto-injected variables. The VITE_-prefixed
// fallbacks keep this file working in any environment that uses the
// project's existing naming convention.
// ---------------------------------------------------------------------------
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "";

const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Supabase environment variables are not set.");
  console.error(
    "   Expected: SUPABASE_URL and SUPABASE_ANON_KEY " +
      "(Hostinger injects these automatically on deploy)."
  );
  console.error(
    "   Got:      SUPABASE_URL=" + (SUPABASE_URL || "<missing>") +
      ", SUPABASE_ANON_KEY=" + (SUPABASE_KEY ? "<set>" : "<missing>")
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Supabase client (singleton, shared across the app)
// ---------------------------------------------------------------------------
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false, // server-side: no browser session storage
    autoRefreshToken: false,
  },
  // Node.js (< 22) has no native WebSocket — provide the "ws" package as
  // the realtime transport so the client works on any Hostinger Node runtime.
  realtime: {
    transport: ws,
  },
});

// ---------------------------------------------------------------------------
// Connection test — fetches rows from the main "accounts" table.
// Runs only when this file is executed directly (`node db.js`), never on
// import.
// ---------------------------------------------------------------------------
async function runConnectionTest() {
  console.log("→ Testing Supabase connection…");
  console.log("  URL:", SUPABASE_URL);
  console.log(
    "  Key:",
    process.env.SUPABASE_ANON_KEY
      ? "anon key (from SUPABASE_ANON_KEY)"
      : process.env.SUPABASE_SERVICE_ROLE_KEY
        ? "service role key (from SUPABASE_SERVICE_ROLE_KEY)"
        : "anon key (fallback source)"
  );

  const { data, error, count } = await supabase
    .from("accounts")
    .select("*", { count: "exact" })
    .limit(5);

  if (error) {
    console.error("❌ Supabase query FAILED:", error.message);
    process.exit(1);
  }

  console.log(`✅ Connection OK — "accounts" table reachable (${count ?? data?.length} row(s) total).`);
  if (data && data.length > 0) {
    console.log("   Sample rows (id, name, type):");
    for (const row of data) {
      console.log(`   - ${row.id} | ${row.name ?? ""} | ${row.type ?? ""}`);
    }
  } else {
    console.log("   Table is empty.");
  }
}

const isDirectRun =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  runConnectionTest().catch((err) => {
    console.error("❌ Connection test crashed:", err);
    process.exit(1);
  });
}
