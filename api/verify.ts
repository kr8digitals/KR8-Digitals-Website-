/**
 * POST /api/verify — public certificate / KR8 ID verification.
 * Body: { id?: string, cert?: string }
 *
 * Returns ONLY publicly safe fields (name, avatar, skill, tier, status…).
 * Phone, email and DOB are never included — this endpoint is unauthenticated.
 */
import {
  admin,
  handler,
  normalizeIdentity,
  readBody,
  send,
  toLegacyCertificate,
  type ApiRequest,
  type ApiResponse,
} from "../server/lib";

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  if (req.method !== "POST") {
    send(res, 405, { ok: false, error: "Method not allowed." });
    return;
  }
  const body = await readBody(req);
  const idInput = String(body.id || "").trim();
  const certInput = String(body.cert || "").trim();
  const sb = admin();

  // 1) Direct certificate lookup.
  const certRef = certInput || (idInput.startsWith("CERT-") ? idInput : "");
  let certRow: Record<string, unknown> | null = null;
  if (certRef) {
    const { data } = await sb
      .from("certificates")
      .select("*")
      .eq("certificate_code", certRef)
      .maybeSingle();
    certRow = (data as Record<string, unknown>) || null;
  }

  // 2) Student identity lookup.
  let profileRow: Record<string, unknown> | null = null;
  const ref = certRow ? String(certRow.student_id || "") : idInput;
  if (ref) {
    const byUuid = await sb.from("profiles").select("*").eq("id", ref).maybeSingle();
    profileRow = (byUuid.data as Record<string, unknown>) || null;
    if (!profileRow) {
      const { data } = await sb
        .from("profiles")
        .select("*")
        .eq("kr8_id_normalized", normalizeIdentity(ref))
        .maybeSingle();
      profileRow = (data as Record<string, unknown>) || null;
    }
  }

  if (!profileRow && !certRow) {
    send(res, 200, { ok: false });
    return;
  }

  const userId = String(profileRow?.id || certRow?.student_id || "");
  const { data: allCerts } = await sb.from("certificates").select("*").eq("student_id", userId);
  const certificates = ((allCerts || []) as Record<string, unknown>[]).map(toLegacyCertificate);

  let certificate = certRow ? toLegacyCertificate(certRow) : undefined;
  if (!certificate && certificates.length > 0) {
    const active = certificates.find((c) => c.status === "active");
    certificate = active || certificates[certificates.length - 1];
  }

  const extra = ((profileRow?.extra as Record<string, unknown>) || {}) as Record<string, unknown>;
  const account = profileRow
    ? {
        // Public-safe projection of the legacy Account shape.
        id: profileRow.kr8_id,
        name: profileRow.name,
        avatar: profileRow.avatar,
        type: extra.type || "student",
        skill: profileRow.skill || "",
        skills: extra.skills || (profileRow.skill ? [profileRow.skill] : []),
        year: extra.year || 2026,
        vip: !!extra.vip,
        graduated: !!profileRow.graduated,
        certTier: profileRow.cert_tier || (profileRow.graduated ? "Completion" : null),
        certRecognition: profileRow.cert_recognition || undefined,
        joined: profileRow.joined
          ? Number(profileRow.joined) || Date.parse(String(profileRow.joined))
          : profileRow.created_at
          ? Date.parse(String(profileRow.created_at))
          : Date.now(),
        verifyRemark: extra.verifyRemark || undefined,
      }
    : undefined;

  const isWithdrawn = certificate ? certificate.status === "withdrawn" : false;
  send(res, 200, {
    ok: !!account || !!certificate,
    account,
    certificate,
    certificates,
    isWithdrawn,
    withdrawalReason: certificate?.withdrawalReason,
    withdrawnAt: certificate?.withdrawnAt,
  });
});
