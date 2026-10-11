/**
 * KR8 Digitals — shared server runtime library (Vercel Functions).
 *
 * SECURITY MODEL
 * - The service-role key is read ONLY here (server code). It is never shipped
 *   to the browser and must never appear in a VITE_ variable.
 * - Every privileged endpoint calls `requireUser` / `requireAdmin`, which
 *   verify the Supabase Auth JWT and check `user_roles` ON THE SERVER.
 * - Plaintext passwords are never read, written or returned. Authentication
 *   is delegated entirely to Supabase Auth (email + password).
 */
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

/* ------------------------------------------------------------------ */
/* Minimal Vercel-style request/response shapes                        */
/* ------------------------------------------------------------------ */

export type ApiRequest = IncomingMessage & {
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
  url?: string;
};

export type ApiResponse = ServerResponse & {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/* ------------------------------------------------------------------ */
/* Environment                                                         */
/* ------------------------------------------------------------------ */

const env = (name: string, fallbackNames: string[] = []): string => {
  const direct = process.env[name];
  if (direct && direct.trim()) return direct.trim();
  for (const alt of fallbackNames) {
    const v = process.env[alt];
    if (v && v.trim()) return v.trim();
  }
  return "";
};

export const SUPABASE_URL = env("SUPABASE_URL", ["VITE_SUPABASE_URL"]);
export const SERVICE_ROLE_KEY = env("SUPABASE_SERVICE_ROLE_KEY");
export const PUBLISHABLE_KEY = env("SUPABASE_PUBLISHABLE_KEY", [
  "SUPABASE_ANON_KEY",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_ANON_KEY",
]);
export const LIVEKIT_URL = env("LIVEKIT_URL", ["VITE_LIVEKIT_URL"]);
export const LIVEKIT_API_KEY = env("LIVEKIT_API_KEY");
export const LIVEKIT_API_SECRET = env("LIVEKIT_API_SECRET");
export const RESEND_API_KEY = env("RESEND_API_KEY");
export const RESEND_FROM = env("RESEND_FROM");
export const SITE_URL = env("SITE_URL", ["VITE_SITE_URL"]);

/* ------------------------------------------------------------------ */
/* Supabase clients (server only)                                      */
/* ------------------------------------------------------------------ */

let adminInstance: SupabaseClient | null = null;
export function admin(): SupabaseClient {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new ApiError(500, "Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
  }
  if (!adminInstance) {
    adminInstance = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminInstance;
}

let authInstance: SupabaseClient | null = null;
/** Anon-key client used only for `signInWithPassword` (Supabase Auth). */
export function authClient(): SupabaseClient {
  if (!SUPABASE_URL || !PUBLISHABLE_KEY) {
    throw new ApiError(500, "Server is missing the Supabase publishable key.");
  }
  if (!authInstance) {
    authInstance = createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return authInstance;
}

/* ------------------------------------------------------------------ */
/* HTTP helpers                                                        */
/* ------------------------------------------------------------------ */

export function applyCors(res: ServerResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-kr8-admin-token");
}

export function send(res: ApiResponse, status: number, body: unknown): void {
  applyCors(res);
  if (!res.headersSent) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
  }
  res.end(JSON.stringify(body));
}

export async function readBody(req: ApiRequest): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === "object") return req.body as Record<string, unknown>;
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new ApiError(400, "Invalid JSON body.");
  }
}

export function queryStr(req: ApiRequest, name: string): string {
  const q = req.query?.[name];
  if (Array.isArray(q)) return q[0] || "";
  return q || "";
}

/** Wrap a handler: JSON errors, CORS pre-flight, never leak stack traces. */
export function handler(
  fn: (req: ApiRequest, res: ApiResponse) => Promise<void>
): (req: ApiRequest, res: ApiResponse) => Promise<void> {
  return async (req, res) => {
    applyCors(res as unknown as ServerResponse);
    if (req.method === "OPTIONS") {
      (res as unknown as ServerResponse).statusCode = 204;
      (res as unknown as ServerResponse).end();
      return;
    }
    try {
      await fn(req, res);
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 500;
      const message =
        err instanceof ApiError ? err.message : "Unexpected server error. Please try again.";
      if (!(err instanceof ApiError)) {
        // Server-side log only — never sent to the client.
        console.error("[api]", (err as Error)?.message || err);
      }
      send(res, status, { ok: false, error: message });
    }
  };
}

