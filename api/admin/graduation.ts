/**
 * POST /api/admin/graduation (admin only — verified via is_admin/is_staff)
 * Body:
 *   { action: "issue",    studentId (KR8 id or uuid), certificate: CertificateRecord }
 *   { action: "withdraw", studentId, certificateId, reason, withdrawnBy? }
 *   { action: "resend",   certificateId }
 *
 * Issue (graduation):
 *   1. Insert into certificates EXACTLY: certificate_code, student_id, kr8_id,
 *      student_name, formatted_name, skill, skill_name, tier, achievement_text,
 *      issued_by (admin user id), status = 'active'.
 *      Code format: CERT-KR8-{kr8_id}-{SKILL}-{6 random chars}.
 *   2. Update profiles (graduated, cert_tier, cert_recognition) and
 *      enrollments (graduated, graduated_at) with the service-role key — the
 *      prevent_protected_profile_changes trigger blocks students, not the server.
 *   3. The notify_certificate trigger creates the in-app notification — no
 *      manual notifications insert is made here.
 *   4. Resend graduation email (RESEND_API_KEY / RESEND_FROM): certificate code
 *      + verify link {SITE_URL}/verify?code=... — records certificates.
 *      email_sent_at on success or email_failure_reason on failure, and an
 *      email_logs row (via sendEmail). Registration sends NO custom email.
 */
import {
  admin,
  ApiError,
  emailShell,
  handler,
  logActivity,
  readBody,
  requireAdmin,
  send,
  sendEmail,
  SITE_URL,
  toLegacyAccount,
  toLegacyCertificate,
  type ApiRequest,
  type ApiResponse,
  type RoleRow,
} from "../../server/lib";

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomChars(n: number): string {
  let out = "";
  for (let i = 0; i < n; i++) out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return out;
}

