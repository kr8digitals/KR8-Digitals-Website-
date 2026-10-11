/**
 * POST /api/auth/login
 * Body: { identifier: string, password: string }
 *
 * The identifier may be a KR8 ID, email or phone number. It is resolved to an
 * email ON THE SERVER (never by the browser), then verified against Supabase
 * Auth (email + password). No plaintext password is ever stored or compared in
 * application code.
 */
import {
  ApiError,
  authClient,
  admin,
  findProfileByIdentifier,
  getSetting,
  handler,
  normalizeEmail,
  readBody,
  send,
  toLegacyAccount,
  type ApiRequest,
  type ApiResponse,
  type RoleRow,
} from "../../server/lib";

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  if (req.method !== "POST") throw new ApiError(405, "Method not allowed.");
  const body = await readBody(req);
  const identifier = String(body.identifier || "").trim();
  const password = String(body.password || "");

  if (!identifier) throw new ApiError(400, "Please enter your KR8 ID, email, or phone.");
  if (!password) throw new ApiError(400, "Please enter your account password.");

  const profile = await findProfileByIdentifier(identifier);
  const email = profile?.email ? String(profile.email) : identifier;

  const { data, error } = await authClient().auth.signInWithPassword({ email, password });
  if (error || !data?.user || !data.session) {
    throw new ApiError(401, "The KR8 ID / email / phone or password is incorrect.");
  }

  const userId = data.user.id;

  // Suspended accounts cannot sign in until an admin readmits them
  // (same suspended_credentials doc the reset flow enforces).
  const suspended = (await getSetting("suspended_credentials")) as Record<string, string> | null;
  if (suspended && !Array.isArray(suspended) && Object.keys(suspended).length) {
    const keys = [normalizeEmail(email), identifier.trim(), String(profile?.kr8_id || "")].map((k) =>
      String(k || "").toLowerCase()
    );
    if (keys.some((k) => k && suspended[k])) {
      throw new ApiError(403, "This account is suspended. Please contact KR8 administration.");
    }
  }

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
    admin().from("user_roles").select("role, permissions").eq("user_id", userId),
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
