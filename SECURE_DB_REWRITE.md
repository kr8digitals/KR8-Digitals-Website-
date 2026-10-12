# KR8 Digitals — Secure Supabase Integration (Live DB `koslvogrrahgaxfbifsn`)

Final deliverables for the rewrite. Everything below is implemented on branch
**`arena/83222011-kr8-digitals-website`** (the platform pins this session's
branch; nothing was ever pushed to `main`). Commit chain:
`a0aeed6 → 87f4f85 → b5378f9 → 379e0a9 → ff463ba → c4bd0f6 → 2d41591 → 32ba580 → af2e87a`.

> Every rule comes from the brief and the live schema you confirmed — the
> retired `kr8-digitals-enhancer` reference is ignored entirely.

---

## 1. Architecture (Vercel)

- **One logical API function.** Vercel turns every file under `api/` into a
  Serverless Function (Hobby limit 12), so `api/` contains only three thin
  endpoint entries that re-export the single dispatcher
  `server/routes/dispatch.ts`:
  - `api/[...route].ts` → `/api/<segment>`
  - `api/auth/[rest].ts` → `/api/auth/login|register|reset`
  - `api/admin/[rest].ts` → `/api/admin/students|graduation|roles|skills|content`
- All route logic lives in **`server/routes/**`** as plain handler modules
  (`server/routes/auth/*`, `server/routes/admin/*`, `server/routes/*.ts`).
- **Node-ESM safe**: every relative import in `api/` and `server/` carries an
  explicit `.js` extension (compiled `.ts` → `.js` runs as native ESM because
  `package.json` has `"type": "module"`). No directory/JSON imports, no
  `require()`/`__dirname` in the function graph.
- **`vercel.json`** (exact):
  ```json
  {
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "framework": "vite",
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "rewrites": [
      { "source": "/api/:path*", "destination": "/api/[...route]" },
      { "source": "/", "destination": "/index.html" },
      { "source": "/:path((?!api(?:/|$)).*)", "destination": "/index.html" }
    ]
  }
  ```
  `framework: vite` overrides the dashboard's wrong `tanstack-start` preset;
  `/api/*` (any depth) reaches the function; everything else falls back to the
  SPA's `index.html`.
- The dispatcher resolves the real path from
  `x-vercel-original-url` → `req.url` → route/rest query (last resort).
- Oversized request bodies (> 4 MB) are rejected with a clear JSON **413**
  ("send only ids and small fields") instead of the platform's opaque error.

## 2. Auth & roles (server-verified; nothing trusted from the browser)

- **Supabase Auth only.** Registration = `signUp` with
  `emailRedirectTo: ${SITE_URL}/welcome`; the KR8 ID is generated **only** by
  the `handle_new_user` trigger (never in the browser). Email confirmation is
  always required: `/registered` → confirm → `/welcome` (KR8 ID + copy,
  `skill_settings.whatsapp_url` join button, completion saved in
  `onboarding_status`).
- Sign-in accepts **KR8 ID / email / phone**, resolved on the server
  (`get_profile_by_kr8_id` → `lower(email)` → `phone_normalized`) before
  `signInWithPassword`. ~77 existing students keep their passwords — nothing
  imported.
- Password reset is link-only (`resetPasswordForEmail` →
  `${SITE_URL}/reset-password`); the old autofill-code flow is gone.
- **Staff = a `user_roles` row with role** `founder`, `co-founder`, `admin`,
  `moderator`, `coach`, or `attendance_reviewer` — checked with the database
  functions `is_admin(uuid)`, `is_staff(uuid)`, `has_role(uuid, text)`,
  `has_permission(uuid, text)`, `can_manage(uuid, text)` (direct `user_roles`
  scan only as deny-by-default fallback).
- `adminFromRoles()` surfaces admin identity **only** to staff (a `student`
  role row never produces admin info — the fix for the leaked admin card).
- Every `/api/admin/*` handler and every privileged action (attendance
  review/set-type, live room creation, social moderation) calls
  `requireAdmin`/staff checks and answers **403 JSON** to non-staff, **401**
  to anonymous.
