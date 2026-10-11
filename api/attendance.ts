/**
 * /api/attendance — attendance submissions (backed by `attendance_submissions`).
 *   GET  → own submissions (signed-in), or all when `?all=1` and admin
 *   POST { action: "submit" }              → submit own proof (signed-in)
 *   POST { action: "review" }              → admin: accept / reject + XP
 *   POST { action: "set-type", key, open } → admin: open/close a type
 *
 * RLS also limits reads/inserts to the owner; admin review happens here with a
 * server-side `user_roles` check.
 */
import {
  ApiError,
  admin,
  getSetting,
  getUserFromRequest,
  handler,
  logActivity,
  queryStr,
  readBody,
  requireAdmin,
  send,
  setSetting,
  type ApiRequest,
  type ApiResponse,
} from "../server/lib";

type SubRow = Record<string, unknown>;

function toLegacySub(r: SubRow) {
  return {
    id: r.id,
    studentId: r.kr8_id || r.student_id,
    studentName: r.student_name,
    skill: r.skill || "",
    type: r.type,
    topic: r.topic,
    speaker: r.speaker || undefined,
    screenshotUrl: r.proof_file_url || "",
    isDuplicateScreenshot: !!r.is_duplicate,
    status: r.status || "pending",
    feedback: r.feedback || undefined,
    reviewedBy: r.reviewed_by || undefined,
    reviewedAt: r.reviewed_at ? Date.parse(String(r.reviewed_at)) : undefined,
    submittedAt: r.created_at ? Date.parse(String(r.created_at)) : Date.now(),
  };
}

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  if (req.method === "GET") {
    const wantsAll = queryStr(req, "all") === "1";
    if (wantsAll) {
      await requireAdmin(req);
      const { data } = await admin()
        .from("attendance_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      send(res, 200, {
        ok: true,
        submissions: ((data || []) as SubRow[]).map(toLegacySub),
        types: (await getSetting("attendance_types")) || {},
      });
      return;
    }
    const user = await getUserFromRequest(req);
    if (!user) throw new ApiError(401, "Sign in required.");
    const { data } = await admin()
      .from("attendance_submissions")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);
    send(res, 200, { ok: true, submissions: ((data || []) as SubRow[]).map(toLegacySub) });
    return;
  }

  if (req.method === "POST") {
    const body = await readBody(req);
    const action = String(body.action || "submit");

    if (action === "submit") {
      const user = await getUserFromRequest(req);
      if (!user) throw new ApiError(401, "Sign in required.");
      const type = String(body.type || "class");
      const topic = String(body.topic || "").trim();
      const screenshotUrl = String(body.screenshotUrl || "");
      if (!topic) throw new ApiError(400, "A topic is required.");
      if (!screenshotUrl) throw new ApiError(400, "Proof screenshot is required.");

      const { data: profile } = await admin()
        .from("profiles")
        .select("id, kr8_id, name, skill, avatar")
        .eq("id", user.id)
        .maybeSingle();
      if (!profile) throw new ApiError(404, "Profile not found.");

      // Duplicate proof check (same proof URL from this student).
      const { data: dup } = await admin()
        .from("attendance_submissions")
        .select("id")
        .eq("student_id", user.id)
        .eq("proof_file_url", screenshotUrl)
        .maybeSingle();

      const { data: inserted, error } = await admin()
        .from("attendance_submissions")
        .insert({
          student_id: user.id,
          kr8_id: String((profile as SubRow).kr8_id),
          student_name: String((profile as SubRow).name),
          skill: String((profile as SubRow).skill || ""),
          type,
          topic,
          speaker: String(body.speaker || "") || null,
          proof_file_url: screenshotUrl,
          is_duplicate: !!dup,
          status: "pending",
        })
        .select("*")
        .single();
      if (error || !inserted) throw new ApiError(500, "Attendance could not be submitted.");

      await logActivity({
        kind: type === "assignment" ? "submission" : "attendance",
        name: String((profile as SubRow).name),
        skill: String((profile as SubRow).skill || ""),
        avatar: String((profile as SubRow).avatar || ""),
        customAction:
          type === "assignment" ? "submitted an Assignment" : `submitted ${type} attendance`,
      });

      send(res, 200, { ok: true, submission: toLegacySub(inserted as SubRow) });
      return;
    }

    if (action === "review") {
      const ctx = await requireAdmin(req);
      const id = String(body.id || "");
      const status = String(body.status) === "rejected" ? "rejected" : "accepted";
      const feedback = String(body.feedback || "").trim();

      const { data: target } = await admin()
        .from("attendance_submissions")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!target) throw new ApiError(404, "Submission not found.");

      await admin()
        .from("attendance_submissions")
        .update({
          status,
          feedback: feedback || null,
          reviewed_by: ctx.displayName,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (status === "accepted") {
        const row = target as SubRow;
        const isAssignment = row.type === "assignment";
        const pts = isAssignment ? 15 : 10;
        const { data: prof } = await admin()
          .from("profiles")
          .select("id, points, extra")
          .eq("id", String(row.student_id))
          .maybeSingle();
        if (prof) {
          const extra = ((prof as SubRow).extra as Record<string, unknown>) || {};
          await admin()
            .from("profiles")
            .update({
              points: Number((prof as SubRow).points || 0) + pts,
              extra: {
                ...extra,
                attendanceAccepted: isAssignment
                  ? Number(extra.attendanceAccepted || 0)
                  : Number(extra.attendanceAccepted || 0) + 1,
                submissions: isAssignment
                  ? Number(extra.submissions || 0) + 1
                  : Number(extra.submissions || 0),
              },
            })
            .eq("id", String((prof as SubRow).id));
        }
        await logActivity({
          kind: "attendance",
          name: String(row.student_name || ""),
          skill: String(row.skill || ""),
          customAction: `${isAssignment ? "Assignment" : "Attendance"} was approved`,
        });
      }

      send(res, 200, { ok: true });
      return;
    }

    if (action === "set-type") {
      await requireAdmin(req);
      const key = String(body.key || "");
      const open = !!body.open;
      const current = ((await getSetting("attendance_types")) as Record<string, boolean>) || {};
      current[key] = open;
      await setSetting("attendance_types", current);
      send(res, 200, { ok: true, types: current });
      return;
    }

    throw new ApiError(400, "Unknown action.");
  }

  throw new ApiError(405, "Method not allowed.");
});
