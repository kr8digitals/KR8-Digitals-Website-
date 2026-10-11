/**
 * /api/admin/students — role-checked student registry.
 *   GET    → full roster (private fields allowed — server checks user_roles)
 *   POST   → admin registration (server-generated KR8 ID, Supabase Auth user)
 *   PATCH  → update a student (profile fields, XP, graduation flags, roles…)
 *   DELETE → revoke a registration (keeps history; never drops auth user silently)
 *
 * Every request is verified against `user_roles` ON THE SERVER. The browser
 * never lists or edits students through the public key.
 */
import {
  ApiError,
  COHORT_YEAR,
  accountToRowPatch,
  admin,
  buildKr8Id,
  findProfileByIdentifier,
  getRoles,
  handler,
  isAdminRole,
  logActivity,
  normalizeEmail,
  normalizePhone,
  queryStr,
  readBody,
  requireAdmin,
  send,
  skillSuffix,
  toLegacyAccount,
  type ApiRequest,
  type ApiResponse,
  type RoleRow,
} from "../../server/lib";

function avatarFor(name: string, id: string): string {
  const parts = (name || "Creator").trim().split(/\s+/).filter(Boolean);
  const label =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : (name || "K").slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="60" fill="#8b5cf6"/><text x="60" y="66" fill="#fff" font-family="system-ui" font-size="44" font-weight="700" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg + id)}`;
}

async function loadRoster() {
  const [{ data: profiles }, { data: certs }, { data: notifs }, { data: roles }] = await Promise.all([
    admin().from("profiles").select("*").order("joined", { ascending: true }),
    admin().from("certificates").select("*"),
    admin().from("notifications").select("*").order("created_at", { ascending: false }),
    admin().from("user_roles").select("user_id, role, permissions"),
  ]);

  const certsByUser = new Map<string, Record<string, unknown>[]>();
  for (const c of (certs || []) as Record<string, unknown>[]) {
    const key = String(c.student_id);
    if (!certsByUser.has(key)) certsByUser.set(key, []);
    certsByUser.get(key)!.push(c);
  }
  const notifsByUser = new Map<string, Record<string, unknown>[]>();
  for (const n of (notifs || []) as Record<string, unknown>[]) {
    const key = String(n.student_id);
    if (!notifsByUser.has(key)) notifsByUser.set(key, []);
    notifsByUser.get(key)!.push(n);
  }
  const rolesByUser = new Map<string, RoleRow[]>();
  for (const r of (roles || []) as { user_id: string; role: string; permissions?: string[] }[]) {
    if (!rolesByUser.has(r.user_id)) rolesByUser.set(r.user_id, []);
    rolesByUser.get(r.user_id)!.push({ role: r.role, permissions: r.permissions });
  }

  return ((profiles || []) as Record<string, unknown>[]).map((row) =>
    toLegacyAccount(row, {
      certificates: certsByUser.get(String(row.id)) || [],
      notifications: notifsByUser.get(String(row.id)) || [],
      roles: rolesByUser.get(String(row.id)) || [],
      includePrivate: true,
    })
  );
}

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  const ctx = await requireAdmin(req);

  if (req.method === "GET") {
    const accounts = await loadRoster();
    send(res, 200, { ok: true, accounts });
    return;
  }

  if (req.method === "POST") {
    // Admin-initiated registration.
    const body = await readBody(req);
    const name = String(body.name || "").trim();
    const email = normalizeEmail(String(body.email || ""));
    const phone = normalizePhone(String(body.phone || ""));
    const skill = String(body.skill || "").trim();
    const country = String(body.country || "NG");
    const dob = String(body.dob || "");
    const password = String(body.password || "") || `KR8-${Math.random().toString(36).slice(2, 10)}`;
    if (!name || !email || !phone || !skill) throw new ApiError(400, "Name, email, phone and skill are required.");
    if (await findProfileByIdentifier(email)) throw new ApiError(409, "An account with this email already exists.");

    const { data: skillRow } = await admin().from("skill_settings").select("*").eq("skill", skill).maybeSingle();
    const suffix = skillSuffix(skill, (skillRow as { suffix?: string } | null)?.suffix || null);

    let kr8Id = "";
    let serial = 1;
    for (let attempt = 0; attempt < 8; attempt++) {
      const { data: serialRow } = await admin().rpc("next_kr8_serial", { p_skill: skill });
      serial = Number(serialRow || 1);
      kr8Id = buildKr8Id(name, skill, serial, suffix);
      const { data: clash } = await admin().from("profiles").select("id").eq("kr8_id", kr8Id).maybeSingle();
      if (!clash) break;
      kr8Id = "";
    }
    if (!kr8Id) throw new ApiError(500, "Could not allocate a unique KR8 ID.");

    const { data: created, error: createErr } = await admin().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, kr8_id: kr8Id },
    });
    if (createErr || !created?.user) throw new ApiError(400, createErr?.message || "Could not create the student account.");

    await admin().from("profiles").insert({
      id: created.user.id,
      kr8_id: kr8Id,
      kr8_id_normalized: kr8Id.replace(/[\s-]/g, "").toUpperCase(),
      name,
      email,
      phone,
      phone_normalized: phone,
      country,
      dob: dob || null,
      skill,
      avatar: avatarFor(name, kr8Id),
      points: 0,
      referrals: 0,
      graduated: false,
      joined: Date.now(),
      extra: {
        type: "student",
        year: COHORT_YEAR,
        serial,
        vip: false,
        attendanceAccepted: 0,
        submissions: 0,
        skills: [skill],
        graduatedSkills: [],
        previousIds: [],
        milestones: [`Enrolled in ${String((skillRow as { name?: string } | null)?.name || skill)}`],
        multiSkillCount: 1,
        portfolio: [],
        following: [],
        followers: [],
        messagePrivacy: "Anyone",
        isPlaceholder: false,
      },
    });
    await admin()
      .from("enrollments")
      .insert({ student_id: created.user.id, kr8_id: kr8Id, skill, status: "active" })
      .catch(() => undefined);
    await logActivity({ kind: "registration", name, skill: String((skillRow as { name?: string } | null)?.name || skill), customAction: "joined the Academy (admin registration)" });

    send(res, 200, { ok: true, kr8Id, temporaryPassword: password });
    return;
  }

  if (req.method === "PATCH") {
    const body = await readBody(req);
    const userId = String(body.userId || "");
    const kr8Id = String(body.id || "");
    if (!userId && !kr8Id) throw new ApiError(400, "Missing student reference.");

    let targetId = userId;
    if (!targetId) {
      const { data: row } = await admin()
        .from("profiles")
        .select("id")
        .eq("kr8_id_normalized", kr8Id.replace(/[\s-]/g, "").toUpperCase())
        .maybeSingle();
      targetId = String((row as { id?: string } | null)?.id || "");
    }
    if (!targetId) throw new ApiError(404, "Student not found.");

    const { data: row } = await admin().from("profiles").select("*").eq("id", targetId).maybeSingle();
    if (!row) throw new ApiError(404, "Student not found.");
    const existingExtra = ((row as Record<string, unknown>).extra as Record<string, unknown>) || {};

    const patchInput = (body.patch && typeof body.patch === "object" ? body.patch : body) as Record<string, unknown>;
    const safe: Record<string, unknown> = { ...patchInput };
    // Server-owned fields — a role-checked admin may set them, but only here.
    delete safe.certificates;
    delete safe.notifications;
    delete safe.password;
    delete safe.resetCode;

    const patch = accountToRowPatch(safe, existingExtra);
    await admin().from("profiles").update(patch).eq("id", targetId);

    // Optional role updates (user_roles).
    if (body.grantRole || body.revokeRole) {
      if (!isAdminRole(ctx.roles) && !ctx.isAdmin) throw new ApiError(403, "Only full admins can change roles.");
      if (body.grantRole) {
        await admin()
          .from("user_roles")
          .upsert({ user_id: targetId, role: String(body.grantRole), permissions: body.permissions || [], granted_by: ctx.user.id });
      }
      if (body.revokeRole) {
        await admin()
          .from("user_roles")
          .delete()
          .eq("user_id", targetId)
          .eq("role", String(body.revokeRole));
      }
    }

    const accounts = await loadRoster();
    const account = accounts.find((a) => a.id === (row as Record<string, unknown>).kr8_id);
    send(res, 200, { ok: true, account });
    return;
  }

  if (req.method === "DELETE") {
    const body = await readBody(req).catch(() => ({}) as Record<string, unknown>);
    const targetId = queryStr(req, "userId") || String(body.userId || "");
    const kr8Id = queryStr(req, "id") || String(body.kr8Id || body.ref || "");
    const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
    let userId = isUuid(targetId) ? targetId : "";
    if (!userId) {
      // Accept either the profiles uuid or the human KR8 ID in any field.
      const ref = (isUuid(targetId) ? targetId : kr8Id || targetId).replace(/[\s-]/g, "").toUpperCase();
      const { data: row } = await admin()
        .from("profiles")
        .select("id")
        .eq("kr8_id_normalized", ref)
        .maybeSingle();
      userId = String((row as { id?: string } | null)?.id || "");
    }
    if (!userId) throw new ApiError(400, "Missing student reference.");
    if (userId === ctx.user.id) throw new ApiError(400, "You cannot revoke your own registration.");

    const { data: row } = await admin().from("profiles").select("*").eq("id", userId).maybeSingle();
    if (!row) throw new ApiError(404, "Student not found.");
    const extra = ((row as Record<string, unknown>).extra as Record<string, unknown>) || {};

    // Revoke = restricted + unenrolled. Data is preserved; the person can no
    // longer sign in (auth user is removed) and their KR8 ID is kept on record.
    await admin()
      .from("profiles")
      .update({ extra: { ...extra, restricted: true, revokedAt: Date.now() } })
      .eq("id", userId);
    await admin()
      .from("enrollments")
      .update({ status: "revoked" })
      .eq("student_id", userId)
      .catch(() => undefined);
    await admin().auth.admin.deleteUser(userId).catch(() => undefined);

    send(res, 200, { ok: true, message: "Registration revoked." });
    return;
  }

  throw new ApiError(405, "Method not allowed.");
});