function buildCertificateCode(kr8Id: string, skillKey: string): string {
  const id = String(kr8Id || "").trim();
  const skill = String(skillKey || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "SKILL";
  return `CERT-KR8-${id}-${skill}-${randomChars(6)}`;
}

async function profileFor(studentRef: string): Promise<Record<string, unknown> | null> {
  const ref = (studentRef || "").trim();
  if (!ref) return null;
  const byUuid = await admin().from("profiles").select("*").eq("id", ref).maybeSingle();
  if (byUuid.data) return byUuid.data as Record<string, unknown>;
  try {
    const { data } = await admin().rpc("get_profile_by_kr8_id", { lookup_id: ref });
    const row = Array.isArray(data) ? data[0] : data;
    if (row && (row as Record<string, unknown>).id) return row as Record<string, unknown>;
  } catch {
    /* fall through */
  }
  const { data } = await admin()
    .from("profiles")
    .select("*")
    .ilike("kr8_id", ref.replace(/[^A-Za-z0-9]/g, "%"))
    .limit(5);
  const rows = (data || []) as Record<string, unknown>[];
  return rows[0] || null;
}

async function accountBundle(userId: string) {
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

async function sendGraduationEmail(certRow: Record<string, unknown>, profile: Record<string, unknown>): Promise<void> {
  const to = String(profile.email || "");
  const code = String(certRow.certificate_code || "");
  const verifyUrl = `${SITE_URL}/verify?code=${encodeURIComponent(code)}`;
  const studentName = String(certRow.student_name || profile.name || "Student");
  const skillName = String(certRow.skill_name || certRow.skill || "your skill");
  const tier = String(certRow.tier || "Completion");
  const html = emailShell(
    `Congratulations, ${studentName}! 🎓`,
    `<p>We are proud to congratulate you on completing the <strong>${skillName}</strong> program at KR8 Digitals Academy and earning the <strong>${tier}</strong> certificate.</p>
     <p>Your certificate code is:</p>
     <p style="font-size:18px;color:#f472b6;letter-spacing:1px;"><strong>${code}</strong></p>
     <p>Verify it any time at:</p>
     <p><a href="${verifyUrl}" style="color:#f472b6;">${verifyUrl}</a></p>
     <p>Keep creating — this is only the beginning. 🚀</p>`
  );
  const result = await sendEmail({
    to,
    subject: `🎓 Your KR8 Digitals Certificate — ${code}`,
    html,
    kind: "graduation",
  });
  await admin()
    .from("certificates")
    .update(
      result.sent
        ? { email_sent_at: new Date().toISOString(), email_failure_reason: null }
        : { email_failure_reason: result.error || "Email could not be sent." }
    )
    .eq("certificate_code", code);
}

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  if (req.method !== "POST") throw new ApiError(405, "Method not allowed.");
  const ctx = await requireAdmin(req);
  const body = await readBody(req);
  const action = String(body.action || "issue");

  if (action === "issue") {
    const profile = await profileFor(String(body.studentId || ""));
    if (!profile) throw new ApiError(404, "Student not found.");

    const cert = (body.certificate && typeof body.certificate === "object" ? body.certificate : {}) as Record<string, unknown>;
    const tier = String(cert.tier || "Completion") === "Professionalism" ? "Professionalism" : "Completion";
    const skillKey = String(cert.skill || profile.skill || "");
    const skillName = String(cert.skillName || skillKey);
    const kr8Id = String(profile.kr8_id || "");
    const studentName = String(cert.studentName || profile.name || "");

    // 1) certificates row — EXACTLY the specified column set.
    const certificateCode = buildCertificateCode(kr8Id, skillKey);
    const insertRow = {
      certificate_code: certificateCode,
      student_id: profile.id,
      kr8_id: kr8Id,
      student_name: studentName,
      formatted_name: String(cert.formattedName || studentName).toUpperCase(),
      skill: skillKey,
      skill_name: skillName,
      tier,
      achievement_text: String(cert.achievementText || ""),
      issued_by: ctx.user.id,
      status: "active",
    };
    const { data: inserted, error: insErr } = await admin()
      .from("certificates")
      .insert(insertRow)
      .select("*")
      .maybeSingle();
    if (insErr) throw new ApiError(500, `Certificate could not be issued: ${insErr.message}`);

    // 2) profiles + enrollments (service role — allowed by the DB trigger).
    await admin()
      .from("profiles")
      .update({
        graduated: true,
        cert_tier: tier,
        cert_recognition: String(profile.cert_recognition || cert.additionalNotes || "") || null,
      })
      .eq("id", profile.id);
    await admin()
      .from("enrollments")
      .update({ graduated: true, graduated_at: new Date().toISOString() })
      .eq("student_id", profile.id)
      .eq("skill", skillKey)
      .catch(() => undefined);

    // 3) notify_certificate trigger creates the in-app notification.

    // 4) graduation email via Resend.
    const certRow = (inserted as Record<string, unknown>) || insertRow;
    await sendGraduationEmail(certRow, profile);
    await logActivity({
      kind: "graduation",
      name: studentName,
      skill: skillName,
      customAction: `graduated (${tier})`,
    });

    const account = await accountBundle(String(profile.id));
    send(res, 200, {
      ok: true,
      account,
      certificate: toLegacyCertificate({
        ...certRow,
        issued_at: new Date().toISOString(),
      }),
    });
    return;
  }

  if (action === "withdraw") {
    const profile = await profileFor(String(body.studentId || ""));
    const certId = String(body.certificateId || certIdFromBody(body) || "");
    const reason = String(body.reason || "").trim();
    if (!reason) throw new ApiError(400, "A withdrawal reason is required.");
    const { data: certRow } = await admin()
      .from("certificates")
      .select("*")
      .eq("certificate_code", certId)
      .maybeSingle();
    if (!certRow) throw new ApiError(404, "Certificate not found.");

    const { data: updated } = await admin()
      .from("certificates")
      .update({
        status: "withdrawn",
        withdrawn_at: new Date().toISOString(),
        withdrawal_reason: reason,
        withdrawn_by: ctx.user.id,
      })
      .eq("certificate_code", certId)
      .select("*")
      .maybeSingle();

    const account = profile ? await accountBundle(String(profile.id)) : null;
    send(res, 200, { ok: true, account, certificate: toLegacyCertificate((updated || certRow) as Record<string, unknown>) });
    return;
  }

  if (action === "resend") {
    const certId = String(body.certificateId || certIdFromBody(body) || "");
    const { data: certRow } = await admin()
      .from("certificates")
      .select("*")
      .eq("certificate_code", certId)
      .maybeSingle();
    if (!certRow) throw new ApiError(404, "Certificate not found.");
    const profile = await profileFor(String((certRow as Record<string, unknown>).student_id || ""));
    if (!profile) throw new ApiError(404, "Student not found.");
    await sendGraduationEmail(certRow as Record<string, unknown>, profile);
    send(res, 200, {
      ok: true,
      message: `Graduation email re-sent to ${String(profile.name || "the student")}'s registered address.`,
    });
    return;
  }

  throw new ApiError(400, "Unknown action.");
});

function certIdFromBody(body: Record<string, unknown>): string {
  const cert = body.certificate as Record<string, unknown> | undefined;
  return String(cert?.id || body.certId || "");
}
