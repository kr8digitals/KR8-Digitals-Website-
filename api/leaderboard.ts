/**
 * GET /api/leaderboard — public leaderboard via the existing `get_leaderboard`
 * database function (ranks profiles by points).
 * Returns ONLY safe fields — never phone / email / DOB / password.
 */
import { admin, handler, queryStr, send, type ApiRequest, type ApiResponse } from "../server/lib";

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  if (req.method !== "GET") {
    send(res, 405, { ok: false, error: "Method not allowed." });
    return;
  }
  const limit = Math.min(Number(queryStr(req, "limit") || 50) || 50, 200);
  const { data, error } = await admin().rpc("get_leaderboard", { limit_n: limit });
  if (error) {
    send(res, 200, { ok: true, rows: [] });
    return;
  }
  const rows = ((data || []) as Record<string, unknown>[]).map((r, i) => ({
    id: r.kr8_id ?? r.id ?? "",
    name: r.name,
    avatar: r.avatar || "",
    skill: r.skill || "",
    skills: r.skills || (r.skill ? [r.skill] : []),
    points: Number(r.points || 0),
    graduated: !!r.graduated,
    certTier: r.cert_tier || (r.graduated ? "Completion" : null),
    multiSkillCount: r.multi_skill_count || undefined,
    isPlaceholder: !!r.is_placeholder,
    rank: r.rank ?? i + 1,
  }));
  send(res, 200, { ok: true, rows });
});
