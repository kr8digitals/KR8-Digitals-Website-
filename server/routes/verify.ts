/**
 * POST /api/verify — public certificate / KR8 ID verification.
 * Body: { id?: string, cert?: string }
 *
 * Uses the existing database functions:
 *   verify_certificate_public(cert_code)
 *   get_profile_by_kr8_id(lookup_id)
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
} from "../lib";

type Row = Record<string, unknown>;

async function lookupProfile(ref: string): Promise<Row | null> {
  try {
    const { data } = await admin().rpc("get_profile_by_kr8_id", { lookup_id: ref });
    const row = Array.isArray(data) ? data[0] : data;
    if (row && (row as Row).id) return row as Row;
  } catch {
    /* fall through */
  }
  const { data } = await admin()
    .from("profiles")
    .select("*")
    .ilike("kr8_id", ref.replace(/[^A-Za-z0-9]/g, "%"))
    .limit(5);
  const rows = (data || []) as Row[];
  return rows.find((r) => normalizeIdentity(String(r.kr8_id || "")) === normalizeIdentity(ref)) || null;
}

function safeAccount(row: Row): Record<string, unknown> {
  return {
    id: row.kr8_id,
    name: row.name,
    avatar: row.avatar || "",
    type: row.skill ? "student" : "tribe",
    skill: row.skill || "",
    skills: row.skill ? [row.skill] : [],
    year: 2026,
    vip: false,
    graduated: !!row.graduated,
    certTier: row.cert_tier || (row.graduated ? "Completion" : null),
    certRecognition: row.cert_recognition || undefined,
    joined: row.joined ? Number(row.joined) || Date.parse(String(row.joined)) : Date.now(),
    verifyRemark: undefined,
  };
}

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  if (req.method !== "POST") {
    send(res, 405, { ok: false, error: "Method not allowed." });
    return;
  }
  const body = await readBody(req);
  const idInput = String(body.id || "").trim();
  const certInput = String(body.cert || "").trim();
  const sb = admin();

  // 1) Certificate code — via the public verification function.
  const certRef = certInput || (idInput.startsWith("CERT-") ? idInput : "");
  let certRow: Row | null = null;
  if (certRef) {
    try {
      const { data } = await sb.rpc("verify_certificate_public", { cert_code: certRef });
      const row = Array.isArray(data) ? data[0] : data;
      if (row && (row as Row).certificate_code) certRow = row as Row;
    } catch {
      /* fall through to direct lookup */
    }
    if (!certRow) {
      const { data } = await sb
        .from("certificates")
        .select("*")
        .eq("certificate_code", certRef)
        .maybeSingle();
      certRow = (data as Row) || null;
    }
  }

  // 2) Student identity lookup.
  const ref = certRow ? String(certRow.student_id || certRow.kr8_id || "") : idInput;
  let profileRow: Row | null = null;
  if (ref && !String(ref).startsWith("CERT-")) {
    profileRow = await lookupProfile(ref);
  }
  if (certRow && !profileRow && certRow.kr8_id) {
    profileRow = await lookupProfile(String(certRow.kr8_id));
  }

  if (!profileRow && !certRow) {
    send(res, 200, { ok: false });
    return;
  }

  const userId = String(profileRow?.id || certRow?.student_id || "");
  const { data: allCerts } = userId
    ? await sb.from("certificates").select("*").eq("student_id", userId)
    : { data: [] as Row[] };
  const certificates = ((allCerts || []) as Row[]).map(toLegacyCertificate);

  let certificate = certRow ? toLegacyCertificate(certRow) : undefined;
  if (!certificate && certificates.length > 0) {
    const active = certificates.find((c) => c.status === "active");
    certificate = active || certificates[certificates.length - 1];
  }

  const account = profileRow ? safeAccount(profileRow) : undefined;
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
