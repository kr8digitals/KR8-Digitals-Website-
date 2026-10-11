/**
 * GET /api/site — public, non-sensitive site bundle.
 *
 * Contains only data that is safe to expose through the public key surface:
 * CMS copy, skill registration settings (incl. WhatsApp group links, needed at
 * registration time), announcements, testimonials, team members, counts and the
 * activity feed. It NEVER includes passwords, phone numbers, emails or DOBs.
 */
import {
  admin,
  handler,
  readBody,
  send,
  type ApiRequest,
  type ApiResponse,
} from "../server/lib";

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  if (req.method === "POST") {
    // Small public helpers that call the project's own functions.
    const body = await readBody(req);
    const action = String(body.action || "");
    if (action === "link-click") {
      const slug = String(body.slug || "").trim();
      if (!slug) {
        send(res, 400, { ok: false, error: "slug is required." });
        return;
      }
      await admin().rpc("increment_link_click", { p_slug: slug }).catch(() => undefined);
      send(res, 200, { ok: true });
      return;
    }
    if (action === "client-request") {
      const { error } = await admin().rpc("submit_client_request", {
        p_name: String(body.name || ""),
        p_email: String(body.email || ""),
        p_phone: String(body.phone || ""),
        p_service: String(body.service || ""),
        p_message: String(body.message || ""),
      });
      if (error) {
        send(res, 500, { ok: false, error: "Could not submit your request." });
        return;
      }
      send(res, 200, { ok: true });
      return;
    }
    send(res, 400, { ok: false, error: "Unknown action." });
    return;
  }

  if (req.method !== "GET") {
    res.statusCode = 405;
    send(res, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  const sb = admin();

  const [
    skillRes,
    annRes,
    testRes,
    teamRes,
    contentRes,
    settingsRes,
    countsRes,
    feedRes,
  ] = await Promise.all([
    sb.from("skill_settings").select("*"),
    sb.from("announcements").select("*").order("created_at", { ascending: false }),
    sb.from("testimonials").select("*").order("created_at", { ascending: false }),
    sb.from("team_members").select("*").order("sort_order", { ascending: true }),
    sb.from("site_content").select("key, data"),
    sb.from("site_settings").select("key, value"),
    sb.rpc("public_counts"),
    sb.rpc("get_recent_activity", { limit_n: 40 }),
  ]);

  const docs: Record<string, unknown> = {};
  for (const row of (contentRes.data || []) as { key: string; data: unknown }[]) {
    docs[row.key] = row.data;
  }
  const settings: Record<string, unknown> = {};
  for (const row of (settingsRes.data || []) as { key: string; value: unknown }[]) {
    settings[row.key] = row.value;
  }

  const skills = ((skillRes.data || []) as Record<string, unknown>[]).map((r) => ({
    key: r.skill_key ?? r.skill,
    name: r.name || r.skill_key || r.skill,
    suffix: r.suffix || undefined,
    // Real column is whatsapp_url; kept as "whatsapp" for the legacy UI shape.
    whatsapp: r.whatsapp_url || r.whatsapp || "",
    available: r.available !== false,
    regOpen: r.reg_open !== false,
  }));

  const announcements = ((annRes.data || []) as Record<string, unknown>[]).map((r) => ({
    id: r.id,
    type: r.type || "text",
    title: r.title,
    body: r.body || undefined,
    image: r.image || undefined,
    videoUrl: r.video_url || undefined,
    videoPoster: r.video_poster || undefined,
    caption: r.caption || undefined,
    date: r.date || (r.created_at ? new Date(String(r.created_at)).toDateString() : ""),
    author: r.author || "KR8 Admin",
    speaker: r.speaker || undefined,
    active: r.active !== false,
  }));

  const testimonials = ((testRes.data || []) as Record<string, unknown>[]).map((r) => ({
    id: r.id,
    name: r.name,
    kr8Id: r.kr8_id || undefined,
    skill: r.skill || "",
    schoolOrRole: r.school_or_role || undefined,
    caption: r.caption || "",
    img: r.img || "",
    video: r.video || undefined,
    duration: r.duration || undefined,
    createdAt: r.created_at ? new Date(String(r.created_at)).getTime() : Date.now(),
    captions: (r.extra as { captions?: unknown })?.captions || undefined,
  }));

  const teamMembers = ((teamRes.data || []) as Record<string, unknown>[]).map((r) => ({
    key: r.slug || r.id,
    name: r.name,
    role: r.role || "",
    bio: r.bio || "",
    photo: r.photo || "",
    founder: !!r.founder,
  }));

  const feed = ((feedRes.data || []) as Record<string, unknown>[]).map((r) => ({
    id: r.id ?? `${r.kind}-${r.created_at}`,
    kind: r.kind,
    name: r.name,
    skill: r.skill,
    avatar: r.avatar || "",
    ts: r.created_at ? new Date(String(r.created_at)).getTime() : Number(r.ts || Date.now()),
    customAction: r.custom_action || undefined,
  }));

  const countsRow = (Array.isArray(countsRes.data) ? countsRes.data[0] : countsRes.data) as
    | Record<string, unknown>
    | null;
  const c = countsRow || {};

  send(res, 200, {
    ok: true,
    site: {
      docs,
      settings,
      skills,
      announcements,
      testimonials,
      teamMembers,
      feed,
      counts: {
        students: Number(c.students ?? c.student_count ?? c.total_students ?? 0),
        tribe: Number(c.tribe ?? c.tribe_count ?? c.total_tribe ?? 0),
        graduated: Number(c.graduated ?? c.graduated_count ?? c.total_graduated ?? 0),
      },
    },
  });
});
