/**
 * /api/live — live rooms backed by `live_rooms`, `room_admissions`,
 * `room_messages` and `recordings`.
 *   GET  /api/live                     → active room summary (public)
 *   GET  /api/live?messages=1&room=ID  → room chat (public read)
 *   GET  /api/live?recordings=1        → recordings archive (public)
 *   POST /api/live
 *        { action: "upsert-room", ... }        → host/admin: create/update room
 *        { action: "end-room", roomId }        → host/admin: end + archive
 *        { action: "message", roomId, text }   → signed-in: chat message
 *        { action: "admit", roomId }           → signed-in: record admission
 */
import {
  ApiError,
  admin,
  getUserFromRequest,
  handler,
  isStaffRole,
  readBody,
  send,
  type ApiRequest,
  type ApiResponse,
} from "../lib.js";

function roomSummary(r: Record<string, unknown>) {
  return {
    id: r.id,
    title: r.title,
    category: r.category || "Live Class",
    description: r.description || "",
    hostId: r.host_id || "",
    hostName: r.host_name || "",
    hostAvatar: r.host_avatar || "",
    visibility: r.visibility || "public",
    accessKey: r.access_key || undefined,
    isLive: r.is_live !== false,
    startedAt: r.started_at ? Number(r.started_at) : Date.now(),
    endedAt: r.ended_at ? Number(r.ended_at) : undefined,
    viewerCount: Number(r.viewer_count || 1),
    peakViewers: Number(r.peak_viewers || 1),
    quality: r.quality || "1080p60",
    livekitRoomName: r.livekit_room_name || String(r.id),
    pinnedNotice: r.pinned_notice || undefined,
    chatPermission: r.chat_permission || "everyone",
    isLocked: !!r.is_locked,
    isSuspended: !!r.is_suspended,
    isRecording: !!r.is_recording,
    spotlightParticipantId: r.spotlight_participant_id || null,
  };
}

