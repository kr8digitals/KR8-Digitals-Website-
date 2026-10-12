/**
 * scripts/authz-test.mts — proves the SERVER-side role gate on every
 * privileged API route:
 *
 *   no token     -> 401
 *   student token-> 403   (role "student" only)
 *   staff token  -> passes the gate (data errors after the gate are fine)
 *
 * It runs the REAL route handlers (server/routes/**) against a mock Supabase
 * (GoTrue /auth/v1/user + PostgREST user_roles + the is_staff/is_admin/
 * has_role/has_permission/can_manage RPCs), so the whole authorization path —
 * getUserFromRequest → requireAdmin → dbIsAdmin/dbIsStaff — is exercised
 * exactly as on Vercel.
 *
 *   npx tsx scripts/authz-test.mts
 */
import http from "node:http";
import type { AddressInfo } from "node:net";

const STUDENT = "11111111-1111-4111-8111-111111111111";
const STAFF = "22222222-2222-4222-8222-222222222222";

type TokenEntry = { id: string; roles: { role: string; permissions: string[] }[] };
const ADMIN = "33333333-3333-4333-8333-333333333333";
const TOKENS: Record<string, TokenEntry> = {
  "student.jwt": { id: STUDENT, roles: [{ role: "student", permissions: [] }] },
  "staff.jwt": { id: STAFF, roles: [{ role: "coach", permissions: [] }] },
  "admin.jwt": { id: ADMIN, roles: [{ role: "founder", permissions: [] }] },
};

const STAFF_ROLES = new Set(["founder", "co-founder", "admin", "moderator", "coach", "attendance_reviewer"]);
const ADMIN_ROLES = new Set(["founder", "co-founder", "admin"]);

function entryFor(token: string, uid?: string): TokenEntry | null {
  if (uid) {
    for (const t of Object.values(TOKENS)) if (t.id === uid) return t;
  }
  return TOKENS[token] || null;
}

/* ---------------- mock Supabase (GoTrue + PostgREST) ---------------- */
const mock = http.createServer((req, res) => {
  const sendJson = (code: number, body: unknown) => {
    res.statusCode = code;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(body));
  };
  const chunks: Buffer[] = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const url = new URL(req.url || "/", "http://mock");
    const raw = Buffer.concat(chunks).toString("utf8");
    let body: Record<string, unknown> = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      /* ignore */
    }
    const token = String(req.headers["authorization"] || "").replace(/^Bearer\s+/i, "");

    // GoTrue: token -> user
    if (url.pathname.startsWith("/auth/v1/user")) {
      const entry = entryFor(token);
      if (!entry) return sendJson(401, { message: "invalid_token" });
      return sendJson(200, {
        id: entry.id,
        aud: "authenticated",
        role: "authenticated",
        email: `${token}@test.local`,
        user_metadata: { name: "Test User" },
        app_metadata: {},
        created_at: new Date().toISOString(),
      });
    }

    // PostgREST RPCs
    if (url.pathname.startsWith("/rest/v1/rpc/")) {
      const fn = url.pathname.split("/").pop() || "";
      const vals = Object.values(body).filter((v) => typeof v === "string") as string[];
      const uid = vals.find((v) => v.includes("-")) || "";
      const entry = entryFor(token, uid);
      if (!entry) return sendJson(401, { message: "invalid_token" });
      const roles = entry.roles.map((r) => r.role.toLowerCase());
      const isStaff = roles.some((r) => STAFF_ROLES.has(r));
      const isAdmin = roles.some((r) => ADMIN_ROLES.has(r));
      if (fn === "is_admin") return sendJson(200, isAdmin);
      if (fn === "is_staff") return sendJson(200, isStaff);
      if (fn === "has_role") return sendJson(200, roles.includes(String(vals.find((v) => !v.includes("-")) || "").toLowerCase()));
      if (fn === "has_permission") return sendJson(200, false);
      if (fn === "can_manage") return sendJson(200, isStaff);
      return sendJson(200, false);
    }

    // PostgREST user_roles
    if (url.pathname.startsWith("/rest/v1/user_roles")) {
      const uid = (url.searchParams.get("user_id") || "").replace(/^eq\./, "");
      const entry = entryFor(token, uid);
      if (!entry) return sendJson(401, { message: "invalid_token" });
      return sendJson(200, entry.roles);
    }

    return sendJson(404, { message: `mock: unhandled ${url.pathname}` });
  });
});

