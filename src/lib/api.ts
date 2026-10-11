/**
 * KR8 Digitals — typed client for the secure server API (/api/*).
 *
 * All privileged reads/writes go through these endpoints, which verify the
 * Supabase Auth JWT and check `user_roles` on the server. The browser never
 * receives passwords, and never reads other people's phone / email / DOB.
 */
import { getSupabase } from "./supabase";

export type ApiAccount = {
  type: "student" | "tribe" | "founder" | "co-founder";
  executiveRole?: "Founder" | "Co-Founder";
  title?: string;
  id: string;
  name: string;
  email?: string;
  phone?: string;
  country?: string;
  skill?: string;
  dob?: string;
  year?: number;
  serial?: number;
  vip?: boolean;
  points?: number;
  attendanceAccepted?: number;
  submissions?: number;
  referrals?: number;
  graduated?: boolean;
  skills?: string[];
  graduatedSkills?: string[];
  previousIds?: string[];
  milestones?: string[];
  multiSkillCount?: number;
  certTier?: string | null;
  certRecognition?: string;
  certificateUrl?: string;
  verifyRemark?: string;
  graduatedAt?: number;
  certificates?: ApiCertificate[];
  notifications?: ApiNotification[];
  avatar?: string;
  joined?: number;
  isPlaceholder?: boolean;
  bio?: string;
  coverPhoto?: string;
  interests?: string[];
  portfolio?: { type: "image" | "video" | "link"; url: string; title: string }[];
  following?: string[];
  followers?: string[];
  messagePrivacy?: "Anyone" | "Friends only" | "No one";
  restricted?: boolean;
  admin?: { role: string; title?: string; permissions: string[] };
};

export type ApiCertificate = {
  id: string;
  studentId: string;
  studentName: string;
  formattedName: string;
  skill: string;
  skillName: string;
  tier: "Professionalism" | "Completion";
  templateUrl: string;
  achievementText: string;
  additionalNotes?: string;
  issuedAt: number;
  issuedBy?: string;
  status: "active" | "withdrawn";
  withdrawalReason?: string;
  withdrawnAt?: number;
  withdrawnBy?: string;
  certificateImageUrl?: string;
  pdfUrl?: string;
};

export type ApiNotification = {
  id: string;
  type: "graduation" | "withdrawal" | "achievement" | "info";
  title: string;
  message: string;
  reason?: string;
  certificateId?: string;
  skill?: string;
  skillName?: string;
  tier?: string;
  timestamp: number;
  read: boolean;
};

export class ApiClientError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function accessToken(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getSession();
    return data.session?.access_token || null;
  } catch {
    return null;
  }
}