/* ------------------------------------------------------------------ */
/* Identity helpers (mirror the legacy client rules)                   */
/* ------------------------------------------------------------------ */

export const COHORT_YEAR = 2026;

export function normalizeEmail(value: string): string {
  return (value || "").trim().toLowerCase();
}

export function normalizePhone(value: string): string {
  const compact = (value || "").trim().replace(/[\s().-]/g, "");
  if (!compact) return "";
  if (compact.startsWith("+")) return compact;
  if (compact.startsWith("00")) return `+${compact.slice(2)}`;
  if (compact.startsWith("0")) return `+234${compact.slice(1)}`;
  return `+234${compact}`;
}

export function normalizeIdentity(value: string): string {
  return (value || "").trim().replace(/[\s-]/g, "").toUpperCase();
}

function initials(name: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "X";
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? "X";
  return (a + b).toUpperCase();
}

export const DEFAULT_SKILL_SUFFIX: Record<string, string> = {
  graphic: "GDVFD",
  video: "VEVFD",
  web: "WDVFD",
  frontend: "FEDVFD",
  content_creation: "CCVFD",
  smm: "SMMVFD",
  marketing: "DMVFD",
};

export function skillSuffix(skillKey: string, fromSettings?: string | null): string {
  if (fromSettings && fromSettings.trim()) return fromSettings.trim().toUpperCase();
  return DEFAULT_SKILL_SUFFIX[skillKey] || `${(skillKey || "KR8").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4)}VFD`;
}