await new Promise<void>((r) => mock.listen(0, "127.0.0.1", r));
const mockPort = (mock.address() as AddressInfo).port;

process.env.SUPABASE_URL = `http://127.0.0.1:${mockPort}`;
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test";
process.env.SUPABASE_PUBLISHABLE_KEY = "publishable-test";

const { default: dispatch } = await import("../server/routes/dispatch.js");

/* ---------------- request harness ---------------- */
function mockRes() {
  const chunks: string[] = [];
  const res: {
    statusCode: number;
    status: (c: number) => typeof res;
    json: (b: unknown) => void;
    setHeader: (k: string, v: string) => void;
    end: (s?: string) => void;
    _body: () => string;
  } = {
    statusCode: 200,
    status(c) {
      res.statusCode = c;
      return res;
    },
    json(b) {
      chunks.push(JSON.stringify(b));
    },
    setHeader() {},
    end(s) {
      if (s) chunks.push(s);
    },
    _body: () => chunks.join(""),
  };
  return res;
}

async function call(method: string, path: string, token: string | null, body?: unknown) {
  const req: Record<string, unknown> = {
    url: path,
    method,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    query: {},
    body,
  };
  const res = mockRes();
  await dispatch(req as never, res as never);
  return res.statusCode;
}

/* ---------------- the privileged surface ---------------- */
// [method, path, body, control token that must pass the gate]
// (/api/admin/roles requires a full admin — a coach must get 403 there.)
const ROUTES: [string, string, unknown?, string?][] = [
  ["GET", "/api/admin/students", undefined, "staff.jwt"],
  ["POST", "/api/admin/graduation", { action: "resend", certificateId: "CERT-TEST" }, "staff.jwt"],
  ["POST", "/api/admin/roles", { action: "grant", userId: STUDENT, role: "coach" }, "admin.jwt"],
  ["POST", "/api/admin/skills", { action: "save", skillKey: "graphic", regOpen: true }, "staff.jwt"],
  ["GET", "/api/admin/content?kind=docs", undefined, "staff.jwt"],
  ["POST", "/api/admin/content", { kind: "setting", key: "settings", value: {} }, "staff.jwt"],
  ["POST", "/api/attendance", { action: "review", id: "x", status: "accepted" }, "staff.jwt"],
  ["POST", "/api/attendance", { action: "set-type", key: "class", open: true }, "staff.jwt"],
  ["POST", "/api/live", { action: "upsert-room", title: "test" }, "staff.jwt"],
];

let failures = 0;
console.log("route".padEnd(34), "no token", "student", "coach  ", "control");
console.log("-".repeat(70));
for (const [method, path, body, controlToken] of ROUTES) {
  const none = await call(method, path, null, body);
  const student = await call(method, path, "student.jwt", body);
  const staff = await call(method, path, "staff.jwt", body);
  const control = await call(method, path, controlToken || "staff.jwt", body);
  const coachBlockedRightly = path.includes("/admin/roles") ? staff === 403 : staff !== 401 && staff !== 403;
  const ok = none === 401 && student === 403 && coachBlockedRightly && control !== 401 && control !== 403;
  if (!ok) failures++;
  console.log(
    `${method} ${path.split("?")[0]}`.padEnd(34),
    String(none).padEnd(9),
    String(student).padEnd(8),
    String(staff).padEnd(8),
    `${control}${ok ? "" : "  <-- FAIL (expected 401 / 403 / staff / pass)"}`,
  );
}

mock.close();
console.log("-".repeat(62));
if (failures) {
  console.log(`${failures} route(s) FAILED the authorization gate.`);
  process.exit(1);
}
console.log("ALL ROUTES: 401 (no token) / 403 (student) / gate passed (staff) ✓");
