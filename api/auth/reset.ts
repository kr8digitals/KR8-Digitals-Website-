/**
 * POST /api/auth/reset
 * Body:
 *   { action: "request", identifier }
 *   { action: "complete", identifier, code, password }
 *
 * Password-reset codes are generated on the server, stored hashed, and sent to
 * the account's EMAIL via Resend. The code is never returned to the browser
 * (the old "autofill the reset code" behaviour is gone) and there are no
 * master/override codes.
 */
import {
  ApiError,
  admin,
  emailShell,
  findProfileByIdentifier,
  getSetting,
  handler,
  hashCode6,
  normalizeEmail,
  readBody,
  safeEqual,
  send,
  sendEmail,
  sha256,
  type ApiRequest,
  type ApiResponse,
} from "../../server/lib";

const RESET_TTL_MS = 15 * 60 * 1000;

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  if (req.method !== "POST") throw new ApiError(405, "Method not allowed.");
  const body = await readBody(req);
  const action = String(body.action || "request");
  const identifier = String(body.identifier || "").trim();
  if (!identifier) throw new ApiError(400, "Please provide your registered email, phone number, or KR8 ID.");

  if (action === "request") {
    const profile = await findProfileByIdentifier(identifier);
    if (!profile || !profile.email) {
      // Do not reveal whether the account exists — but still fail honestly enough
      // for the account owner to notice a typo.
      throw new ApiError(404, "No account found matching that email, phone, or KR8 ID.");
    }

    // Credential suspension (managed by administration in site_settings).
    const suspended = (await getSetting("suspended_credentials")) as Record<string, string> | null;
    const keys = [normalizeEmail(identifier), identifier.trim(), String(profile.kr8_id || "")].map((k) =>
      k.toLowerCase()
    );
    if (suspended && keys.some((k) => suspended[k])) {
      throw new ApiError(403, "This account is suspended. Please contact KR8 administration.");
    }

    const code = hashCode6();
    await admin()
      .from("password_reset_codes")
      .insert({
        profile_id: profile.id,
        identifier_hash: sha256(identifier.toLowerCase()),
        code_hash: sha256(code),
        expires_at: new Date(Date.now() + RESET_TTL_MS).toISOString(),
      });

    const name = String(profile.name || "there");
    await sendEmail({
      to: String(profile.email),
      subject: "Your KR8 Digitals password reset code",
      kind: "password_reset",
      html: emailShell(
        "Password Reset Code",
        `<p>Hi ${name},</p>
         <p>Use the code below to reset your KR8 Digitals password. It expires in 15 minutes.</p>
         <p style="font-size:28px;letter-spacing:8px;font-weight:700;color:#ffffff;">${code}</p>
         <p>If you did not request this, you can safely ignore this email.</p>`
      ),
    });

    send(res, 200, {
      ok: true,
      message: `If an account matches that identifier, a 6-digit verification code has been sent to its registered email address.`,
    });
    return;
  }

  if (action === "complete") {
    const code = String(body.code || "").trim();
    const password = String(body.password || "");
    if (password.length < 6) throw new ApiError(400, "Password must be at least 6 characters.");
    if (!/^\d{6}$/.test(code)) throw new ApiError(400, "Enter the 6-digit code sent to your email.");

    const profile = await findProfileByIdentifier(identifier);
    if (!profile) throw new ApiError(404, "Account could not be found.");

    const { data: rows } = await admin()
      .from("password_reset_codes")
      .select("*")
      .eq("profile_id", profile.id)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(5);

    const now = Date.now();
    const match = ((rows || []) as Record<string, unknown>[]).find(
      (r) =>
        new Date(String(r.expires_at)).getTime() > now &&
        safeEqual(String(r.code_hash || ""), sha256(code))
    );
    if (!match) throw new ApiError(400, "That verification code is invalid or has expired.");

    // Rotate the password in Supabase Auth and invalidate outstanding codes.
    const { error: updErr } = await admin().auth.admin.updateUserById(String(profile.id), {
      password,
    });
    if (updErr) throw new ApiError(500, "Password could not be updated. Please try again.");

    await admin()
      .from("password_reset_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("profile_id", profile.id)
      .is("used_at", null);

    send(res, 200, { ok: true, message: "Password updated successfully! You can now sign in." });
    return;
  }

  throw new ApiError(400, "Unknown action.");
});
