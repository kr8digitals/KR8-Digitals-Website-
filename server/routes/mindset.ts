/**
 * /api/mindset — Mindset Shift events & registrations.
 *   GET  → { events }                                   (public)
 *   GET  ?registrations=1                               (admin)
 *   POST { action: "register", eventCode, ...fields }   (public registration)
 *   POST { action: "verify", registrationId, decision } (admin)
 *   POST { action: "event", eventCode, config }         (admin upsert)
 *   POST { action: "delete", registrationId }           (admin)
 */
import {
  ApiError,
  admin,
  getUserFromRequest,
  handler,
  isStaffRole,
  queryStr,
  readBody,
  send,
  type ApiRequest,
  type ApiResponse,
} from "../lib.js";

async function staffOnly(req: ApiRequest) {
  const user = await getUserFromRequest(req);
  if (!user) throw new ApiError(401, "Sign in required.");
  const { data } = await admin().from("user_roles").select("role").eq("user_id", user.id);
  if (!isStaffRole((data || []) as { role: string }[])) throw new ApiError(403, "Administrator role required.");
  return user;
}

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  const sb = admin();

  if (req.method === "GET") {
    if (queryStr(req, "registrations") === "1") {
      await staffOnly(req);
      const { data } = await sb
        .from("mindset_registrations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      send(res, 200, {
        ok: true,
        registrations: (data || []).map((r) => ({
          id: r.id,
          edition: r.edition || "",
          fullName: r.full_name,
          email: r.email,
          phone: r.phone,
          whatsapp: r.whatsapp || "",
          location: r.location || "",
          status: r.status || "pending",
          accessCode: r.access_code || "",
          resumeCode: r.resume_code || "",
          answers: r.answers || {},
          proof: r.proof || null,
          createdAt: r.created_at ? Date.parse(String(r.created_at)) : Date.now(),
        })),
      });
      return;
    }
    const { data } = await sb.from("mindset_events").select("*").order("created_at", { ascending: false });
    send(res, 200, {
      ok: true,
      events: (data || []).map((r) => ({
        code: r.event_code || r.id,
        config: r.config || {},
        updated_at: r.updated_at || r.created_at,
      })),
    });
    return;
  }

  if (req.method === "POST") {
    const body = await readBody(req);
    const action = String(body.action || "");

    if (action === "register") {
      const edition = String(body.eventCode || "mindset_shift");
      const fullName = String(body.fullName || "").trim();
      const email = String(body.email || "").trim();
      const phone = String(body.phone || "").trim();
      if (!fullName || !email || !phone) throw new ApiError(400, "Name, email and phone are required.");
      const accessCode = `MS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const resumeCode = `R-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      const { data: inserted, error } = await sb
        .from("mindset_registrations")
        .insert({
          edition,
          full_name: fullName,
          email,
          phone,
          whatsapp: body.whatsapp || null,
          location: body.location || null,
          status: "approved",
          access_code: accessCode,
          resume_code: resumeCode,
          answers: {
            heardAbout: body.heardAbout || null,
            hopingToLearn: body.hopingToLearn || null,
            moneyQuestion: body.moneyQuestion || null,
            biggestChallenge: body.biggestChallenge || null,
            financialSituation: body.financialSituation || null,
            areaToImprove: body.areaToImprove || null,
          },
        })
        .select("*")
        .single();
      if (error || !inserted) throw new ApiError(500, "Registration could not be completed.");
      send(res, 200, {
        ok: true,
        registration: {
          id: (inserted as Record<string, unknown>).id,
          edition,
          fullName,
          email,
          phone,
          accessCode,
          resumeCode,
          status: "approved",
          createdAt: Date.now(),
        },
      });
      return;
    }

    if (action === "verify") {
      await staffOnly(req);
      await sb
        .from("mindset_registrations")
        .update({ status: String(body.decision || "approved") })
        .eq("id", String(body.registrationId || ""));
      send(res, 200, { ok: true });
      return;
    }

    if (action === "event") {
      await staffOnly(req);
      await sb.from("mindset_events").upsert({
        event_code: String(body.eventCode || "mindset_shift"),
        config: body.config || {},
        updated_at: new Date().toISOString(),
      });
      send(res, 200, { ok: true });
      return;
    }

    if (action === "delete") {
      await staffOnly(req);
      await sb.from("mindset_registrations").delete().eq("id", String(body.registrationId || ""));
      send(res, 200, { ok: true });
      return;
    }

    throw new ApiError(400, "Unknown action.");
  }

  throw new ApiError(405, "Method not allowed.");
});
