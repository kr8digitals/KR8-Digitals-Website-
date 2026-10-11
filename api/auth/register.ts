/**
 * POST /api/auth/register
 * Body: { name, email, phone, country, skill, dob, password, ref? }
 *
 * Creates the Supabase Auth user (email auto-confirmed — confirmation is OFF in
 * the project) plus the `profiles` row, generating the KR8 ID ON THE SERVER in
 * the same format as existing IDs (KR8<YEAR><INITIALS><SERIAL4><SKILL-SUFFIX>).
 * Registration sends NO email. The response contains the new account (without
 * any credential material).
 */
import {
  ApiError,
  COHORT_YEAR,
  admin,
  buildKr8Id,
  findProfileByIdentifier,
  handler,
  logActivity,
  normalizeEmail,
  normalizePhone,
  readBody,
  requireUser,
  send,
  skillSuffix,
  toLegacyAccount,
  type ApiRequest,
  type ApiResponse,
} from "../../server/lib";

export default handler(async (req: ApiRequest, res: ApiResponse) => {
  if (req.method !== "POST") throw new ApiError(405, "Method not allowed.");
  const body = await readBody(req);

  // ---- Authenticated skill transition (tribe -> student or new skill) ----
  if (String(body.action || "") === "transition") {
    const user = await requireUser(req);
    const skill = String(body.skill || "").trim();
    if (!skill) throw new ApiError(400, "Please select a skill.");
    const { data: skillRow } = await admin().from("skill_settings").select("*").eq("skill", skill).maybeSingle();
    if (skillRow && (skillRow.available === false || skillRow.reg_open === false)) {
      throw new ApiError(400, "Registration for that skill is currently closed.");
    }
    const { data: profileRow } = await admin().from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (!profileRow) throw new ApiError(404, "Profile not found.");
    const profile = profileRow as Record<string, unknown>;
    const extra = ((profile.extra as Record<string, unknown>) || {}) as Record<string, unknown>;
    const currentType = String(extra.type || "student");
    const suffix = skillSuffix(skill, (skillRow as { suffix?: string } | null)?.suffix || null);

    if (currentType === "tribe") {
      const { data: serialRow } = await admin().rpc("next_kr8_serial", { p_skill: skill });
      const serial = Number(serialRow || 1);
      const studentId = buildKr8Id(String(profile.name || ""), skill, serial, suffix);
      const oldId = String(profile.kr8_id || "");
      await admin()
        .from("profiles")
        .update({
          kr8_id: studentId,
          kr8_id_normalized: studentId.replace(/[\s-]/g, "").toUpperCase(),
          skill,
          extra: {
            ...extra,
            type: "student",
            serial,
            year: COHORT_YEAR,
            skills: [skill],
            previousIds: Array.from(new Set([...((extra.previousIds as string[]) || []), oldId].filter(Boolean))),
            milestones: Array.from(
              new Set([...((extra.milestones as string[]) || []), `Milestone: Transitioned from Tribe Member (${oldId}) to Academy Scholar in ${skill}`])
            ),
            points: Number(extra.points || 0) + 100,
          },
        })
        .eq("id", user.id);
      await admin().from("enrollments").upsert({ student_id: user.id, kr8_id: studentId, skill, status: "active" }).catch(() => undefined);
      await logActivity({ kind: "registration", name: String(profile.name || ""), skill: String((skillRow as { name?: string } | null)?.name || skill), customAction: "transitioned from the Tribe to the Academy" });
      const { data: row } = await admin().from("profiles").select("*").eq("id", user.id).maybeSingle();
      send(res, 200, { ok: true, account: row ? toLegacyAccount(row as Record<string, unknown>, { includePrivate: true }) : { id: studentId, type: "student" } });
      return;
    }

    const graduated = !!profile.graduated || ((extra.graduatedSkills as string[]) || []).length > 0;
    const skills = (extra.skills as string[]) || (profile.skill ? [String(profile.skill)] : []);
    if (skills.includes(skill) || profile.skill === skill) {
      throw new ApiError(409, "You are already registered for that skill. Please sign in to your dashboard.");
    }
    if (!graduated) {
      throw new ApiError(403, "Academic Progression Notice: You must graduate from your current skill (proven by certificate) before enrolling in another skill.");
    }
    const newCode = suffix.replace(/VFD$/i, "") || skill.toUpperCase().slice(0, 3);
    const oldId = String(profile.kr8_id || "");
    const updatedId = `${oldId}-${newCode}`;
    await admin()
      .from("profiles")
      .update({
        kr8_id: updatedId,
        kr8_id_normalized: updatedId.replace(/[\s-]/g, "").toUpperCase(),
        skill,
        graduated: false,
        cert_tier: null,
        extra: {
          ...extra,
          skills: Array.from(new Set([...skills, skill])),
          graduatedSkills: Array.from(new Set([...((extra.graduatedSkills as string[]) || []), String(profile.skill || "")].filter(Boolean))),
          previousIds: Array.from(new Set([...((extra.previousIds as string[]) || []), oldId].filter(Boolean))),
          multiSkillCount: Number(extra.multiSkillCount || 1) + 1,
          points: Number(extra.points || 0) + 500,
          certificateUrl: undefined,
          graduatedAt: undefined,
        },
      })
      .eq("id", user.id);
    await admin().from("enrollments").upsert({ student_id: user.id, kr8_id: updatedId, skill, status: "active" }).catch(() => undefined);
    await logActivity({ kind: "registration", name: String(profile.name || ""), skill: String((skillRow as { name?: string } | null)?.name || skill), customAction: `enrolled in a new skill track (Milestone ID: ${updatedId})` });
    const { data: row } = await admin().from("profiles").select("*").eq("id", user.id).maybeSingle();
    send(res, 200, { ok: true, account: row ? toLegacyAccount(row as Record<string, unknown>, { includePrivate: true }) : { id: updatedId, type: "student" } });
    return;
  }

  const name = String(body.name || "").trim();
  const email = normalizeEmail(String(body.email || ""));
  const phone = normalizePhone(String(body.phone || ""));
  const country = String(body.country || "NG").trim() || "NG";
  const skill = String(body.skill || "").trim();
  const dob = String(body.dob || "").trim();
  const password = String(body.password || "");
  const accountType = String(body.accountType || "student") === "tribe" ? "tribe" : "student";

  if (!name || !email || !phone) throw new ApiError(400, "Full name, email and phone are required.");
  if (password.length < 6) throw new ApiError(400, "Password must be at least 6 characters.");
  if (accountType === "student" && !skill) throw new ApiError(400, "Please select a skill.");

  // Skill settings (registration open / availability) live in `skill_settings`.
  let skillRow: Record<string, unknown> | null = null;
  if (skill) {
    const { data } = await admin()
      .from("skill_settings")
      .select("*")
      .eq("skill", skill)
      .maybeSingle();
    skillRow = (data as Record<string, unknown>) || null;
    if (skillRow && skillRow.available === false) {
      throw new ApiError(400, "That skill track is currently not available.");
    }
    if (skillRow && skillRow.reg_open === false) {
      throw new ApiError(400, "Registration for that skill is currently closed.");
    }
  }

  // ---- Existing-account progression (legacy rules, now server-side) ----
  // A tribe member may transition to a student; a graduated student may enroll
  // in a new skill (the skill code is appended to their KR8 ID). Both keep
  // their Supabase Auth user; the password is updated to the submitted one.
  const existingByEmail = await findProfileByIdentifier(email);
  if (existingByEmail) {
    const extra = ((existingByEmail.extra as Record<string, unknown>) || {}) as Record<string, unknown>;
    const currentType = String(extra.type || "student");

    if (accountType === "tribe") {
      throw new ApiError(409, "An account already exists for this email. Please sign in instead.");
    }

    // Tribe -> student transition.
    if (currentType === "tribe") {
      const suffix = skillSuffix(skill, (skillRow?.suffix as string) || null);
      const { data: serialRow } = await admin().rpc("next_kr8_serial", { p_skill: skill });
      const serial = Number(serialRow || 1);
      const studentId = buildKr8Id(name, skill, serial, suffix);
      const oldId = String(existingByEmail.kr8_id || "");
      await admin()
        .from("profiles")
        .update({
          kr8_id: studentId,
          kr8_id_normalized: studentId.replace(/[\s-]/g, "").toUpperCase(),
          name: name || existingByEmail.name,
          dob: dob || existingByEmail.dob || null,
          skill,
          extra: {
            ...extra,
            type: "student",
            serial,
            year: COHORT_YEAR,
            skills: [skill],
            graduatedSkills: [],
            previousIds: Array.from(new Set([...((extra.previousIds as string[]) || []), oldId].filter(Boolean))),
            milestones: Array.from(
              new Set([
                ...((extra.milestones as string[]) || []),
                `Milestone: Transitioned from Tribe Member (${oldId}) to Academy Scholar in ${skill}`,
              ])
            ),
            points: Number(extra.points || 0) + 100,
          },
        })
        .eq("id", existingByEmail.id);
      await admin().auth.admin.updateUserById(String(existingByEmail.id), { password }).catch(() => undefined);
      await admin()
        .from("enrollments")
        .upsert({ student_id: String(existingByEmail.id), kr8_id: studentId, skill, status: "active" })
        .catch(() => undefined);
      await logActivity({ kind: "registration", name: String(existingByEmail.name || name), skill: String(skillRow?.name || skill), customAction: "transitioned from the Tribe to the Academy" });

      const { data: sessionData } = await admin().auth.signInWithPassword({ email: String(existingByEmail.email), password });
      const { data: row } = await admin().from("profiles").select("*").eq("id", existingByEmail.id).maybeSingle();
      send(res, 200, {
        ok: true,
        session: sessionData?.session
          ? {
              access_token: sessionData.session.access_token,
              refresh_token: sessionData.session.refresh_token,
              expires_at: sessionData.session.expires_at,
            }
          : null,
        account: row ? toLegacyAccount(row as Record<string, unknown>, { includePrivate: true }) : { id: studentId, name, skill, type: "student" },
      });
      return;
    }

    // Student progression rules.
    const graduated = !!existingByEmail.graduated || ((extra.graduatedSkills as string[]) || []).length > 0;
    const skills = (extra.skills as string[]) || (existingByEmail.skill ? [String(existingByEmail.skill)] : []);
    if (skills.includes(skill) || existingByEmail.skill === skill) {
      throw new ApiError(409, `You are already registered for that skill. Please sign in to your dashboard.`);
    }
    if (!graduated) {
      throw new ApiError(
        403,
        "Academic Progression Notice: You must graduate from your current skill (proven by certificate) before enrolling in another skill. Please complete your coursework first."
      );
    }

    const suffix = skillSuffix(skill, (skillRow?.suffix as string) || null);
    const newCode = suffix.replace(/VFD$/i, "") || skill.toUpperCase().slice(0, 3);
    const oldId = String(existingByEmail.kr8_id || "");
    const updatedId = `${oldId}-${newCode}`;
    await admin()
      .from("profiles")
      .update({
        kr8_id: updatedId,
        kr8_id_normalized: updatedId.replace(/[\s-]/g, "").toUpperCase(),
        skill,
        graduated: false,
        cert_tier: null,
        extra: {
          ...extra,
          skills: Array.from(new Set([...skills, skill])),
          graduatedSkills: Array.from(new Set([...((extra.graduatedSkills as string[]) || []), String(existingByEmail.skill || "")].filter(Boolean))),
          previousIds: Array.from(new Set([...((extra.previousIds as string[]) || []), oldId].filter(Boolean))),
          milestones: Array.from(
            new Set([
              ...((extra.milestones as string[]) || []),
              `Milestone: Graduated ${String(existingByEmail.skill || "")} (Certificate Verified) · Enrolled in ${skill}`,
            ])
          ),
          certificateUrl: undefined,
          graduatedAt: undefined,
          multiSkillCount: Number(extra.multiSkillCount || 1) + 1,
          points: Number(extra.points || 0) + 500,
        },
      })
      .eq("id", existingByEmail.id);
    await admin().auth.admin.updateUserById(String(existingByEmail.id), { password }).catch(() => undefined);
    await admin()
      .from("enrollments")
      .upsert({ student_id: String(existingByEmail.id), kr8_id: updatedId, skill, status: "active" })
      .catch(() => undefined);
    await logActivity({ kind: "registration", name: String(existingByEmail.name || name), skill: String(skillRow?.name || skill), customAction: `enrolled in a new skill track (Milestone ID: ${updatedId})` });

    const { data: sessionData } = await admin().auth.signInWithPassword({ email: String(existingByEmail.email), password });
    const { data: row } = await admin().from("profiles").select("*").eq("id", existingByEmail.id).maybeSingle();
    send(res, 200, {
      ok: true,
      session: sessionData?.session
        ? {
            access_token: sessionData.session.access_token,
            refresh_token: sessionData.session.refresh_token,
            expires_at: sessionData.session.expires_at,
          }
        : null,
      account: row ? toLegacyAccount(row as Record<string, unknown>, { includePrivate: true }) : { id: updatedId, name, skill, type: "student" },
    });
    return;
  }
  const existingByPhone = await findProfileByIdentifier(phone);
  if (existingByPhone) {
    throw new ApiError(409, "An account already exists for this phone number. Please sign in instead.");
  }

  // Generate the KR8 ID on the server: unique, sequential per skill.
  const suffix = skillSuffix(skill, (skillRow?.suffix as string) || null);
  let kr8Id = "";
  let serial = 1;
  for (let attempt = 0; attempt < 8; attempt++) {
    const { data: serialRow, error: serialErr } = await admin().rpc("next_kr8_serial", {
      p_skill: skill || "tribe",
    });
    if (serialErr) throw new ApiError(500, "Could not generate KR8 ID. Please try again.");
    serial = Number(serialRow || 1);
    kr8Id =
      accountType === "tribe"
        ? `tribe_${Date.now().toString(36)}${Math.floor(Math.random() * 900 + 100)}`
        : buildKr8Id(name, skill, serial, suffix);
    const { data: clash } = await admin()
      .from("profiles")
      .select("id")
      .eq("kr8_id", kr8Id)
      .maybeSingle();
    if (!clash) break;
    kr8Id = "";
  }
  if (!kr8Id) throw new ApiError(500, "Could not allocate a unique KR8 ID. Please try again.");

  // 1) Supabase Auth user — email auto-confirmed (project setting).
  const { data: created, error: createErr } = await admin().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, kr8_id: kr8Id, account_type: accountType },
  });
  if (createErr || !created?.user) {
    const msg = createErr?.message || "";
    throw new ApiError(
      400,
      /already|exists/i.test(msg)
        ? "An account already exists for this email."
        : "Registration could not be completed. Please check your information."
    );
  }
  const userId = created.user.id;

  const avatar = generateDefaultAvatar(name, kr8Id);
  const extra = {
    type: accountType,
    year: COHORT_YEAR,
    serial: accountType === "student" ? serial : undefined,
    vip: false,
    attendanceAccepted: 0,
    submissions: 0,
    skills: accountType === "student" ? [skill] : [],
    graduatedSkills: [],
    previousIds: [],
    milestones: accountType === "student" ? [`Enrolled in ${String(skillRow?.name || skill)}`] : [],
    multiSkillCount: 1,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone",
    isPlaceholder: false,
  };

  // 2) profiles row.
  const { error: profileErr } = await admin().from("profiles").insert({
    id: userId,
    kr8_id: kr8Id,
    kr8_id_normalized: kr8Id.replace(/[\s-]/g, "").toUpperCase(),
    name,
    email,
    phone,
    phone_normalized: phone,
    country,
    dob: dob || null,
    skill: accountType === "student" ? skill : null,
    avatar,
    bio: null,
    points: 0,
    referrals: 0,
    graduated: false,
    cert_tier: null,
    cert_recognition: null,
    joined: Date.now(),
    extra,
  });
  if (profileErr) {
    // Roll back the auth user so the person can retry cleanly.
    await admin().auth.admin.deleteUser(userId).catch(() => undefined);
    throw new ApiError(500, "Registration could not be completed. Please try again.");
  }

  // 3) Enrollment bookkeeping (student registrations).
  if (accountType === "student" && skill) {
    await admin()
      .from("enrollments")
      .insert({ student_id: userId, kr8_id: kr8Id, skill, status: "active" })
      .catch(() => undefined);
    await logActivity({
      kind: "registration",
      name,
      skill: String(skillRow?.name || skill),
      avatar,
      customAction: "joined the Academy",
    });
  } else {
    await logActivity({ kind: "tribe", name, skill: "KR8 Tribe", avatar, customAction: "joined the Tribe" });
  }

  // Optional referral tracking.
  const ref = String(body.ref || "").trim();
  if (ref) {
    const { data: referrer } = await admin()
      .from("profiles")
      .select("id, referrals, extra")
      .eq("kr8_id", ref.replace(/[\s-]/g, "").toUpperCase())
      .maybeSingle();
    if (referrer) {
      const refExtra = (referrer.extra as Record<string, unknown>) || {};
      await admin()
        .from("profiles")
        .update({
          referrals: Number(referrer.referrals || 0) + 1,
          points: undefined,
          extra: { ...refExtra, referralBonus: Number(refExtra.referralBonus || 0) + 20 },
        })
        .eq("id", referrer.id);
    }
  }

  // 4) Sign the new user in so the browser receives a real Supabase session.
  const { data: sessionData, error: signInErr } = await admin().auth.signInWithPassword({
    email,
    password,
  });
  if (signInErr || !sessionData?.session) {
    send(res, 200, { ok: true, account: { id: kr8Id, name, email, phone, skill, avatar, type: accountType }, session: null });
    return;
  }

  const { data: row } = await admin().from("profiles").select("*").eq("id", userId).maybeSingle();
  send(res, 200, {
    ok: true,
    session: {
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      expires_at: sessionData.session.expires_at,
    },
    account: row
      ? toLegacyAccount(row as Record<string, unknown>, { includePrivate: true })
      : { id: kr8Id, name, email, phone, skill, avatar, type: accountType },
  });
});

// Local fallback avatar generator (kept in sync with the client helper).
function generateDefaultAvatar(name: string, id: string = ""): string {
  const cleanName = (name || "Creator").trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  const label =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : cleanName.slice(0, 2).toUpperCase();
  const seed = (cleanName + id).split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const palettes = ["#ec4899,#8b5cf6", "#06b6d4,#3b82f6", "#f59e0b,#f43f5e", "#10b981,#0d9488", "#a855f7,#6366f1"];
  const [c1, c2] = palettes[Math.abs(seed) % palettes.length].split(",");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="120" height="120" rx="60" fill="url(#g)"/><text x="60" y="66" fill="#fff" font-family="system-ui" font-size="44" font-weight="700" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
