/**
 * POST /api/auth/reset
 * Body: { action?: "request", identifier: string }
 *
 * Password reset uses Supabase Auth's own recovery email
 * (`resetPasswordForEmail`) — a signed link lands on /reset-password where the
 * user sets a new password. No reset codes are generated, stored or shown in
 * the browser, and the account's email is never returned here.
 */
import {
  admin,
  ApiError,
  authClient,
  SITE_URL,
  findProfileByIdentifier,
  handler,
  readBody,
  send,
  type ApiRequest,
  type ApiResponse,
} from "../../lib.js";

const GENERIC_MESSAGE =
  "If an account exists for that detail, a password reset link has been sent to its email address. Please check your inbox (and spam folder).";

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  if (req.method !== "POST") throw new ApiError(405, "Method not allowed.");
  const body = await readBody(req);
  const identifier = String(body.identifier || body.email || "").trim();
  if (!identifier) throw new ApiError(400, "Please enter your KR8 ID, email, or phone.");

  const profile = await findProfileByIdentifier(identifier);
  const email = profile?.email ? String(profile.email) : identifier.includes("@") ? identifier : "";

  if (email) {
    // Suspended accounts cannot reset passwords until readmitted.
    const { data: suspRow } = await admin()
      .from("site_settings")
      .select("value")
      .eq("key", "suspended_credentials")
      .maybeSingle();
    const suspended = ((suspRow?.value as Record<string, unknown>) ?? {}) as Record<string, unknown>;
    let blocked = false;
    if (suspended && !Array.isArray(suspended) && Object.keys(suspended).length) {
      for (const entry of Object.values(suspended)) {
        const e = entry as { kr8Id?: string; email?: string };
        if (e?.kr8Id === profile?.kr8_id || e?.email === profile?.email) {
          blocked = true;
        }
      }
    }
    if (blocked) {
      throw new ApiError(403, "This account is suspended. Please contact KR8 administration.");
    }

    await authClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/reset-password`,
    });
  }

  // Always the same response — never reveals whether the account exists.
  send(res, 200, { ok: true, message: GENERIC_MESSAGE });
});
