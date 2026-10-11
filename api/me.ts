/**
 * /api/me — the signed-in user's own profile.
 *   GET   → own account (private fields included — it is their own data)
 *   PATCH → update their own editable fields
 *   POST  { action: "read-notification", id } → mark notification read
 *   POST  { action: "change-password", currentPassword?, newPassword }
 *
 * Access is governed by the Supabase Auth JWT. RLS additionally restricts
 * `profiles` to the owner row; this endpoint is the only browser entry point
 * for private fields (email / phone / dob) — never via the public key.
 */
import {
  ApiError,
  accountToRowPatch,
  admin,
  authClient,
  handler,
  readBody,
  requireUser,
  send,
  toLegacyAccount,
  type ApiRequest,
  type ApiResponse,
  type RoleRow,
} from "../server/lib";

async function loadAccount(userId: string) {
  const [{ data: row }, { data: certRows }, { data: notifRows }, { data: roleRows }] = await Promise.all([
    admin().from("profiles").select("*").eq("id", userId).maybeSingle(),
    admin().from("certificates").select("*").eq("student_id", userId),
    admin()
      .from("notifications")
      .select("*")
      .eq("student_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    admin().from("user_roles").select("role, permissions").eq("user_id", userId),
  ]);
  if (!row) return null;
  return toLegacyAccount(row as Record<string, unknown>, {
    certificates: certRows || [],
    notifications: notifRows || [],
    roles: (roleRows || []) as RoleRow[],
    includePrivate: true,
  });
}

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  const user = await requireUser(req);

  if (req.method === "GET") {
    const account = await loadAccount(user.id);
    if (!account) throw new ApiError(404, "Profile not found.");
    send(res, 200, { ok: true, account });
    return;
  }

  if (req.method === "PATCH") {
    const body = await readBody(req);
    const { data: row } = await admin().from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (!row) throw new ApiError(404, "Profile not found.");
    const existingExtra = ((row as Record<string, unknown>).extra as Record<string, unknown>) || {};

    // Students may edit presentation fields only — never points/graduation/etc.
    const allowed: Record<string, unknown> = {};
    for (const key of ["name", "country", "avatar", "bio", "coverPhoto", "interests", "messagePrivacy", "portfolio", "title"]) {
      if (body[key] !== undefined) allowed[key] = body[key];
    }
    const patch = accountToRowPatch(allowed, existingExtra);
    delete patch.email;
    delete patch.phone;
    delete patch.phone_normalized;

    await admin().from("profiles").update(patch).eq("id", user.id);
    const account = await loadAccount(user.id);
    send(res, 200, { ok: true, account });
    return;
  }

  if (req.method === "POST") {
    const body = await readBody(req);
    const action = String(body.action || "");

    if (action === "read-notification") {
      await admin()
        .from("notifications")
        .update({ read: true })
        .eq("id", String(body.id || ""))
        .eq("student_id", user.id);
      send(res, 200, { ok: true });
      return;
    }

    if (action === "change-password") {
      const newPassword = String(body.newPassword || "");
      if (newPassword.length < 6) throw new ApiError(400, "Password must be at least 6 characters.");
      const { data: row } = await admin()
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .maybeSingle();
      const email = (row as { email?: string } | null)?.email || user.email;
      const currentPassword = String(body.currentPassword || "");
      if (currentPassword) {
        const check = await authClient().auth.signInWithPassword({ email: String(email), password: currentPassword });
        if (check.error) throw new ApiError(401, "Your current password is incorrect.");
      }
      const { error } = await admin().auth.admin.updateUserById(user.id, { password: newPassword });
      if (error) throw new ApiError(500, "Password could not be updated. Please try again.");
      send(res, 200, { ok: true, message: "Password updated successfully." });
      return;
    }

    if (action === "onboarding") {
      // /welcome completion is remembered in the database (never the browser).
      const whatsappDone = !!body.whatsappDone;
      await admin()
        .from("onboarding_status")
        .upsert({
          user_id: user.id,
          whatsapp_done: whatsappDone,
          completed_at: new Date().toISOString(),
        })
        .catch(() => undefined);
      send(res, 200, { ok: true });
      return;
    }

    if (action === "onboarding-status") {
      const { data } = await admin()
        .from("onboarding_status")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      send(res, 200, {
        ok: true,
        status: (data as Record<string, unknown>) || { whatsapp_done: false, completed_at: null },
      });
      return;
    }

    throw new ApiError(400, "Unknown action.");
  }

  throw new ApiError(405, "Method not allowed.");
});
