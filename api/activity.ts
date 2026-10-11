/**
 * /api/activity — community activity feed (backed by `activity_log`).
 *   GET  → latest items (public)
 *   POST → add an item (signed-in users; server sanitizes)
 */
import {
  ApiError,
  admin,
  getUserFromRequest,
  handler,
  logActivity,
  readBody,
  send,
  type ApiRequest,
  type ApiResponse,
} from "../server/lib";

const ALLOWED_KINDS = new Set([
  "submission",
  "attendance",
  "graduation",
  "registration",
  "tribe",
  "blog",
  "project",
  "stream_live",
  "stream_ended",
]);

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  if (req.method === "GET") {
    const { data } = await admin()
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(40);
    const feed = ((data || []) as Record<string, unknown>[]).map((r) => ({
      id: r.id,
      kind: r.kind,
      name: r.name,
      skill: r.skill,
      avatar: r.avatar || "",
      ts: r.created_at ? Date.parse(String(r.created_at)) : Date.now(),
      customAction: r.custom_action || undefined,
    }));
    send(res, 200, { ok: true, feed });
    return;
  }

  if (req.method === "POST") {
    const user = await getUserFromRequest(req);
    if (!user) throw new ApiError(401, "Sign in required.");
    const body = await readBody(req);
    const kind = ALLOWED_KINDS.has(String(body.kind)) ? String(body.kind) : "project";
    await logActivity({
      kind,
      name: String(body.name || user.user_metadata?.name || "KR8 Creator").slice(0, 120),
      skill: String(body.skill || "").slice(0, 120),
      avatar: String(body.avatar || "").slice(0, 2048),
      customAction: String(body.customAction || "").slice(0, 160),
    });
    send(res, 200, { ok: true });
    return;
  }

  throw new ApiError(405, "Method not allowed.");
});
