/**
 * /api/admin/students — role-checked student registry.
 *   GET    → roster via admin_list_students(p_search, p_skill, p_status,
 *            p_limit, p_offset) + admin_overview() (private fields allowed —
 *            server checks is_admin/is_staff)
 *   POST   → admin registration: creates the Supabase Auth user; the
 *            handle_new_user trigger creates the profile and generates the
 *            KR8 ID (never generated in the browser or by hand here)
 *   PATCH  → update a student (profile fields, XP, graduation flags, roles…)
 *   DELETE → revoke a registration (keeps history)
 *
 * Every request is verified ON THE SERVER. The browser never lists or edits
 * students through the public key.
 */
import {
  accountToRowPatch,
  admin,
  ApiError,
  findProfileByIdentifier,
  handler,
  logActivity,
  normalizeEmail,
  normalizePhone,
  queryStr,
  readBody,
  requireAdmin,
  send,
  toLegacyAccount,
  type ApiRequest,
  type ApiResponse,
  type RoleRow,
} from "../../lib.js";

function avatarFor(name: string, id: string): string {
  const parts = (name || "Creator").trim().split(/\s+/).filter(Boolean);
  const label =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : (name || "K").slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="60" fill="#8b5cf6"/><text x="60" y="66" fill="#fff" font-family="system-ui" font-size="44" font-weight="700" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg + id)}`;
}

async function profileById(ref: string): Promise<Record<string, unknown> | null> {
  const raw = (ref || "").trim();
  if (!raw) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);
  if (isUuid) {
    const { data } = await admin().from("profiles").select("*").eq("id", raw).maybeSingle();
    if (data) return data as Record<string, unknown>;
  }
  try {
    const { data } = await admin().rpc("get_profile_by_kr8_id", { lookup_id: raw });
    const row = Array.isArray(data) ? data[0] : data;
    if (row && (row as Record<string, unknown>).id) return row as Record<string, unknown>;
  } catch {
    /* fall through */
  }
  const { data } = await admin()
    .from("profiles")
    .select("*")
    .ilike("kr8_id", raw.replace(/[^A-Za-z0-9]/g, "%"))
    .limit(5);
  const rows = (data || []) as Record<string, unknown>[];
  return rows[0] || null;
}

async function enrich(rows: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
  const ids = rows.map((r) => String(r.id)).filter(Boolean);
  const [{ data: certs }, { data: notifs }, { data: roles }] = await Promise.all([
    admin().from("certificates").select("*").in("student_id", ids),
    admin().from("notifications").select("*").in("student_id", ids).order("created_at", { ascending: false }),
    admin().from("user_roles").select("user_id, role, permissions, title").in("user_id", ids),
  ]);
  const by = <T,>(list: T[] | null, key: (t: T) => string) => {
    const m = new Map<string, T[]>();
    for (const item of list || []) {
      const k = key(item);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(item);
    }
    return m;
  };
  const certsBy = by(certs as Record<string, unknown>[] | null, (c) => String(c.student_id));
  const notifsBy = by(notifs as Record<string, unknown>[] | null, (n) => String(n.student_id));
  const rolesBy = by(roles as { user_id: string; role: string; permissions?: string[]; title?: string }[] | null, (r) => String(r.user_id));

  return rows.map((row) =>
    toLegacyAccount(row, {
      certificates: certsBy.get(String(row.id)) || [],
      notifications: notifsBy.get(String(row.id)) || [],
      roles: ((rolesBy.get(String(row.id)) || []) as RoleRow[]) || [],
      includePrivate: true,
    })
  );
}

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  const ctx = await requireAdmin(req);

  if (req.method === "GET") {
    // Preferred path: the project's own admin_list_students(...) +
    // admin_overview() functions. Falls back to a direct service-role read if
    // the functions are unavailable so the tab never blanks out.
    const search = queryStr(req, "search") || queryStr(req, "q") || "";
    const skill = queryStr(req, "skill") || "";
    const status = queryStr(req, "status") || "";
    const limit = Math.min(Number(queryStr(req, "limit") || 500) || 500, 1000);
    const offset = Math.max(Number(queryStr(req, "offset") || 0) || 0, 0);

    let rows: Record<string, unknown>[] | null = null;
    try {
      const { data, error } = await admin().rpc("admin_list_students", {
        p_search: search || null,
        p_skill: skill || null,
        p_status: status || null,
        p_limit: limit,
        p_offset: offset,
      });
      if (!error && data) rows = data as Record<string, unknown>[];
    } catch {
      /* fall back */
    }

    if (!rows) {
      const { data } = await admin()
        .from("profiles")
        .select("*")
        .order("joined", { ascending: true })
        .range(offset, offset + limit - 1);
      rows = (data || []) as Record<string, unknown>[];
    }

    // admin_list_students may return either profile rows or nested rows.
    const profileRows = rows.map((r) =>
      r && typeof r === "object" && (r.profile || r.profiles)
        ? ((r.profile || r.profiles) as Record<string, unknown>)
        : r
    );
    const accounts = await enrich(profileRows.filter((r) => r && r.id));

    let overview: Record<string, unknown> | null = null;
    try {
      const { data } = await admin().rpc("admin_overview");
      overview = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
    } catch {
      /* optional */
    }

    send(res, 200, { ok: true, accounts, overview });
    return;
  }

  if (req.method === "POST") {
    // Admin-initiated registration. The KR8 ID is generated by the
    // handle_new_user trigger — never here and never in the browser.
    const body = await readBody(req);
    const name = String(body.name || "").trim();
    const email = normalizeEmail(String(body.email || ""));
    const phone = normalizePhone(String(body.phone || ""));
    const skill = String(body.skill || "").trim();
    const country = String(body.country || "NG");
    const dob = String(body.dob || "");
    const password = String(body.password || "") || `KR8-${Math.random().toString(36).slice(2, 10)}`;
    if (!name || !email || !phone) throw new ApiError(400, "Name, email and phone are required.");
    if (await findProfileByIdentifier(email)) throw new ApiError(409, "An account with this email already exists.");

    const { data: created, error: createErr } = await admin().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, skill, phone, country, dob },
    });
    if (createErr || !created?.user) throw new ApiError(400, createErr?.message || "Could not create the student account.");

    // handle_new_user already created the profile; read it back for the ID.
    let profile: Record<string, unknown> | null = null;
    for (let i = 0; i < 6 && !profile; i++) {
      const { data } = await admin().from("profiles").select("*").eq("id", created.user.id).maybeSingle();
      profile = (data as Record<string, unknown>) || null;
      if (!profile) await new Promise((r) => setTimeout(r, 250));
    }
    const kr8Id = String(profile?.kr8_id || "");
    if (profile && !profile.avatar) {
      await admin().from("profiles").update({ avatar: avatarFor(name, kr8Id) }).eq("id", created.user.id);
      profile.avatar = avatarFor(name, kr8Id);
    }

    try {
      await admin()
        .from("enrollments")
        .insert({ student_id: created.user.id, kr8_id: kr8Id, skill, status: "active" });
    } catch {
      /* best-effort */
    }
    await logActivity({ kind: "registration", name, skill, customAction: "joined the Academy (admin registration)" });

    send(res, 200, { ok: true, kr8Id, temporaryPassword: password });
    return;
  }

  if (req.method === "PATCH") {
    const body = await readBody(req);
    const userId = String(body.userId || "");
    const kr8Id = String(body.id || "");
    if (!userId && !kr8Id) throw new ApiError(400, "Missing student reference.");

    const row = (await profileById(userId || kr8Id)) || null;
    if (!row) throw new ApiError(404, "Student not found.");
    const targetId = String(row.id);

    const patchInput = (body.patch && typeof body.patch === "object" ? body.patch : body) as Record<string, unknown>;
    const safe: Record<string, unknown> = { ...patchInput };
    // Server-owned fields — a role-checked admin may set them, but only here.
    delete safe.certificates;
    delete safe.notifications;
    delete safe.password;
    delete safe.resetCode;
    delete safe.userId;

    const patch = accountToRowPatch(safe);
    if (Object.keys(patch).length > 0) {
      await admin().from("profiles").update(patch).eq("id", targetId);
    }

    // Optional role updates (user_roles).
    if (body.grantRole || body.revokeRole) {
      if (!ctx.isAdmin) throw new ApiError(403, "Only full admins can change roles.");
      if (body.grantRole) {
        await admin()
          .from("user_roles")
          .upsert({ user_id: targetId, role: String(body.grantRole), permissions: body.permissions || [], granted_by: ctx.user.id, title: body.title || null });
      }
      if (body.revokeRole) {
        await admin()
          .from("user_roles")
          .delete()
          .eq("user_id", targetId)
          .eq("role", String(body.revokeRole));
      }
    }

    const fresh = await profileById(targetId);
    const accounts = fresh ? await enrich([fresh]) : [];
    send(res, 200, { ok: true, account: accounts[0] || null });
    return;
  }

  if (req.method === "DELETE") {
    const body = await readBody(req).catch(() => ({}) as Record<string, unknown>);
    const targetId = queryStr(req, "userId") || String(body.userId || "");
    const kr8Id = queryStr(req, "id") || String(body.kr8Id || body.ref || "");
    const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
    let userId = isUuid(targetId) ? targetId : "";
    if (!userId) {
      const row = await profileById(kr8Id || targetId);
      userId = String(row?.id || "");
    }
    if (!userId) throw new ApiError(400, "Missing student reference.");
    if (userId === ctx.user.id) throw new ApiError(400, "You cannot revoke your own registration.");

    // Revoke = unenrolled + auth user removed. Their KR8 ID is kept on record.
    try {
      await admin()
        .from("enrollments")
        .update({ status: "revoked" })
        .eq("student_id", userId);
    } catch {
      /* best-effort */
    }
    await admin().auth.admin.deleteUser(userId).catch(() => undefined);

    send(res, 200, { ok: true, message: "Registration revoked." });
    return;
  }

  throw new ApiError(405, "Method not allowed.");
});
