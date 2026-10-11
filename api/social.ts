/**
 * /api/social — community interactions backed by RLS-protected tables:
 *   ?kind=blog        GET → { posts (site_content doc), comments, likes }
 *                     POST { action: "comment" | "like", ... }
 *   ?kind=gallery     GET → approved + pending items (own)
 *                     POST { action: "submit" | "moderate" }
 *   ?kind=clients     GET (admin) / POST { action: "submit" | "update" | "delete" }
 *   ?kind=video-comments GET / POST { action: "add" | "like" }
 *   ?kind=messages    GET → own conversations / POST { action: "send" | "mark-read" }
 *   ?kind=follows     GET → own following list / POST { action: "toggle", targetId }
 *   ?kind=appeal      POST { identifier, text } → suspension appeal
 *
 * Reads of user-generated content are public where the legacy UI shows them
 * publicly; every write is authenticated and scoped to the author unless the
 * caller is an admin (checked against `user_roles` on the server).
 */
import {
  ApiError,
  admin,
  getDoc,
  getUserFromRequest,
  handler,
  isStaffRole,
  queryStr,
  readBody,
  send,
  setDoc,
  type ApiRequest,
  type ApiResponse,
} from "../server/lib";

async function staffCheck(userId: string): Promise<boolean> {
  const { data } = await admin().from("user_roles").select("role").eq("user_id", userId);
  return isStaffRole((data || []) as { role: string }[]);
}

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  const kind = queryStr(req, "kind") || "";
  const sb = admin();

  if (req.method === "GET") {
    if (kind === "blog") {
      const [posts, comments, likes] = await Promise.all([
        getDoc("blog_posts"),
        sb.from("blog_comments").select("*").order("created_at", { ascending: true }),
        sb.from("blog_post_likes").select("post_id"),
      ]);
      send(res, 200, {
        ok: true,
        posts: posts || [],
        comments: (comments.data || []).map((c) => ({
          id: c.id,
          postId: c.post_id,
          authorName: c.author_name,
          authorId: c.author_id,
          comment: c.comment,
          createdAt: c.created_at ? Date.parse(String(c.created_at)) : Date.now(),
        })),
        likes: (likes.data || []).map((l) => l.post_id),
      });
      return;
    }
    if (kind === "gallery") {
      const { data } = await sb
        .from("gallery_items")
        .select("*")
        .order("submitted_at", { ascending: false })
        .limit(200);
      send(res, 200, {
        ok: true,
        items: (data || []).map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description || "",
          category: r.category || "Student Showcases",
          mediaType: r.media_type || "image",
          url: r.url,
          thumbnail: r.thumbnail || undefined,
          date: r.date || "",
          author: r.author || "",
          authorRole: r.author_role || undefined,
          status: r.status || "approved",
          submittedAt: r.submitted_at ? Date.parse(String(r.submitted_at)) : Date.now(),
          featured: !!r.featured,
          link: r.link || undefined,
        })),
      });
      return;
    }
    if (kind === "video-comments") {
      const videoId = queryStr(req, "videoId");
      let q = sb.from("video_comments").select("*").order("created_at", { ascending: false }).limit(200);
      if (videoId) q = q.eq("video_id", videoId);
      const { data } = await q;
      send(res, 200, {
        ok: true,
        items: (data || []).map((r) => ({
          id: r.id,
          videoId: r.video_id,
          authorName: r.author_name,
          authorId: r.author_id || undefined,
          comment: r.comment,
          createdAt: r.created_at ? Date.parse(String(r.created_at)) : Date.now(),
          likes: Number(r.likes || 0),
        })),
      });
      return;
    }
    if (kind === "clients") {
      const user = await getUserFromRequest(req);
      if (!user || !(await staffCheck(user.id))) throw new ApiError(403, "Administrator role required.");
      const { data } = await sb.from("client_requests").select("*").order("created_at", { ascending: false }).limit(300);
      send(res, 200, {
        ok: true,
        items: (data || []).map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone || "",
          company: r.company || "",
          service: r.service || "",
          budget: r.budget || "",
          message: r.message || "",
          status: r.status || "new",
          createdAt: r.created_at ? Date.parse(String(r.created_at)) : Date.now(),
        })),
      });
      return;
    }
    if (kind === "messages") {
      const user = await getUserFromRequest(req);
      if (!user) throw new ApiError(401, "Sign in required.");
      const { data } = await sb
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: true })
        .limit(500);
      send(res, 200, {
        ok: true,
        messages: (data || []).map((r) => ({
          id: r.id,
          senderId: r.sender_id,
          senderName: r.sender_name,
          recipientId: r.recipient_id,
          recipientName: r.recipient_name,
          text: r.text,
          read: !!r.read,
          createdAt: r.created_at ? Date.parse(String(r.created_at)) : Date.now(),
        })),
      });
      return;
    }
    if (kind === "follows") {
      const user = await getUserFromRequest(req);
      if (!user) throw new ApiError(401, "Sign in required.");
      const [following, followers] = await Promise.all([
        sb.from("user_follows").select("followed_id").eq("follower_id", user.id),
        sb.from("user_follows").select("follower_id").eq("followed_id", user.id),
      ]);
      send(res, 200, {
        ok: true,
        following: (following.data || []).map((r) => r.followed_id),
        followers: (followers.data || []).map((r) => r.follower_id),
      });
      return;
    }
    throw new ApiError(400, "Unknown kind.");
  }

  if (req.method === "POST") {
    const body = await readBody(req);
    const user = await getUserFromRequest(req);
    const action = String(body.action || "");

    if (kind === "appeal") {
      await sb.from("client_requests").insert({
        name: String(body.identifier || "").slice(0, 160),
        email: "",
        message: String(body.text || "").slice(0, 4000),
        service: "suspension-appeal",
        status: "new",
      });
      send(res, 200, { ok: true, message: "Your appeal has been received. KR8 administration will review your statement." });
      return;
    }

    if (!user) throw new ApiError(401, "Sign in required.");

    if (kind === "blog") {
      if (action === "comment") {
        await sb.from("blog_comments").insert({
          post_id: String(body.postId || ""),
          author_id: user.id,
          author_name: String(body.authorName || user.user_metadata?.name || "KR8 Creator"),
          comment: String(body.comment || "").slice(0, 2000),
        });
        send(res, 200, { ok: true });
        return;
      }
      if (action === "like") {
        const postId = String(body.postId || "");
        const { data: existing } = await sb
          .from("blog_post_likes")
          .select("post_id")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .maybeSingle();
        if (existing) {
          await sb.from("blog_post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
          send(res, 200, { ok: true, liked: false });
        } else {
          await sb.from("blog_post_likes").insert({ post_id: postId, user_id: user.id });
          send(res, 200, { ok: true, liked: true });
        }
        return;
      }
      throw new ApiError(400, "Unknown action.");
    }

    if (kind === "gallery") {
      if (action === "submit") {
        await sb.from("gallery_items").insert({
          title: String(body.title || "Untitled"),
          description: String(body.description || ""),
          category: String(body.category || "Student Showcases"),
          media_type: String(body.mediaType || "image"),
          url: String(body.url || ""),
          thumbnail: body.thumbnail || null,
          date: new Date().toDateString(),
          author: String(body.author || user.user_metadata?.name || "KR8 Creator"),
          author_role: body.authorRole || null,
          status: "pending",
          featured: false,
          link: body.link || null,
        });
        send(res, 200, { ok: true });
        return;
      }
      if (action === "moderate") {
        if (!(await staffCheck(user.id))) throw new ApiError(403, "Administrator role required.");
        await sb
          .from("gallery_items")
          .update({ status: String(body.status || "approved") })
          .eq("id", String(body.id || ""));
        send(res, 200, { ok: true });
        return;
      }
      if (action === "delete") {
        if (!(await staffCheck(user.id))) throw new ApiError(403, "Administrator role required.");
        await sb.from("gallery_items").delete().eq("id", String(body.id || ""));
        send(res, 200, { ok: true });
        return;
      }
      throw new ApiError(400, "Unknown action.");
    }

    if (kind === "video-comments") {
      if (action === "add") {
        await sb.from("video_comments").insert({
          video_id: String(body.videoId || ""),
          author_name: String(body.authorName || user.user_metadata?.name || "KR8 Creator"),
          author_id: user.id,
          comment: String(body.comment || "").slice(0, 2000),
          likes: 0,
        });
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
      if (action === "delete") {
        if (!(await staffCheck(user.id))) throw new ApiError(403, "Administrator role required.");
        await sb.from("video_comments").delete().eq("id", String(body.id || ""));
        send(res, 200, { ok: true });
        return;
      }
      throw new ApiError(400, "Unknown action.");
    }

    if (kind === "clients") {
      if (action === "submit") {
        await sb.from("client_requests").insert({
          name: String(body.name || "").slice(0, 160),
          email: String(body.email || "").slice(0, 200),
          phone: String(body.phone || "").slice(0, 40),
          company: String(body.company || "").slice(0, 160),
          service: String(body.service || "").slice(0, 160),
          budget: String(body.budget || "").slice(0, 80),
          message: String(body.message || "").slice(0, 4000),
          status: "new",
        });
        send(res, 200, { ok: true });
        return;
      }
      if (action === "update") {
        if (!(await staffCheck(user.id))) throw new ApiError(403, "Administrator role required.");
        await sb
          .from("client_requests")
          .update({ status: String(body.status || "in-progress") })
          .eq("id", String(body.id || ""));
        send(res, 200, { ok: true });
        return;
      }
      if (action === "delete") {
        if (!(await staffCheck(user.id))) throw new ApiError(403, "Administrator role required.");
        await sb.from("client_requests").delete().eq("id", String(body.id || ""));
        send(res, 200, { ok: true });
        return;
      }
      throw new ApiError(400, "Unknown action.");
    }

    if (kind === "messages") {
      if (action === "send") {
        await sb.from("messages").insert({
          sender_id: user.id,
          sender_name: String(user.user_metadata?.name || user.email || "Member"),
          recipient_id: String(body.recipientId || ""),
          recipient_name: String(body.recipientName || ""),
          text: String(body.text || "").slice(0, 4000),
          read: false,
        });
        send(res, 200, { ok: true });
        return;
      }
      if (action === "mark-read") {
        await sb
          .from("messages")
          .update({ read: true })
          .eq("recipient_id", user.id)
          .eq("read", false);
        send(res, 200, { ok: true });
        return;
      }
      throw new ApiError(400, "Unknown action.");
    }

    if (kind === "follows") {
      if (action === "toggle") {
        const target = String(body.targetId || "");
        const { data: existing } = await sb
          .from("user_follows")
          .select("follower_id")
          .eq("follower_id", user.id)
          .eq("followed_id", target)
          .maybeSingle();
        if (existing) {
          await sb.from("user_follows").delete().eq("follower_id", user.id).eq("followed_id", target);
          send(res, 200, { ok: true, following: false });
        } else {
          await sb.from("user_follows").insert({ follower_id: user.id, followed_id: target });
          send(res, 200, { ok: true, following: true });
        }
        return;
      }
      throw new ApiError(400, "Unknown action.");
    }

    throw new ApiError(400, "Unknown kind.");
  }

  throw new ApiError(405, "Method not allowed.");
});
