/**
 * /api/admin/skills — skill_settings (registration open/close, WhatsApp links,
 * availability, ID suffix) management. GET is admin-scoped; the public read of
 * the same data happens through /api/site.
 *   GET → all rows
 *   POST { skill, name?, regOpen?, whatsapp?, available?, suffix? } → upsert
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
    const skill = String(body.skill || "").trim();
    if (!skill) throw new ApiError(400, "Skill key is required.");

    const { data: existing } = await admin()
      .from("skill_settings")
      .select("*")
      .eq("skill", skill)
      .maybeSingle();

    const row = {
      skill,
      name: body.name !== undefined ? String(body.name) : (existing as { name?: string } | null)?.name || skill,
      reg_open: body.regOpen !== undefined ? !!body.regOpen : (existing as { reg_open?: boolean } | null)?.reg_open ?? true,
      whatsapp: body.whatsapp !== undefined ? String(body.whatsapp) : (existing as { whatsapp?: string } | null)?.whatsapp || "",
      available: body.available !== undefined ? !!body.available : (existing as { available?: boolean } | null)?.available ?? true,
      suffix: body.suffix !== undefined ? String(body.suffix) : (existing as { suffix?: string } | null)?.suffix || null,
      updated_at: new Date().toISOString(),
    };

    await admin().from("skill_settings").upsert(row);
    send(res, 200, { ok: true, skill: row });
    return;
  }

  throw new ApiError(405, "Method not allowed.");
});
