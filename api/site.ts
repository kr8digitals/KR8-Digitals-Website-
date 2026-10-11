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
  send,
  type ApiRequest,
  type ApiResponse,
} from "../server/lib";

export default handler(async (req: ApiRequest, res: ApiResponse) => {
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
    feedRes,
    studentCountRes,
    tribeCountRes,
    gradCountRes,
  ] = await Promise.all([
    sb.from("skill_settings").select("*"),
    sb.from("announcements").select("*").order("created_at", { ascending: false }),
    sb.from("testimonials").select("*").order("created_at", { ascending: false }),
    sb.from("team_members").select("*").order("sort_order", { ascending: true }),
    sb.from("site_content").select("key, data"),
    sb.from("site_settings").select("key, value"),
    sb.from("activity_log").select("*").order("created_at", { ascending: false }).limit(40),
    sb.from("profiles").select("id", { count: "exact", head: true }).eq("extra->>type", "student"),
    sb.from("profiles").select("id", { count: "exact", head: true }).eq("extra->>type", "tribe"),
    sb.from("profiles").select("id", { count: "exact", head: true }).eq("graduated", true),
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
    key: r.skill,
    name: r.name || r.skill,
    suffix: r.suffix || undefined,
    whatsapp: r.whatsapp || "",
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
    id: r.id,
    kind: r.kind,
    name: r.name,
    skill: r.skill,
    avatar: r.avatar || "",
    ts: r.created_at ? new Date(String(r.created_at)).getTime() : Date.now(),
    customAction: r.custom_action || undefined,
  }));

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
        students: studentCountRes.count ?? 0,
        tribe: tribeCountRes.count ?? 0,
        graduated: gradCountRes.count ?? 0,
      },
    },
  });
});