export async function apiFetch<T = Record<string, unknown>>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.auth !== false) {
    const token = await accessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let res: Response;
  try {
    res = await fetch(path, {
      method: options.method || (options.body !== undefined ? "POST" : "GET"),
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiClientError(0, "Could not reach the KR8 server. Check your connection and try again.");
  }
  const data = (await res.json().catch(() => ({}))) as T & { ok?: boolean; error?: string };
  if (!res.ok || data.ok === false) {
    throw new ApiClientError(res.status, data.error || `Request failed (${res.status}).`);
  }
  return data;
}

/* ------------------------- auth ------------------------- */

export async function apiLogin(identifier: string, password: string) {
  return apiFetch<{
    ok: boolean;
    session: { access_token: string; refresh_token: string; expires_at?: number } | null;
    account: ApiAccount;
  }>("/api/auth/login", { method: "POST", body: { identifier, password }, auth: false });
}

export async function apiRegister(input: {
  name: string;
  email: string;
  phone: string;
  country: string;
  skill: string;
  dob: string;
  password: string;
  accountType?: "student" | "tribe";
  ref?: string;
}) {
  return apiFetch<{
    ok: boolean;
    session: { access_token: string; refresh_token: string; expires_at?: number } | null;
    account: ApiAccount;
  }>("/api/auth/register", { method: "POST", body: input, auth: false });
}

export async function apiTransition(skill: string) {
  return apiFetch<{ ok: boolean; account: ApiAccount }>("/api/auth/register", {
    method: "POST",
    body: { action: "transition", skill },
  });
}

export async function apiResetRequest(identifier: string) {
  return apiFetch<{ ok: boolean; message: string }>("/api/auth/reset", {
    method: "POST",
    body: { action: "request", identifier },
    auth: false,
  });
}

export async function apiResetComplete(identifier: string, code: string, password: string) {
  return apiFetch<{ ok: boolean; message: string }>("/api/auth/reset", {
    method: "POST",
    body: { action: "complete", identifier, code, password },
    auth: false,
  });
}

/* ------------------------- me ------------------------- */

export async function apiMe() {
  return apiFetch<{ ok: boolean; account: ApiAccount }>("/api/me");
}

export async function apiMePatch(patch: Record<string, unknown>) {
  return apiFetch<{ ok: boolean; account: ApiAccount }>("/api/me", { method: "PATCH", body: patch });
}

export async function apiMeAction(body: Record<string, unknown>) {
  return apiFetch<{ ok: boolean; message?: string }>("/api/me", { method: "POST", body });
}

/* ------------------------- admin ------------------------- */

export async function apiAdminRoster() {
  return apiFetch<{ ok: boolean; accounts: ApiAccount[] }>("/api/admin/students");
}

export async function apiAdminRegister(input: Record<string, unknown>) {
  return apiFetch<{ ok: boolean; kr8Id: string; temporaryPassword: string }>("/api/admin/students", {
    method: "POST",
    body: input,
  });
}

export async function apiAdminUpdateStudent(body: Record<string, unknown>) {
  return apiFetch<{ ok: boolean; account?: ApiAccount }>("/api/admin/students", {
    method: "PATCH",
    body,
  });
}

export async function apiAdminRevokeStudent(userId: string) {
  return apiFetch<{ ok: boolean; message?: string }>(
    `/api/admin/students?userId=${encodeURIComponent(userId)}`,
    { method: "DELETE" }
  );
}

export async function apiGraduation(body: Record<string, unknown>) {
  return apiFetch<{
    ok: boolean;
    account?: ApiAccount;
    certificate?: ApiCertificate;
    emailSent?: boolean;
    error?: string;
    message?: string;
  }>("/api/admin/graduation", { method: "POST", body });
}

export async function apiAdminContent(body: Record<string, unknown>) {
  return apiFetch<{ ok: boolean }>("/api/admin/content", { method: "POST", body });
}

export async function apiAdminSkills(body: Record<string, unknown>) {
  return apiFetch<{ ok: boolean }>("/api/admin/skills", { method: "POST", body });
}

export async function apiAdminRoles(body: Record<string, unknown>) {
  return apiFetch<{ ok: boolean }>("/api/admin/roles", { method: "POST", body });
}

/* ------------------------- attendance ------------------------- */

export async function apiAttendanceMine() {
  return apiFetch<{ ok: boolean; submissions: Record<string, unknown>[] }>("/api/attendance");
}

export async function apiAttendanceAll() {
  return apiFetch<{ ok: boolean; submissions: Record<string, unknown>[]; types: Record<string, boolean> }>(
    "/api/attendance?all=1"
  );
}

export async function apiAttendanceAction(body: Record<string, unknown>) {
  return apiFetch<{ ok: boolean; submission?: Record<string, unknown>; types?: Record<string, boolean> }>(
    "/api/attendance",
    { method: "POST", body }
  );
}

/* ------------------------- public ------------------------- */

export async function apiSite() {
  return apiFetch<{
    ok: boolean;
    site: {
      docs: Record<string, unknown>;
      settings: Record<string, unknown>;
      skills: {
        key: string;
        name: string;
        suffix?: string;
        whatsapp: string;
        available: boolean;
        regOpen: boolean;
      }[];
      announcements: Record<string, unknown>[];
      testimonials: Record<string, unknown>[];
      teamMembers: Record<string, unknown>[];
      feed: Record<string, unknown>[];
      counts: { students: number; tribe: number; graduated: number };
    };
  }>("/api/site", { auth: false });
}

export async function apiVerify(id: string, cert?: string) {
  return apiFetch<{
    ok: boolean;
    account?: ApiAccount;
    certificate?: ApiCertificate;
    certificates?: ApiCertificate[];
    isWithdrawn?: boolean;
    withdrawalReason?: string;
    withdrawnAt?: number;
  }>("/api/verify", { method: "POST", body: { id, cert }, auth: false });
}

export async function apiLeaderboard(limit = 50) {
  return apiFetch<{ ok: boolean; rows: ApiAccount[] }>(`/api/leaderboard?limit=${limit}`, { auth: false });
}

export async function apiActivity(body?: Record<string, unknown>) {
  if (body) return apiFetch<{ ok: boolean }>("/api/activity", { method: "POST", body });
  return apiFetch<{ ok: boolean; feed: Record<string, unknown>[] }>("/api/activity", { auth: false });
}

/* ------------------------- live ------------------------- */

export async function apiLiveKitToken(room: string, role: string) {
  return apiFetch<{ ok: boolean; token: string; url: string; identity: string; name: string; canPublish: boolean }>(
    "/api/livekit",
    { method: "POST", body: { room, role } }
  );
}

export async function apiLive(body?: Record<string, unknown>, query = "") {
  if (body) return apiFetch<{ ok: boolean; room?: unknown; message?: unknown }>("/api/live", { method: "POST", body });
  return apiFetch<{ ok: boolean; room?: unknown; messages?: unknown[]; recordings?: unknown[] }>(
    `/api/live${query}`,
    { auth: false }
  );
}

/* ------------------------- mindset ------------------------- */

export async function apiMindset(body?: Record<string, unknown>, query = "") {
  if (body) return apiFetch<{ ok: boolean; registration?: Record<string, unknown> }>("/api/mindset", { method: "POST", body });
  return apiFetch<{ ok: boolean; events?: unknown[]; registrations?: unknown[] }>(`/api/mindset${query}`);
}

/* ------------------------- social ------------------------- */

export async function apiSocial(kind: string, body?: Record<string, unknown>, query = "") {
  const path = `/api/social?kind=${encodeURIComponent(kind)}${query}`;
  if (body) return apiFetch<{ ok: boolean } & Record<string, unknown>>(path, { method: "POST", body });
  return apiFetch<{ ok: boolean } & Record<string, unknown>>(path);
}
