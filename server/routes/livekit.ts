/**
 * POST /api/livekit — mint a LiveKit room token ON THE SERVER.
 * Body: { room: string, role?: "host" | "co-host" | "panelist" | "moderator" | "attendee" }
 *
 * Requires a signed-in user. The LiveKit API key/secret never reach the browser.
 */
import {
  ApiError,
  LIVEKIT_URL,
  admin,
  getUserFromRequest,
  handler,
  isStaffRole,
  mintLiveKitToken,
  readBody,
  send,
  type ApiRequest,
  type ApiResponse,
} from "../lib.js";

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  if (req.method !== "POST") throw new ApiError(405, "Method not allowed.");
  const user = await getUserFromRequest(req);
  if (!user) throw new ApiError(401, "Sign in required to join the live room.");

  const body = await readBody(req);
  const room = String(body.room || "").trim();
  if (!room) throw new ApiError(400, "Room name is required.");

  const { data: roleRows } = await admin()
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);
  const staff = isStaffRole((roleRows || []) as { role: string }[]);

  const requested = String(body.role || "attendee");
  const canPublish = staff || ["host", "co-host", "panelist", "moderator"].includes(requested);
  const isHost = staff && ["host", "moderator"].includes(requested);

  const identity = String(user.user_metadata?.kr8_id || user.id);
  const name = String(user.user_metadata?.name || user.email || identity);

  const token = mintLiveKitToken({
    identity,
    name,
    room,
    canPublish,
    canPublishData: true,
    roomAdmin: isHost,
    ttlSeconds: 6 * 60 * 60,
  });

  send(res, 200, {
    ok: true,
    token,
    url: LIVEKIT_URL,
    identity,
    name,
    role: requested,
    canPublish,
  });
});
