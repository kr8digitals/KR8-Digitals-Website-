/**
 * The one and only Vercel function entry. Each file under /api becomes a
 * Serverless Function, so every /api/* request is dispatched from THIS file
 * by path to the route handlers in server/routes/ (the exact same modules the
 * local dev server runs).
 *
 * All URLs are unchanged:
 *   /api/auth/login · /api/auth/register · /api/auth/reset · /api/me
 *   /api/admin/content · /api/admin/graduation · /api/admin/roles
 *   /api/admin/skills · /api/admin/students · /api/attendance
 *   /api/leaderboard · /api/verify · /api/site · /api/activity
 *   /api/live · /api/livekit · /api/mindset · /api/social
 */
import { handler, send, type ApiRequest, type ApiResponse } from "../server/lib.js";

import activity from "../server/routes/activity.js";
import adminContent from "../server/routes/admin/content.js";
import adminGraduation from "../server/routes/admin/graduation.js";
import adminRoles from "../server/routes/admin/roles.js";
import adminSkills from "../server/routes/admin/skills.js";
import adminStudents from "../server/routes/admin/students.js";
import attendance from "../server/routes/attendance.js";
import authLogin from "../server/routes/auth/login.js";
import authRegister from "../server/routes/auth/register.js";
import authReset from "../server/routes/auth/reset.js";
import leaderboard from "../server/routes/leaderboard.js";
import live from "../server/routes/live.js";
import livekit from "../server/routes/livekit.js";
import me from "../server/routes/me.js";
import mindset from "../server/routes/mindset.js";
import site from "../server/routes/site.js";
import social from "../server/routes/social.js";
import verify from "../server/routes/verify.js";

type RouteHandler = (req: ApiRequest, res: ApiResponse) => Promise<void>;

const routes: Record<string, RouteHandler> = {
  "activity": activity,
  "admin/content": adminContent,
  "admin/graduation": adminGraduation,
  "admin/roles": adminRoles,
  "admin/skills": adminSkills,
  "admin/students": adminStudents,
  "attendance": attendance,
  "auth/login": authLogin,
  "auth/register": authRegister,
  "auth/reset": authReset,
  "leaderboard": leaderboard,
  "live": live,
  "livekit": livekit,
  "me": me,
  "mindset": mindset,
  "site": site,
  "social": social,
  "verify": verify,
};

/** "/api/auth/login?x=1" → "auth/login" */
function routeKey(req: ApiRequest): string {
  const raw = String(req.url || "").split("?")[0];
  const fromUrl = raw.replace(/^\/api\/?/, "").replace(/^\/+|\/+$/g, "");
  if (fromUrl) return fromUrl;
  const q = req.query?.route;
  const fromQuery = Array.isArray(q) ? q.join("/") : String(q || "");
  return fromQuery.replace(/^\/+|\/+$/g, "");
}

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  const key = routeKey(req);
  const route = routes[key];
  if (!route) {
    send(res, 404, { ok: false, error: "Unknown API route." });
    return;
  }
  await route(req, res);
});
