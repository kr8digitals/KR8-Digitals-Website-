/**
 * POST /api/admin/graduation
 * Body:
 *   { action: "issue",    studentId (KR8 id or uuid), certificate: CertificateRecord }
 *   { action: "withdraw", studentId, certificateId, reason }
 *   { action: "resend",   certificateId }
 *
 * Issuing a certificate (i.e. graduating a student) creates the `certificates`
 * row, updates the student's profile, writes a `notifications` row and emails
 * the student via Resend. Registration itself sends no email.
 */
import {
  ApiError,
  admin,
  emailShell,
  handler,
  logActivity,
  normalizeIdentity,
  readBody,
  requireAdmin,
  send,
  sendEmail,
  toLegacyAccount,
  toLegacyCertificate,
  type ApiRequest,
  type ApiResponse,
  type RoleRow,
} from "../../server/lib";

async function profileFor(studentRef: string): Promise<Record<string, unknown> | null> {
  const ref = (studentRef || "").trim();
  if (!ref) return null;
  const byUuid = await admin().from("profiles").select("*").eq("id", ref).maybeSingle();
  if (byUuid.data) return byUuid.data as Record<string, unknown>;
  const { data } = await admin()
    .from("profiles")
    .select("*")
    .eq("kr8_id_normalized", normalizeIdentity(ref))
    .maybeSingle();
  return (data as Record<string, unknown>) || null;
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
    const certificateCode = String(cert.id || "").trim() || `CERT-KR8-${String(profile.kr8_id).replace(/[^A-Za-z0-9]/g, "")}-${Date.now().toString(36).toUpperCase()}`;
    const issuedAt = Number(cert.issuedAt) || Date.now();

    // Replace any existing ACTIVE certificate for the same skill; keep history.
    const { data: existingRows } = await admin()
      .from("certificates")
      .select("*")
      .eq("student_id", String(profile.id))
      .eq("skill", skillKey);
    for (const row of (existingRows || []) as Record<string, unknown>[]) {
      if (row.status === "active" && row.certificate_code !== certificateCode) {
        await admin()
          .from("certificates")
          .update({ status: "withdrawn", withdrawn_at: new Date().toISOString(), extra: { ...((row.extra as object) || {}), withdrawalReason: "Replaced by a new certificate" } })
          .eq("id", row.id);
      }
    }

    const extra = {
      formattedName: cert.formattedName || String(profile.name || "").toUpperCase(),
      skillName,
      templateUrl: cert.templateUrl || `/certificates/reusable_${tier.toLowerCase()}.png`,
      achievementText: cert.achievementText || "",
      additionalNotes: cert.additionalNotes || "",
      certificateImageUrl: cert.certificateImageUrl || undefined,
      pdfUrl: cert.pdfUrl || undefined,
    };

    const { data: inserted, error: insErr } = await admin()
      .from("certificates")
      .insert({
        certificate_code: certificateCode,
        student_id: String(profile.id),
        kr8_id: String(profile.kr8_id),
        student_name: String(profile.name || ""),
        skill: skillKey,
        tier,
        status: "active",
        issued_at: new Date(issuedAt).toISOString(),
        issued_by: ctx.displayName,
        extra,
      })
      .select("*")
      .single();
    if (insErr || !inserted) throw new ApiError(500, "Certificate could not be created.");

    // Profile: graduated flags + graduated_skills bookkeeping.
    const profExtra = ((profile.extra as Record<string, unknown>) || {}) as Record<string, unknown>;
    const graduatedSkills = new Set<string>([
      ...((profExtra.graduatedSkills as string[]) || []),
      ...(skillKey ? [skillKey] : []),
      ...((profile.skill as string) ? [String(profile.skill)] : []),
    ]);
    await admin()
      .from("profiles")
      .update({
        graduated: true,
        cert_tier: tier,
        cert_recognition: String(cert.additionalNotes || profExtra.certRecognition || "") || null,
        extra: {
          ...profExtra,
          graduatedSkills: Array.from(graduatedSkills),
          graduatedAt: issuedAt,
          certificateUrl: `cert-stored:${certificateCode}`,
        },
      })
      .eq("id", String(profile.id));

    // Student notification.
    await admin().from("notifications").insert({
      student_id: String(profile.id),
      type: "graduation",
      title: `Congratulations! Your Certificate of ${tier} has been issued! 🎓`,
      message: `You have successfully graduated from ${skillName} at KR8 Digitals! Your verified Certificate of ${tier} is now available in your profile to view, download, and share.`,
      certificate_id: certificateCode,
      skill: skillKey,
      skill_name: skillName,
      tier,
      read: false,
    });

    // Graduation email via Resend (the only automated email in the flow).
    const siteUrl = process.env.SITE_URL || process.env.VITE_SITE_URL || "";
    const verifyUrl = `${siteUrl ? siteUrl.replace(/\/$/, "") : ""}/verify?id=${encodeURIComponent(String(profile.kr8_id))}&cert=${encodeURIComponent(certificateCode)}`;
    const mail = await sendEmail({
      to: String(profile.email),
      subject: `Congratulations, ${String(profile.name).split(" ")[0]} — You've Graduated from KR8 Digitals!`,
      kind: "graduation",
      html: emailShell(
        `Certificate of ${tier} — ${skillName}`,
        `<p>Hi ${String(profile.name || "there")},</p>
         <p>Great news — you have officially <strong>graduated</strong> from <strong>${skillName}</strong> at KR8 Digitals.</p>
         <p>Your verified certificate is live:</p>
         <p style="font-size:20px;letter-spacing:2px;font-weight:700;color:#ffffff;">${certificateCode}</p>
         <p><a href="${verifyUrl}" style="color:#f472b6;">Verify your certificate publicly</a></p>
         <p>Your KR8 ID: <strong>${String(profile.kr8_id)}</strong></p>
         <p>Keep creating — this is only the beginning. 🎓</p>`
      ),
    });
    if (mail.sent) {
      await admin()
        .from("certificates")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("certificate_code", certificateCode)
        .catch(() => undefined);
    }

    await logActivity({
      kind: "graduation",
      name: String(profile.name || ""),
      skill: skillName,
      avatar: String(profile.avatar || ""),
      customAction: `graduated — Certificate of ${tier}`,
    });

    const account = await accountBundle(String(profile.id));
    send(res, 200, {
      ok: true,
      account,
      certificate: toLegacyCertificate(inserted as Record<string, unknown>),
      emailSent: mail.sent,
    });
    return;
  }

  if (action === "withdraw") {
    const profile = await profileFor(String(body.studentId || ""));
    if (!profile) throw new ApiError(404, "Student not found.");
    const certificateId = String(body.certificateId || "").trim();
    const reason = String(body.reason || "").trim();
    if (!reason) throw new ApiError(400, "A withdrawal reason is required.");

    const { data: certRow } = await admin()
      .from("certificates")
      .select("*")
      .eq("certificate_code", certificateId)
      .eq("student_id", String(profile.id))
      .maybeSingle();
    if (!certRow) throw new ApiError(404, `Certificate reference ID "${certificateId}" not found for student.`);

    const certExtra = ((certRow as Record<string, unknown>).extra as Record<string, unknown>) || {};
    await admin()
      .from("certificates")
      .update({
        status: "withdrawn",
        withdrawn_at: new Date().toISOString(),
        extra: { ...certExtra, withdrawalReason: reason, withdrawnBy: ctx.displayName },
      })
      .eq("id", (certRow as Record<string, unknown>).id);

    await admin().from("notifications").insert({
      student_id: String(profile.id),
      type: "withdrawal",
      title: `Notice: Certificate of ${(certRow as Record<string, unknown>).tier} Withdrawn`,
      message: `Your Certificate of ${(certRow as Record<string, unknown>).tier} in ${certExtra.skillName || (certRow as Record<string, unknown>).skill} has been withdrawn by the administrator.`,
      reason,
      certificate_id: certificateId,
      skill: String((certRow as Record<string, unknown>).skill || ""),
      skill_name: String(certExtra.skillName || (certRow as Record<string, unknown>).skill || ""),
      tier: String((certRow as Record<string, unknown>).tier || "Completion"),
      read: false,
    });

    // Recompute graduation state from remaining active certificates.
    const { data: remaining } = await admin()
      .from("certificates")
      .select("*")
      .eq("student_id", String(profile.id))
      .eq("status", "active");
    const stillGraduated = (remaining || []).length > 0;
    const latest = ((remaining || []) as Record<string, unknown>[]).slice(-1)[0];
    const profExtra = ((profile.extra as Record<string, unknown>) || {}) as Record<string, unknown>;
    await admin()
      .from("profiles")
      .update({
        graduated: stillGraduated,
        cert_tier: stillGraduated ? (latest?.tier as string) || null : null,
        extra: {
          ...profExtra,
          graduatedAt: stillGraduated ? profExtra.graduatedAt : undefined,
          certificateUrl: stillGraduated ? `cert-stored:${String(latest?.certificate_code || "")}` : undefined,
        },
      })
      .eq("id", String(profile.id));

    const account = await accountBundle(String(profile.id));
    send(res, 200, { ok: true, account, certificate: toLegacyCertificate(certRow as Record<string, unknown>) });
    return;
  }

  if (action === "resend") {
    const certificateId = String(body.certificateId || "").trim();
    const { data: certRow } = await admin()
      .from("certificates")
      .select("*")
      .eq("certificate_code", certificateId)
      .maybeSingle();
    if (!certRow) throw new ApiError(404, "Certificate not found.");
    const profile = await profileFor(String((certRow as Record<string, unknown>).student_id || (certRow as Record<string, unknown>).kr8_id || ""));
    if (!profile) throw new ApiError(404, "Student not found.");

    const certExtra = ((certRow as Record<string, unknown>).extra as Record<string, unknown>) || {};
    const mail = await sendEmail({
      to: String(profile.email),
      subject: `Your KR8 Digitals certificate — ${certificateId}`,
      kind: "certificate_resend",
      html: emailShell(
        `Certificate of ${(certRow as Record<string, unknown>).tier}`,
        `<p>Hi ${String(profile.name || "there")},</p>
         <p>As requested, here is your verified certificate reference:</p>
         <p style="font-size:20px;letter-spacing:2px;font-weight:700;color:#ffffff;">${certificateId}</p>
         <p>Student: <strong>${String(profile.name)}</strong> (${String(profile.kr8_id)})<br/>
         Skill: <strong>${String(certExtra.skillName || (certRow as Record<string, unknown>).skill)}</strong><br/>
         Status: <strong>${String((certRow as Record<string, unknown>).status)}</strong></p>`
      ),
    });
    if (mail.sent) {
      await admin()
        .from("certificates")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("certificate_code", certificateId)
        .catch(() => undefined);
    }
    send(res, 200, { ok: true, emailSent: mail.sent, error: mail.error });
    return;
  }

  throw new ApiError(400, "Unknown action.");
});
