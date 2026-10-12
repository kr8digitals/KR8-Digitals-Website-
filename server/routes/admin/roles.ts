/**
 * POST /api/admin/roles — grant / revoke staff roles (user_roles table).
 * Body:
 *   { action: "grant",  userId | kr8Id, role, permissions?, title? }
 *   { action: "revoke", userId | kr8Id, role? }
 *
 * Only full admins (user_roles: admin / founder / co-founder) may change roles.
 */
import { ApiError, admin, handler, readBody, requireAdmin, send, type ApiRequest, type ApiResponse } from "../../lib.js";

const GRANTABLE = new Set(["admin", "coach", "assistant", "attendance_reviewer", "moderator"]);

async function resolveUserId(body: Record<string, unknown>): Promise<string> {
  const userId = String(body.userId || "");
  if (userId) return userId;
  const kr8Id = String(body.kr8Id || body.id || "");
  if (!kr8Id) throw new ApiError(400, "Missing user reference.");
  let id = "";
  try {
    const { data } = await admin().rpc("get_profile_by_kr8_id", { lookup_id: kr8Id });
    const row = Array.isArray(data) ? data[0] : data;
    id = String((row as { id?: string } | null)?.id || "");
  } catch {
    /* fall through */
  }
  if (!id) {
    const { data } = await admin()
      .from("profiles")
      .select("id")
      .ilike("kr8_id", kr8Id.replace(/[^A-Za-z0-9]/g, "%"))
      .maybeSingle();
    id = String((data as { id?: string } | null)?.id || "");
  }
  if (!id) throw new ApiError(404, "User not found.");
  return id;
}

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  if (req.method !== "POST") throw new ApiError(405, "Method not allowed.");
  const ctx = await requireAdmin(req);
  if (!ctx.isAdmin) throw new ApiError(403, "Only full admins can manage staff roles.");

  const body = await readBody(req);
  const action = String(body.action || "");
  const userId = await resolveUserId(body);

  if (action === "grant") {
    const role = String(body.role || "").toLowerCase();
    if (!GRANTABLE.has(role)) throw new ApiError(400, "That role cannot be granted.");
    await admin()
      .from("user_roles")
      .upsert({
        user_id: userId,
        role,
        permissions: Array.isArray(body.permissions) ? body.permissions : [],
        granted_by: ctx.user.id,
      });
    send(res, 200, { ok: true });
    return;
  }

  if (action === "revoke") {
    let query = admin().from("user_roles").delete().eq("user_id", userId);
    if (body.role) query = query.eq("role", String(body.role));
    else query = query.neq("role", "founder").neq("role", "co-founder");
    await query;
    send(res, 200, { ok: true });
    return;
  }

  throw new ApiError(400, "Unknown action.");
});