/** Same format as the legacy client `kr8id()`: KR8<YEAR><INITIALS><SERIAL4><SUFFIX> */
export function buildKr8Id(name: string, skillKey: string, serial: number, suffix: string): string {
  return `KR8${COHORT_YEAR}${initials(name)}${String(serial).padStart(4, "0")}${suffix}`;
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hashCode6(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function randomToken(bytes = 24): string {
  return randomBytes(bytes).toString("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/* ------------------------------------------------------------------ */
/* Auth: verify Supabase JWT + server-side role checks                 */
/* ------------------------------------------------------------------ */

export type AuthUser = User;

export async function getUserFromRequest(req: ApiRequest): Promise<AuthUser | null> {
  const header = req.headers["authorization"] || req.headers["Authorization"];
  const raw = Array.isArray(header) ? header[0] : header;
  const token = raw && raw.startsWith("Bearer ") ? raw.slice(7).trim() : "";
  if (!token) return null;
  try {
    const { data, error } = await admin().auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

export async function requireUser(req: ApiRequest): Promise<AuthUser> {
  const user = await getUserFromRequest(req);
  if (!user) throw new ApiError(401, "Sign in required.");
  return user;
}

export type RoleRow = { role: string; permissions?: string[] | null };

export async function getRoles(userId: string): Promise<RoleRow[]> {
  const { data } = await admin()
    .from("user_roles")
    .select("role, permissions")
    .eq("user_id", userId);
  return (data || []) as RoleRow[];
}

export const ADMIN_ROLES = new Set(["admin", "founder", "co-founder"]);
export const STAFF_ROLES = new Set(["admin", "founder", "co-founder", "coach", "assistant", "attendance_reviewer"]);

export function isAdminRole(roles: RoleRow[]): boolean {
  return roles.some((r) => ADMIN_ROLES.has((r.role || "").toLowerCase()));
}

export function isStaffRole(roles: RoleRow[]): boolean {
  return roles.some((r) => STAFF_ROLES.has((r.role || "").toLowerCase()));
}

export type AdminContext = {
  user: AuthUser;
  roles: RoleRow[];
  isAdmin: boolean;
  isStaff: boolean;
  isAttendanceReviewerOnly: boolean;
  displayName: string;
};

export async function requireAdmin(req: ApiRequest): Promise<AdminContext> {
  const user = await requireUser(req);
  const roles = await getRoles(user.id);
  const isAdmin = isAdminRole(roles);
  const isStaff = isStaffRole(roles);
  if (!isStaff) throw new ApiError(403, "Administrator role required.");
  const onlyReviewer =
    !isAdmin && roles.every((r) => (r.role || "").toLowerCase() === "attendance_reviewer");
  return {
    user,
    roles,
    isAdmin,
    isStaff,
    isAttendanceReviewerOnly: onlyReviewer,
    displayName: (user.user_metadata?.name as string) || user.email || "KR8 Administrator",
  };
}

/* ------------------------------------------------------------------ */
/* Row <-> legacy-shaped mappers (NEVER include password/reset codes)  */
/* ------------------------------------------------------------------ */

type Row = Record<string, unknown>;

export function epochMs(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value) {
    const n = Number(value);
    if (!Number.isNaN(n) && n > 0) return n;
    const t = Date.parse(value);
    if (!Number.isNaN(t)) return t;
  }
  return Date.now();
}

export function toLegacyCertificate(row: Row): Record<string, unknown> {
  const extra = (row.extra as Record<string, unknown>) || {};
  return {
    id: row.certificate_code,
    studentId: row.kr8_id,
    studentName: row.student_name,
    formattedName: extra.formattedName || String(row.student_name || "").toUpperCase(),
    skill: row.skill,
    skillName: extra.skillName || row.skill,
    tier: row.tier,
    templateUrl: extra.templateUrl || `/certificates/reusable_${String(row.tier || "Completion").toLowerCase()}.png`,
    achievementText: extra.achievementText || "",
    additionalNotes: extra.additionalNotes || row.cert_recognition || undefined,
    issuedAt: epochMs(row.issued_at),
    issuedBy: row.issued_by || undefined,
    status: row.status === "withdrawn" ? "withdrawn" : "active",
    withdrawalReason: extra.withdrawalReason || undefined,
    withdrawnAt: row.withdrawn_at ? epochMs(row.withdrawn_at) : undefined,
    withdrawnBy: extra.withdrawnBy || undefined,
    certificateImageUrl: extra.certificateImageUrl || undefined,
    pdfUrl: extra.pdfUrl || undefined,
  };
}

export function toLegacyNotification(row: Row): Record<string, unknown> {
  return {
    id: row.id,
    type: row.type || "info",
    title: row.title,
    message: row.message,
    reason: row.reason || undefined,
    certificateId: row.certificate_id || undefined,
    skill: row.skill || undefined,
    skillName: row.skill_name || undefined,
    tier: row.tier || undefined,
    timestamp: epochMs(row.created_at),
    read: !!row.read,
  };
}

export function adminFromRoles(roles: RoleRow[]): Record<string, unknown> | undefined {
  const primary = roles.find((r) => ADMIN_ROLES.has((r.role || "").toLowerCase())) || roles[0];
  if (!primary) return undefined;
  const role = (primary.role || "").toLowerCase();
  return {
    role: role === "founder" || role === "co-founder" ? "ultimate" : role === "admin" ? "admin" : role,
    title: (primary as { title?: string }).title || (role === "founder" ? "Founder & CEO" : role === "co-founder" ? "Co-Founder" : role),
    permissions: primary.permissions || [],
  };
}

export function toLegacyAccount(
  row: Row,
  opts: {
    certificates?: Row[];
    notifications?: Row[];
    roles?: RoleRow[];
    includePrivate?: boolean;
  } = {}
): Record<string, unknown> {
  const extra = (row.extra as Record<string, unknown>) || {};
  const certs = (opts.certificates || []).map(toLegacyCertificate);
  const notifs = (opts.notifications || []).map(toLegacyNotification);
  const adminInfo = adminFromRoles(opts.roles || []);

  const account: Record<string, unknown> = {
    type: extra.type || "student",
    executiveRole: extra.executiveRole || undefined,
    title: extra.title || undefined,
    id: row.kr8_id,
    name: row.name,
    country: row.country || "NG",
    skill: row.skill || "",
    year: extra.year || COHORT_YEAR,
    serial: extra.serial || undefined,
    vip: !!extra.vip,
    points: Number(row.points || 0),
    attendanceAccepted: Number(extra.attendanceAccepted || 0),
    submissions: Number(extra.submissions || 0),
    referrals: Number(row.referrals || 0),
    graduated: !!row.graduated,
    skills: extra.skills || (row.skill ? [row.skill] : []),
    graduatedSkills: extra.graduatedSkills || [],
    previousIds: extra.previousIds || [],
    milestones: extra.milestones || [],
    multiSkillCount: extra.multiSkillCount || undefined,
    certTier: row.cert_tier || (row.graduated ? "Completion" : null),
    certRecognition: row.cert_recognition || undefined,
    certificateUrl: extra.certificateUrl || undefined,
    certificateFileType: extra.certificateFileType || undefined,
    verifyRemark: extra.verifyRemark || undefined,
    graduatedAt: extra.graduatedAt || undefined,
    certificates: certs,
    notifications: notifs,
    avatar: row.avatar || "",
    joined: epochMs(row.joined || row.created_at),
    expandedVisibility: extra.expandedVisibility ?? undefined,
    isPlaceholder: !!extra.isPlaceholder,
    bio: row.bio || undefined,
    coverPhoto: extra.coverPhoto || undefined,
    interests: extra.interests || undefined,
    portfolio: extra.portfolio || [],
    following: extra.following || [],
    followers: extra.followers || [],
    messagePrivacy: extra.messagePrivacy || "Anyone",
    restricted: extra.restricted || undefined,
    admin: adminInfo,
  };

  if (opts.includePrivate) {
    // Private fields are ONLY included on authenticated, role-checked
    // endpoints (own profile or admin roster). Never through the public key.
    account.email = row.email;
    account.phone = row.phone;
    account.dob = row.dob || undefined;
  }
  return account;
}

export function accountToRowPatch(
  patch: Record<string, unknown>,
  existingExtra: Record<string, unknown> = {}
): Record<string, unknown> {
  const extra: Record<string, unknown> = { ...existingExtra };
  const row: Record<string, unknown> = {};

  const direct: Record<string, string> = {
    name: "name",
    email: "email",
    phone: "phone",
    country: "country",
    skill: "skill",
    dob: "dob",
    avatar: "avatar",
    bio: "bio",
    points: "points",
    referrals: "referrals",
    graduated: "graduated",
    certTier: "cert_tier",
    certRecognition: "cert_recognition",
    type: "type",
  };
  for (const [from, to] of Object.entries(direct)) {
    if (patch[from] !== undefined) {
      row[to] = patch[from] === "" ? null : patch[from];
      if (from === "type") extra.type = patch[from];
      delete extra[from === "type" ? "type" : from];
    }
  }
  if (patch.email !== undefined) row.email = normalizeEmail(String(patch.email));
  if (patch.phone !== undefined) row.phone_normalized = normalizePhone(String(patch.phone));

  const extraKeys = [
    "executiveRole",
    "title",
    "year",
    "serial",
    "vip",
    "attendanceAccepted",
    "submissions",
    "skills",
    "graduatedSkills",
    "previousIds",
    "milestones",
    "multiSkillCount",
    "certificateUrl",
    "certificateFileType",
    "verifyRemark",
    "graduatedAt",
    "expandedVisibility",
    "isPlaceholder",
    "coverPhoto",
    "interests",
    "portfolio",
    "following",
    "followers",
    "messagePrivacy",
    "restricted",
    "type",
  ];
  for (const key of extraKeys) {
    if (patch[key] !== undefined) extra[key] = patch[key];
  }
  row.extra = extra;
  return row;
}

/* ------------------------------------------------------------------ */
/* mailer (Resend) — used ONLY server-side                             */
/* ------------------------------------------------------------------ */

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  kind: string;
}): Promise<{ sent: boolean; id?: string; error?: string }> {
  const log = async (status: string, error?: string, externalId?: string) => {
    try {
      await admin().from("email_logs").insert({
        to_email: opts.to,
        subject: opts.subject,
        kind: opts.kind,
        status,
        error: error || null,
        external_id: externalId || null,
      });
    } catch {
      /* logging is best-effort */
    }
  };
  if (!RESEND_API_KEY || !RESEND_FROM) {
    await log("skipped", "RESEND_API_KEY / RESEND_FROM not configured");
    return { sent: false, error: "Email service is not configured." };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      await log("failed", data.message || `HTTP ${res.status}`);
      return { sent: false, error: data.message || "Email could not be sent." };
    }
    await log("sent", undefined, data.id);
    return { sent: true, id: data.id };
  } catch (err) {
    await log("failed", (err as Error).message);
    return { sent: false, error: "Email could not be sent." };
  }
}

export function emailShell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#0b0620;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#140a2e;border-radius:16px;padding:32px;border:1px solid #2a1b52;">
    <h1 style="color:#ffffff;font-size:22px;margin:0 0 8px;">KR8 Digitals</h1>
    <h2 style="color:#f472b6;font-size:18px;margin:0 0 16px;">${title}</h2>
    <div style="color:#cabfe0;font-size:14px;line-height:1.7;">${bodyHtml}</div>
    <p style="color:#6f6390;font-size:12px;margin-top:28px;">Think It. KR8 It. — KR8 Digitals Academy</p>
  </div></body></html>`;
}

/* ------------------------------------------------------------------ */
/* LiveKit token minting (HS256 JWT — no external SDK needed)          */
/* ------------------------------------------------------------------ */

export function mintLiveKitToken(opts: {
  identity: string;
  name?: string;
  room: string;
  canPublish: boolean;
  canPublishData: boolean;
  roomAdmin?: boolean;
  ttlSeconds?: number;
}): string {
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new ApiError(500, "LiveKit is not configured on the server.");
  }
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (opts.ttlSeconds || 6 * 60 * 60);
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    iss: LIVEKIT_API_KEY,
    sub: opts.identity,
    name: opts.name || opts.identity,
    exp,
    nbf: now - 30,
    iat: now,
    video: {
      room: opts.room,
      roomJoin: true,
      roomCreate: !!opts.roomAdmin,
      roomAdmin: !!opts.roomAdmin,
      canPublish: opts.canPublish,
      canPublishData: opts.canPublishData,
      canSubscribe: true,
      canUpdateOwnMetadata: true,
    },
  };
  const b64 = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const signingInput = `${b64(header)}.${b64(payload)}`;
  const sig = createHmac("sha256", LIVEKIT_API_SECRET).update(signingInput).digest("base64url");
  return `${signingInput}.${sig}`;
}

/* ------------------------------------------------------------------ */
/* Misc shared helpers                                                 */
/* ------------------------------------------------------------------ */

export const PUBLIC_DOC_KEYS = new Set([
  "site_content",
  "homepage_settings",
  "announcement_bar",
  "payment_settings",
  "social_links",
  "xp_rules",
  "signatures",
  "waitlist_whatsapp",
  "curricula",
  "custom_skills",
  "founders",
  "team",
  "portfolio",
  "blog_posts",
  "attendance_types",
]);

export const ADMIN_DOC_KEYS = new Set([
  ...PUBLIC_DOC_KEYS,
  "suspended_accounts",
  "suspended_credentials",
  "settings",
  "client_requests_archive",
]);

export async function getDoc(key: string): Promise<Record<string, unknown> | null> {
  const { data } = await admin()
    .from("site_content")
    .select("data")
    .eq("key", key)
    .maybeSingle();
  return (data?.data as Record<string, unknown>) || null;
}

export async function setDoc(key: string, data: unknown, updatedBy?: string): Promise<void> {
  await admin()
    .from("site_content")
    .upsert({ key, data, updated_at: new Date().toISOString(), updated_by: updatedBy || null });
}

export async function getSetting(key: string): Promise<unknown> {
  const { data } = await admin()
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  return data?.value ?? null;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await admin()
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });
}

export async function logActivity(item: {
  kind: string;
  name: string;
  skill: string;
  avatar?: string;
  customAction?: string;
}): Promise<void> {
  try {
    await admin().from("activity_log").insert({
      kind: item.kind,
      name: item.name,
      skill: item.skill,
      avatar: item.avatar || null,
      custom_action: item.customAction || null,
    });
  } catch {
    /* best-effort */
  }
}

export async function findProfileByIdentifier(identifier: string): Promise<Row | null> {
  const q = (identifier || "").trim();
  if (!q) return null;
  const email = normalizeEmail(q);
  const phone = normalizePhone(q);
  const idNorm = normalizeIdentity(q);

  const ors = [`email.eq.${email}`];
  if (phone) ors.push(`phone_normalized.eq.${phone}`);
  ors.push(`kr8_id_normalized.eq.${idNorm}`);

  const { data } = await admin()
    .from("profiles")
    .select("*")
    .or(ors.join(","))
    .limit(1);
  if (data && data.length > 0) return data[0] as Row;

  // Legacy IDs may include separators — fall back to a normalized scan.
  const { data: byPrefix } = await admin()
    .from("profiles")
    .select("*")
    .ilike("kr8_id", idNorm.replace(/[^A-Z0-9]/gi, "%"))
    .limit(5);
  const rows = (byPrefix || []) as Row[];
  return rows.find((r) => normalizeIdentity(String(r.kr8_id || "")) === idNorm) || null;
}

export async function userRolesFor(userId: string): Promise<RoleRow[]> {
  return getRoles(userId);
}
