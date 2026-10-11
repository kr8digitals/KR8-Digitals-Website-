/**
 * POST /api/auth/register
 *
 * Public registration happens through `supabase.auth.signUp` in the browser:
 * the handle_new_user trigger creates the profile and generates the KR8 ID
 * (never generated client-side), and the REGISTRATION_CLOSED trigger guards
 * per-skill registration (skill_settings.reg_open / available).
 *
 * This endpoint keeps the authenticated SKILL TRANSITION flow:
 *   { action: "transition", skill: "<skill key>" }  (Bearer session required)
 *     - tribe member  → student (sets profiles.skill)
 *     - graduated student → new skill (sets profiles.skill, clears graduation
 *       flags for the new track)
 * The KR8 ID is owned by the trigger-generated format and is kept as-is.
 */
import {
  admin,
  ApiError,
  handler,
  logActivity,
  readBody,
  requireUser,
  send,
  type ApiRequest,
  type ApiResponse,
} from "../../server/lib";

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  if (req.method !== "POST") throw new ApiError(405, "Method not allowed.");
  const body = await readBody(req);

  if (body.action === "transition") {
    const user = await requireUser(req);
    const skill = String(body.skill || "").trim();
    if (!skill) throw new ApiError(400, "A target skill is required.");

    const { data: profile } = await admin()
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    const row = (profile || {}) as Record<string, unknown>;
    if (!row.id) throw new ApiError(404, "Profile not found.");

    // Closed registrations block transitions too (same REGISTRATION_CLOSED rule).
    const { data: skillRow } = await admin()
      .from("skill_settings")
      .select("*")
      .eq("skill_key", skill)
      .maybeSingle();
    const s = (skillRow || {}) as Record<string, unknown>;
    if (s && (s.reg_open === false || s.available === false)) {
      throw new ApiError(403, `REGISTRATION_CLOSED: Registration for this skill is closed.`);
    }

    const wasTribe = !row.skill;
    const wasGraduated = !!row.graduated;

    await admin()
      .from("profiles")
      .update({
        skill,
        ...(wasGraduated
          ? { graduated: false, cert_tier: null, cert_recognition: null }
          : {}),
      })
      .eq("id", user.id);
    try {
      await admin()
        .from("enrollments")
        .upsert({ student_id: user.id, kr8_id: row.kr8_id, skill, status: "active" });
    } catch {
      /* best-effort */
    }

    await logActivity({
      kind: wasTribe ? "registration" : "skill",
      name: String(row.name || ""),
      skill: String(s.name || skill),
      customAction: wasTribe ? "joined the Academy as a student" : `unlocked a new skill track`,
    });

    send(res, 200, {
      ok: true,
      kr8Id: String(row.kr8_id || ""),
      account: { ...row, skill },
    });
    return;
  }

  throw new ApiError(400, "Public registration uses Supabase sign-up on the client.");
});
