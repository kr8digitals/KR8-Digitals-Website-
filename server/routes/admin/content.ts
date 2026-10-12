/**
 * /api/admin/content — role-checked content management.
 *   GET  /api/admin/content?kind=docs|settings|announcements|testimonials
 *   POST { kind, ... }
 *        kind: "doc"           { key, data }                     → site_content upsert
 *        kind: "setting"       { key, value }                    → site_settings upsert
 *        kind: "announcements" { items: Announcement[] }         → announcements table
 *        kind: "testimonials"  { items: Testimonial[] }          → testimonials table
 *        kind: "team"          { items: TeamMember[] }           → team_members table
 *        kind: "video-comment" { action: add|delete|like, ... }  → video_comments table
 *
 * Writes are admin-only and validated on the server (`user_roles`).
 */
import {
  ADMIN_DOC_KEYS,
  admin,
  ApiError,
  handler,
  parseDocValue,
  queryStr,
  readBody,
  requireAdmin,
  send,
  serializeDocValue,
  type ApiRequest,
  type ApiResponse,
} from "../../lib.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(v: unknown): boolean {
  return typeof v === "string" && UUID_RE.test(v);
}

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  const ctx = await requireAdmin(req);

  if (req.method === "GET") {
    const kind = queryStr(req, "kind") || "docs";
    const sb = admin();
    if (kind === "docs") {
      const { data } = await sb.from("site_content").select("key, value");
      const docs = ((data || []) as { key: string; value: unknown }[]).map((r) => ({
        key: r.key,
        data: parseDocValue(r.value),
      }));
      send(res, 200, { ok: true, docs });
      return;
    }
    if (kind === "settings") {
      const { data } = await sb.from("site_settings").select("key, value");
      send(res, 200, { ok: true, settings: data || [] });
      return;
    }
    if (kind === "announcements") {
      const { data } = await sb.from("announcements").select("*").order("created_at", { ascending: false });
      send(res, 200, { ok: true, items: data || [] });
      return;
    }
    if (kind === "testimonials") {
      const { data } = await sb.from("testimonials").select("*").order("created_at", { ascending: false });
      send(res, 200, { ok: true, items: data || [] });
      return;
    }
    if (kind === "team") {
      const { data } = await sb.from("team_members").select("*").order("sort", { ascending: true });
      const items = ((data || []) as Record<string, unknown>[]).map((r) => ({
        ...r,
        key: r.id,
        photo: r.photo || r.photo_url || "",
      }));
      send(res, 200, { ok: true, items });
      return;
    }
    if (kind === "video-comments") {
      const { data } = await sb.from("video_comments").select("*").order("created_at", { ascending: false });
      send(res, 200, { ok: true, items: data || [] });
      return;
    }
    throw new ApiError(400, "Unknown kind.");
  }

  if (req.method === "POST") {
    const body = await readBody(req);
    const kind = String(body.kind || "");
    const sb = admin();

    if (kind === "doc") {
      const key = String(body.key || "");
      // Historic client config docs use kr8_* keys (CMS, homepage settings,
      // signatures, ...) — they live in site_content alongside the named keys.
      if (!ADMIN_DOC_KEYS.has(key) && !key.startsWith("kr8_")) {
        throw new ApiError(400, "Unknown content key.");
      }
      await sb
        .from("site_content")
        .upsert({ key, value: serializeDocValue(body.data ?? {}), updated_at: new Date().toISOString(), updated_by: ctx.user.id });
      send(res, 200, { ok: true });
      return;
    }

    if (kind === "setting") {
      const key = String(body.key || "");
      if (!ADMIN_DOC_KEYS.has(key) && !key.startsWith("kr8_")) {
        throw new ApiError(400, "Unknown settings key.");
      }
      await sb
        .from("site_settings")
        .upsert({ key, value: body.value ?? {}, updated_at: new Date().toISOString() });
      send(res, 200, { ok: true });
      return;
    }

    if (kind === "announcements") {
      const items = (body.items || []) as Record<string, unknown>[];
      await sb.from("announcements").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (items.length > 0) {
        await sb.from("announcements").insert(
          items.map((a) => ({
            id: isUuid(a.id) ? a.id : undefined,
            type: a.type || "text",
            title: String(a.title || ""),
            body: a.body || null,
            image: a.image || null,
            video_url: a.videoUrl || null,
            video_poster: a.videoPoster || null,
            caption: a.caption || null,
            date: a.date || null,
            author: a.author || "KR8 Admin",
            speaker: a.speaker || null,
            active: a.active !== false,
          }))
        );
      }
      send(res, 200, { ok: true });
      return;
    }

    if (kind === "testimonials") {
      const items = (body.items || []) as Record<string, unknown>[];
      await sb.from("testimonials").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (items.length > 0) {
        await sb.from("testimonials").insert(
          items.map((t) => ({
            id: isUuid(t.id) ? t.id : undefined,
            name: String(t.name || ""),
            kr8_id: t.kr8Id || null,
            skill: t.skill || "",
            school_or_role: t.schoolOrRole || null,
            caption: String(t.caption || ""),
            img: t.img || "",
            video: t.video || null,
            duration: t.duration || null,
            created_at: t.createdAt ? new Date(Number(t.createdAt)).toISOString() : undefined,
            extra: { captions: t.captions || null },
          }))
        );
      }
      send(res, 200, { ok: true });
      return;
    }

    if (kind === "team") {
      const items = (body.items || []) as Record<string, unknown>[];
      await sb.from("team_members").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (items.length > 0) {
        await sb.from("team_members").insert(
          items.map((t, i) => ({
            name: String(t.name || ""),
            role: String(t.role || ""),
            bio: String(t.bio || ""),
            photo: String(t.photo || ""),
            photo_url: String(t.photo || ""),
            sort: i,
            visible: true,
          }))
        );
      }
      send(res, 200, { ok: true });
      return;
    }

    if (kind === "video-comment") {
      const action = String(body.action || "add");
      if (action === "add") {
        const user = await requireAdmin(req);
        await sb.from("video_comments").insert({
          video_id: String(body.videoId || ""),
          author_name: String(body.authorName || user.displayName),
          author_id: user.user.id,
          comment: String(body.comment || "").slice(0, 2000),
          likes: 0,
        });
        send(res, 200, { ok: true });
        return;
      }
      if (action === "delete") {
        await sb.from("video_comments").delete().eq("id", String(body.id || ""));
        send(res, 200, { ok: true });
        return;
      }
      if (action === "like") {
        const { data: row } = await sb.from("video_comments").select("likes").eq("id", String(body.id || "")).maybeSingle();
        const likes = Number((row as { likes?: number } | null)?.likes || 0) + 1;
        await sb.from("video_comments").update({ likes }).eq("id", String(body.id || ""));
        send(res, 200, { ok: true, likes });
        return;
      }
      throw new ApiError(400, "Unknown action.");
    }

    throw new ApiError(400, "Unknown kind.");
  }

  throw new ApiError(405, "Method not allowed.");
});