- The admin UI renders only for server-verified staff and **redirects**
  non-staff to `/dashboard`; the client-side unlock/"Lock Dashboard" gates are
  removed. Founder = `kr8digitals01@gmail.com` (`founder` row in `user_roles`).
- Proof: `npm run test:authz` (`scripts/authz-test.mts`) calls every admin
  route + privileged route with the real handlers against a mock Supabase:
  **401 (no token) / 403 (student) / gate passes (staff)**.

## 3. Registration / graduation specifics

- Certificate code: `CERT-KR8-{kr8_id}-{SKILLKEY_UPPER}-{6 from
  ABCDEFGHJKMNPQRSTUVWXYZ23456789}`; insert columns exactly
  `certificate_code, student_id, kr8_id, student_name, formatted_name, skill,
  skill_name, tier, achievement_text, issued_by, status`.
- `notify_certificate` trigger sends the in-app notification (never inserted
  manually). Resend email (`RESEND_API_KEY`/`RESEND_FROM`) carries the code +
  `{SITE_URL}/verify?code=…`, sets `certificates.email_sent_at` /
  `email_failure_reason` (+ `email_logs`). Withdraw sets `status='withdrawn'`,
  `withdrawn_at`, `withdrawal_reason`, `withdrawn_by`. Admin cert rows have a
  **Resend Email** button. Registration sends no custom email.
- Graduation requests send **ids and small fields only** — generated artwork
  (PNG dataURL/PDF) stays client-side and is never transmitted (this removed
  the 413s on later graduations). After issuance the client regenerates the
  printed artwork so the printed code === the DB code.

## 4. Database usage — every table / column / RPC

**Tables & columns (real schema):**

| Table | Columns used |
|---|---|
| `profiles` | `id` (=auth uid), `kr8_id`, `name`, `email`, `phone`, `phone_normalized`, `country`, `dob`, `skill`, `avatar`, `bio`, `cover_photo`, `points`, `attendance_accepted`, `submissions`, `referrals`, `graduated`, `cert_tier`, `cert_recognition`, `joined`, `phone_verified` (protected columns change only server-side) |
| `user_roles` | `user_id`, `role`, `title`, `permissions` |
| `skill_settings` | `skill_key`, `name`, `reg_open`, `available`, `whatsapp_url` |
| `certificates` | `certificate_code`, `student_id`, `kr8_id`, `student_name`, `formatted_name`, `skill`, `skill_name`, `tier`, `achievement_text`, `issued_by`, `status`, `issued_at`, `email_sent_at`, `email_failure_reason`, `withdrawn_at`, `withdrawal_reason`, `withdrawn_by` |
| `enrollments` | `student_id`, `kr8_id`, `skill`, `status`, `graduated`, `graduated_at` |
| `onboarding_status` | `user_id`, `whatsapp_done`, `completed_at` |
| `team_members` | `id`, `name`, `role`, `bio`, `photo_url`, `social_links`, **`sort`** (not `sort_order`), `visible`, `created_at`, `updated_at`, `photo` |
| `site_content` | **`page`, `key`, `value`, `updated_at`, `updated_by`** (not `data`) — writes JSON-encode `value`, reads `select key, value` |
| `attendance_submissions` | `id`, `student_id`, `type`, `status`, `feedback`, `reviewed_by`, `reviewed_at`, proof fields |
| `site_settings` | `key`, `value`, `updated_at` |
| `announcements`, `testimonials` | as mapped in `server/routes/site.ts` / `admin/content.ts` |
| `activity_log`, `notifications`, `email_logs` | written server-side |
| `live_rooms`, `room_admissions`, `room_messages`, `recordings` | live features (+ optional `started_at`, `ended_at`, `participant_count`, `message_count`) |
| `mindset_events`, `mindset_registrations`, `blog_posts`, `gallery_items`, `videos`, `user_follows`, `blog_comments`, `blog_post_likes`, `video_comments`, `client_requests`, `messages` | social / content features |
| `auth.users` | via Supabase Auth / auth admin only |

