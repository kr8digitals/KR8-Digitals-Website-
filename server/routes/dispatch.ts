/**
 * Shared dispatch logic for the single API function. The thin entry files
 * under api/ (api/[...route].ts, api/auth/[rest].ts, api/admin/[rest].ts)
 * re-export this handler; every /api/* URL, at any depth, lands here.
 *
 * The real request path is taken from (in order):
 *   1. x-vercel-original-url (set by Vercel when a rewrite was applied)
 *   2. req.url (original request URL — covers direct filesystem matches)
 *   3. the req.query route/rest param (last resort)
 * Never rely on the query alone — Vercel's route param for bracket file
 * names is not guaranteed to carry the full path.
 */
import { handler, send, type ApiRequest, type ApiResponse } from "../lib.js";

import activity from "./activity.js";
import adminContent from "./admin/content.js";
import adminGraduation from "./admin/graduation.js";
import adminRoles from "./admin/roles.js";
import adminSkills from "./admin/skills.js";
import adminStudents from "./admin/students.js";
import attendance from "./attendance.js";
import authLogin from "./auth/login.js";
import authRegister from "./auth/register.js";
import authReset from "./auth/reset.js";
import leaderboard from "./leaderboard.js";
import live from "./live.js";
import livekit from "./livekit.js";
import me from "./me.js";
import mindset from "./mindset.js";
import site from "./site.js";
import social from "./social.js";
import verify from "./verify.js";

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

/** Normalize a raw path/URL to "auth/login", "site", … ("", if unusable). */
function normalize(raw: string): string {
  let p = String(raw || "").split("?")[0].split("#")[0];
  p = p.replace(/^https?:\/\/[^/]+/i, ""); // absolute URLs (original-url header)
  p = p.replace(/^\/+api\/?/i, "");
  p = p.replace(/^\/+|\/+$/g, "");
  // A rewrite destination literal such as "[...route]" / "[rest]" is not a path.
  if (!p || p.includes("[") || p.includes("]")) return "";
  return p;
}

function routeKey(req: ApiRequest): string {
  const header = req.headers?.["x-vercel-original-url"];
  const candidates = [
    (Array.isArray(header) ? header[0] : header) || "",
    String(req.url || ""),
  ];
  for (const c of candidates) {
    const key = normalize(c);
    if (key) return key;
  }
  const q = req.query?.route ?? req.query?.rest;
  return normalize(Array.isArray(q) ? q.join("/") : String(q || ""));
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
