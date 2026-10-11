/**
 * POST /api/auth/login
 * Body: { identifier: string, password: string }
 *   — or —
 * Body: { action: "resend-confirmation", identifier: string }
 *
 * The identifier may be a KR8 ID, email or phone number. It is resolved to an
 * email ON THE SERVER (never by the browser), then verified against Supabase
 * Auth (email + password). No plaintext password is ever stored or compared in
 * application code.
 *
 * Resending the signup confirmation happens server-side too: the resolved
 * email is never returned to the browser.
 */
import {
  ApiError,
  authClient,
  SITE_URL,
  findProfileByIdentifier,
  handler,
  readBody,
  send,
  toLegacyAccount,
  admin,
  type ApiRequest,
  type ApiResponse,
  type RoleRow,
} from "../../lib";

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  if (req.method !== "POST") throw new ApiError(405, "Method not allowed.");
  const body = await readBody(req);
  const identifier = String(body.identifier || "").trim();

  /* ---- resend the signup confirmation (server-side; email stays hidden) ---- */
  if (body.action === "resend-confirmation") {
    if (!identifier) throw new ApiError(400, "Please enter your KR8 ID, email, or phone.");
    const profile = await findProfileByIdentifier(identifier);
    const email = profile?.email ? String(profile.email) : identifier.includes("@") ? identifier : "";
    if (!email) throw new ApiError(400, "We could not find an email for that account.");
    await authClient().auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${SITE_URL}/welcome` },
    });
    send(res, 200, {
      ok: true,
      message: "Confirmation email sent. Please check your inbox (and spam folder).",
    });
    return;
  }

  const password = String(body.password || "");

  if (!identifier) throw new ApiError(400, "Please enter your KR8 ID, email, or phone.");
  if (!password) throw new ApiError(400, "Please enter your account password.");

  const profile = await findProfileByIdentifier(identifier);
  const email = profile?.email ? String(profile.email) : identifier;

  const { data, error } = await authClient().auth.signInWithPassword({ email, password });
  if (error || !data?.user || !data.session) {
    const code = (error as { code?: string } | null)?.code || "";
    const msg = String(error?.message || "");
    if (code === "email_not_confirmed" || msg.toLowerCase().includes("email not confirmed")) {
      // Friendly, structured error — the UI shows a resend page, not a raw error.
      throw new ApiError(403, "Please confirm your email address before signing in.", {
        code: "email_not_confirmed",
      });
    }
    throw new ApiError(401, "The KR8 ID / email / phone or password is incorrect.");
  }

  const userId = data.user.id;
  let row = profile;
  if (!row) {
    const { data: ownRow } = await admin().from("profiles").select("*").eq("id", userId).maybeSingle();
    row = (ownRow as Record<string, unknown>) || null;
  }

  const [{ data: certRows }, { data: notifRows }, { data: roleRows }] = await Promise.all([
    admin().from("certificates").select("*").eq("student_id", userId),
    admin()
      .from("notifications")
      .select("*")
      .eq("student_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    admin().from("user_roles").select("role, permissions, title").eq("user_id", userId),
  ]);

  const account = row
    ? toLegacyAccount(row, {
        certificates: certRows || [],
        notifications: notifRows || [],
        roles: (roleRows || []) as RoleRow[],
        includePrivate: true,
      })
    : { id: String(data.user.user_metadata?.kr8_id || ""), name: String(data.user.user_metadata?.name || ""), email };

  send(res, 200, {
    ok: true,
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    },
    account,
  });
});
