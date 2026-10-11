/**
 * /api/admin/skills — skill_settings management (real columns: skill_key,
 * name, reg_open, available, whatsapp_url). GET is admin-scoped; the public
 * read of the same data happens through /api/site.
 *   GET → all rows
 *   POST { skill, name?, regOpen?, whatsapp?, available? } → upsert
 */
import { ApiError, admin, handler, readBody, requireAdmin, send, type ApiRequest, type ApiResponse } from "../../server/lib";

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  await requireAdmin(req);

  if (req.method === "GET") {
    const { data } = await admin().from("skill_settings").select("*");
    send(res, 200, { ok: true, skills: data || [] });
    return;
  }

  if (req.method === "POST") {
    const body = await readBody(req);
    const skill = String(body.skill || body.skill_key || "").trim();
    if (!skill) throw new ApiError(400, "Skill key is required.");

    const { data: existing } = await admin()
      .from("skill_settings")
      .select("*")
      .eq("skill_key", skill)
      .maybeSingle();
    const prev = (existing || {}) as Record<string, unknown>;

    const row = {
      skill_key: skill,
      name: body.name !== undefined ? String(body.name) : String(prev.name || skill),
      reg_open: body.regOpen !== undefined ? !!body.regOpen : prev.reg_open !== false,
      available: body.available !== undefined ? !!body.available : prev.available !== false,
      whatsapp_url:
        body.whatsapp !== undefined
          ? String(body.whatsapp)
          : String(prev.whatsapp_url || prev.whatsapp || ""),
    };

    await admin().from("skill_settings").upsert(row);
    send(res, 200, { ok: true, skill: row });
    return;
  }

  throw new ApiError(405, "Method not allowed.");
});