**RPCs called (never recreated):**
`public_counts()` · `get_leaderboard(limit_n)` · `get_recent_activity(limit_n)` ·
`get_profile_by_kr8_id(lookup_id)` · `verify_certificate_public(cert_code)` ·
`admin_list_students(p_search, p_skill, p_status, p_limit, p_offset)` ·
`admin_overview()` · `apply_points(p_user_id uuid, p_kr8_id text,
p_points_change integer, p_reason text, p_actor_id uuid)` ·
`increment_link_click(p_slug)` · `submit_client_request(p_name, p_email,
p_phone, p_service, p_message)` · authz: `is_admin`, `is_staff`, `has_role`,
`has_permission`, `can_manage`.

**Triggers relied on (never recreated):** `handle_new_user`,
`prevent_protected_profile_changes`, `notify_certificate`, and the
`REGISTRATION_CLOSED:` error (shown as a friendly message).

## 5. `/migrations` — apply in order (nothing destructive)

| File | Purpose |
|---|---|
| `0001_lockdown_legacy_policies.sql` | Drops, **by name and only if present**, the legacy objects the old browser auth created (anonymous policies on `accounts`/`certificates`/…, `next_kr8_serial`, `get_unified_leaderboard`, …). Never drops tables or data. |
| `001_onboarding.sql` | `onboarding_status(user_id uuid pk → auth.users, whatsapp_done boolean default false, completed_at timestamptz)` + own-row RLS. |
| `002_compat_columns.sql` | Additive `ADD COLUMN IF NOT EXISTS` for certificates (`email_sent_at`, `email_failure_reason`, `withdrawn_at`, `withdrawal_reason`, `withdrawn_by`) and live-room columns (`started_at`, `ended_at`, `participant_count`, `message_count`); `CREATE TABLE IF NOT EXISTS` for `client_requests`, `messages`, `user_follows`, `blog_comments`, `blog_post_likes`, `gallery_items`, `video_comments`. |
| `003_site_content_page_default.sql` | **Optional** — sets `site_content.page` default to `'site'` so doc upserts that don't pass `page` can't hit a NOT NULL error. Changes no rows; skip if unneeded. |

## 6. Environment variables (Vercel)

Server (never `VITE_`): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`SUPABASE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM`, `SITE_URL`,
`LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`.
Client: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
`VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, `VITE_SITE_URL`,
`VITE_LIVEKIT_URL`. No service key in any `VITE_` variable; no secrets or real
data in the repo.

## 7. Test checklist

1. **Register a test student** → `/registered` shows "GO TO YOUR EMAIL AND
   CONFIRM YOUR REGISTRATION" (resend + change email work; no KR8 ID shown).
2. **Open the email link** → `/welcome`: KR8 ID + Copy, WhatsApp group opens
   from `skill_settings.whatsapp_url`, "Done" saves `onboarding_status`.
3. Sign in **before** confirming → friendly confirm panel with resend.
4. Sign in as an existing student with **KR8 ID, email, and phone**.
5. **Student security check**: as a normal student the admin card is absent,
   `/admin` and `/attendance-review` redirect to the dashboard, and every
   `/api/admin/*` call returns 403 (see `npm run test:authz`).
6. **Graduate a test student** as admin — official `CERT-KR8-…` code, in-app
   notification + email with working verify link, "Resend Email" works, and
   the network body of `POST /api/admin/graduation` is a few hundred bytes
   (no images). Graduate a second student immediately — no 413.
7. **Public verify** `/verify?code=CERT-KR8-…` shows status/tier and the
   official-portal line — never exposes email/phone.
8. **Password reset**: emailed link → `/reset-password` (no autofill code).
9. **Live room**: staff creates a stream (students are rejected with 403),
   students join and chat.

## 8. Known gaps / notes

- `site_content.page` nullability is unknown → `003` migration provided; the
  app writes `{ key, value, updated_at, updated_by }` and reads `key, value`.
- Live-room counters (`started_at`, `ended_at`, `participant_count`,
  `message_count`) are created additively by `002` if absent.
- `team_members` has no `slug`/`founder` columns — those fields are mapped to
  `id`/omitted; founder bios live in the `founders` site_content doc.
