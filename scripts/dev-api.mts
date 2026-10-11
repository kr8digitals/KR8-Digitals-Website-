/**
 * Local development API server for the Vercel-style functions in /api.
 *
 *   npx tsx scripts/dev-api.mts
 *
 * Mirrors Vercel's Node runtime contract closely enough for local dev and the
 * live preview: each request under /api/ is routed to the matching module in
 * server/routes/ (server/routes/<path>.ts) — the same modules the single Vercel
 * entry api/[...route].ts dispatches to — and handled by its default export — a (req, res) function produced by `handler()` in
 * server/lib.ts. The only runtime shim Vercel provides that Node does not is
 * `req.query`, which is populated here from the URL search params.
 *
 * Environment is read from .env.local / .env (git-ignored) — real keys never
 * live in the repository.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.API_PORT || 8787);

/* ---- minimal .env loader (no dependency) ---- */
function loadEnvFile(file: string): void {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let value = m[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(m[1] in process.env)) process.env[m[1]] = value;
  }
}
loadEnvFile(".env.local");
loadEnvFile(".env");

/* ---- handler resolution: /api/auth/login → server/routes/auth/login.ts ---- */
function resolveHandlerPath(urlPath: string): string | null {
  const clean = urlPath.replace(/^\/api\/?/, "").replace(/\/+$/, "");
  if (!clean || clean.includes("..")) return null;
  const candidates = [
    path.join(root, "server", "routes", `${clean}.ts`),
    path.join(root, "server", "routes", clean, "index.ts"),
    path.join(root, "server", "routes", `${clean}.js`),
    path.join(root, "server", "routes", clean, "index.js"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (!url.pathname.startsWith("/api/")) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, error: "Not found." }));
    return;
  }

  // Vercel's Node runtime exposes `req.query`; the shared helpers read it.
  (req as unknown as { query: Record<string, string> }).query = Object.fromEntries(
    url.searchParams.entries()
  );

  const handlerPath = resolveHandlerPath(url.pathname);
  if (!handlerPath) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, error: `No API function for ${url.pathname}.` }));
    return;
  }

  try {
    // Cache-buster so edited handlers reload between requests during dev.
    const mod = await import(`${pathToFileURL(handlerPath).href}?t=${Date.now()}`);
    const fn = (mod as { default?: (r: http.IncomingMessage, s: http.ServerResponse) => Promise<void> })
      .default;
    if (typeof fn !== "function") {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: false, error: "API module has no default export." }));
      return;
    }
    await fn(req, res);
  } catch (err) {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
    }
    res.end(
      JSON.stringify({ ok: false, error: (err as Error)?.message || "Unexpected server error." })
    );
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[dev-api] listening on http://0.0.0.0:${PORT} (routing /api/ requests to server/routes/ modules)`);
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log(
      "[dev-api] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — endpoints will return structured errors; the UI falls back to built-in defaults."
    );
  }
});