async function isRoomHost(userId: string, hostId: unknown): Promise<boolean> {
  if (hostId && String(hostId) === userId) return true;
  const { data } = await admin().from("user_roles").select("role").eq("user_id", userId);
  return isStaffRole((data || []) as { role: string }[]);
}

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  const sb = admin();

  if (req.method === "GET") {
    const wantsMessages = req.url?.includes("messages=1");
    const wantsRecordings = req.url?.includes("recordings=1");
    const roomId = (req.url?.match(/room=([^&]+)/) || [])[1] || "";

    if (wantsRecordings) {
      const { data } = await sb
        .from("recordings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(60);
      send(res, 200, {
        ok: true,
        recordings: ((data || []) as Record<string, unknown>[]).map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category || "",
          description: r.description || "",
          hostName: r.host_name || "",
          hostAvatar: r.host_avatar || "",
          visibility: r.visibility || "public",
          accessKey: r.access_key || undefined,
          date: r.date || (r.created_at ? new Date(String(r.created_at)).toDateString() : ""),
          durationMinutes: Number(r.duration_minutes || 0),
          peakViewers: Number(r.peak_viewers || 1),
          thumbnail: r.thumbnail || "",
          videoUrl: r.video_url || "",
        })),
      });
      return;
    }

    if (wantsMessages && roomId) {
      const { data } = await sb
        .from("room_messages")
        .select("*")
        .eq("room_id", decodeURIComponent(roomId))
        .order("created_at", { ascending: true })
        .limit(500);
      send(res, 200, {
        ok: true,
        messages: ((data || []) as Record<string, unknown>[]).map((r) => ({
          id: r.id,
          streamId: r.room_id,
          senderId: r.sender_id,
          senderName: r.sender_name,
          senderRole: r.sender_role || "viewer",
          senderBadge: r.sender_badge || undefined,
          recipientId: r.recipient_id || undefined,
          recipientName: r.recipient_name || undefined,
          text: r.text,
          isPinned: !!r.is_pinned,
          createdAt: r.created_at ? Date.parse(String(r.created_at)) : Date.now(),
        })),
      });
      return;
    }

    const { data } = await sb
      .from("live_rooms")
      .select("*")
      .eq("is_live", true)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    send(res, 200, { ok: true, room: data ? roomSummary(data as Record<string, unknown>) : null });
    return;
  }

  if (req.method === "POST") {
    const user = await getUserFromRequest(req);
    if (!user) throw new ApiError(401, "Sign in required.");
    const body = await readBody(req);
    const action = String(body.action || "");

    if (action === "message") {
      const roomId = String(body.roomId || "");
      const text = String(body.text || "").trim().slice(0, 1000);
      if (!roomId || !text) throw new ApiError(400, "Room and message text are required.");
      const { data: inserted, error } = await sb
        .from("room_messages")
        .insert({
          room_id: roomId,
          sender_id: user.id,
          sender_name: String(user.user_metadata?.name || user.email || "Viewer"),
          sender_role: String(body.senderRole || "viewer"),
          sender_badge: body.senderBadge || null,
          recipient_id: body.recipientId || null,
          recipient_name: body.recipientName || null,
          text,
          is_pinned: false,
        })
        .select("*")
        .single();
      if (error || !inserted) throw new ApiError(500, "Message could not be sent.");
      send(res, 200, {
        ok: true,
        message: {
          id: (inserted as Record<string, unknown>).id,
          streamId: roomId,
          senderId: user.id,
          senderName: String((inserted as Record<string, unknown>).sender_name),
          senderRole: String((inserted as Record<string, unknown>).sender_role),
          text,
          createdAt: Date.now(),
        },
      });
      return;
    }

    if (action === "admit") {
      const roomId = String(body.roomId || "");
      await sb.from("room_admissions").insert({
        room_id: roomId,
        user_id: user.id,
        name: String(user.user_metadata?.name || user.email || "Viewer"),
        role: String(body.role || "attendee"),
      });
      send(res, 200, { ok: true });
      return;
    }

    if (action === "upsert-room") {
      const roomId = String(body.roomId || body.id || `room_${Date.now().toString(36)}`);
      const { data: existing } = await sb.from("live_rooms").select("*").eq("id", roomId).maybeSingle();
      if (!existing) {
        // Starting a live room is staff-only (founder/co-founder/admin/
        // moderator/coach/attendance_reviewer) — students get 403.
        const { data: roleRows } = await admin().from("user_roles").select("role").eq("user_id", user.id);
        if (!isStaffRole((roleRows || []) as { role: string }[])) {
          throw new ApiError(403, "Only staff can start a live room.");
        }
      } else if (!(await isRoomHost(user.id, (existing as Record<string, unknown>).host_id))) {
        throw new ApiError(403, "Only the host can update this room.");
      }
      const row = {
        id: roomId,
        title: String(body.title || (existing as Record<string, unknown>)?.title || "KR8 Live Session"),
        category: String(body.category || (existing as Record<string, unknown>)?.category || "Live Class"),
        description: String(body.description || (existing as Record<string, unknown>)?.description || ""),
        host_id: user.id,
        host_name: String(body.hostName || user.user_metadata?.name || "KR8 Host"),
        host_avatar: String(body.hostAvatar || user.user_metadata?.avatar || ""),
        visibility: String(body.visibility || "public"),
        access_key: body.accessKey || null,
        is_live: body.isLive !== false,
        started_at: Number(body.startedAt) || Date.now(),
        viewer_count: Number(body.viewerCount) || 1,
        peak_viewers: Number(body.peakViewers) || 1,
        quality: String(body.quality || "1080p60"),
        livekit_room_name: String(body.livekitRoomName || roomId),
        pinned_notice: body.pinnedNotice || null,
        chat_permission: String(body.chatPermission || "everyone"),
        is_locked: !!body.isLocked,
        is_suspended: !!body.isSuspended,
        spotlight_participant_id: body.spotlightParticipantId || null,
        is_recording: !!body.isRecording,
      };
      await sb.from("live_rooms").upsert(row);
      send(res, 200, { ok: true, room: roomSummary(row as Record<string, unknown>) });
      return;
    }

    if (action === "end-room") {
      const roomId = String(body.roomId || "");
      const { data: existing } = await sb.from("live_rooms").select("*").eq("id", roomId).maybeSingle();
      if (!existing) throw new ApiError(404, "Room not found.");
      if (!(await isRoomHost(user.id, (existing as Record<string, unknown>).host_id))) {
        throw new ApiError(403, "Only the host can end this room.");
      }
      await sb
        .from("live_rooms")
        .update({ is_live: false, ended_at: Date.now() })
        .eq("id", roomId);
      // Archive to recordings.
      await sb.from("recordings").insert({
        room_id: roomId,
        title: String((existing as Record<string, unknown>).title || "KR8 Live Session"),
        category: String((existing as Record<string, unknown>).category || ""),
        description: String((existing as Record<string, unknown>).description || ""),
        host_name: String((existing as Record<string, unknown>).host_name || ""),
        host_avatar: String((existing as Record<string, unknown>).host_avatar || ""),
        visibility: String((existing as Record<string, unknown>).visibility || "public"),
        access_key: (existing as Record<string, unknown>).access_key || null,
        date: new Date().toDateString(),
        duration_minutes: Math.max(
          1,
          Math.round((Date.now() - Number((existing as Record<string, unknown>).started_at || Date.now())) / 60000)
        ),
        peak_viewers: Number((existing as Record<string, unknown>).peak_viewers || 1),
        thumbnail: "",
        video_url: "",
      });
      send(res, 200, { ok: true });
      return;
    }

    throw new ApiError(400, "Unknown action.");
  }

  throw new ApiError(405, "Method not allowed.");
});
