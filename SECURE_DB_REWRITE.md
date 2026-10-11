# KR8 Digitals — Secure Supabase Integration (Live DB `koslvogrrahgaxfbifsn`)

Deliverables for the rewrite described in the brief. Everything below is implemented
in this repository on the branch **`arena/83222011-kr8-digitals-website`** (the platform
forces this branch for the session; it is pushed and ready for a Vercel preview — the
brief's suggested `secure-db-connect` branch name was not possible from this environment).

> The previous brief's reference to a private `kr8-digitals-enhancer` repo was retired:
> **every rule comes from the brief itself (taken from the live DB)** and is enforced
> here without that repo.

---

## 1. Database access model

- **Service key exists only in serverless functions** (`api/**` + `server/lib.ts`).
  No service key in any `VITE_*` variable, no key embedded in client code, nothing
  sensitive in the repo.
- All writes go through **server endpoints** that re-check authorization with the DB's
  own permission RPCs (`is_admin`, `is_staff`, `has_role`, `has_permission`, `can_manage`)
  before touching anything with the service key.
- The **founder email** `kr8digitals01@gmail.com` holds role `founder` in
  `user_roles(user_id, role, title, permissions)` — no code path hard-codes access;
  every admin surface is gated through the DB role helpers.

### Env var names (set these in Vercel; values live only in Vercel)

| Server (never `VITE_`) | Client (`VITE_`) | Other |
|---|---|---|
| `SUPABASE_URL` | `VITE_SUPABASE_URL` | `LIVEKIT_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | `VITE_SUPABASE_ANON_KEY` | `LIVEKIT_API_KEY` |
| `SUPABASE_PUBLISHABLE_KEY` | `VITE_SUPABASE_PUBLISHABLE_KEY` | `LIVEKIT_API_SECRET` |
| `RESEND_API_KEY` | `VITE_SUPABASE_PROJECT_ID` | `VITE_LIVEKIT_URL` |
| `RESEND_FROM` | `VITE_SITE_URL` | `SITE_URL` (server) |

---

## 2. Registration & email confirmation flow (confirmation always required)

1. **`/academy` / `/register` — "Generate my ID"** calls
   `supabase.auth.signUp({ email, password, options: { data: { name, skill, phone, country, dob }, emailRedirectTo: `${SITE_URL}/welcome` } })`.
   The **KR8 ID is never generated in the browser** — the DB trigger `handle_new_user`
   creates the profile + KR8 ID (`KR8` + 7–9 chars from `ABCDEFGHJKMNPQRSTUVWXYZ23456789`)
   from the trigger payload.
2. **`/registered`** (new page): big celebration of the student's email and a
   large bold **"GO TO YOUR EMAIL AND CONFIRM YOUR REGISTRATION"** message, a spam-folder
   tip, **"Resend confirmation email"** (`supabase.auth.resend({type:"signup", email})`)
   and a **"Change email"** option. **No KR8 ID is shown here** (it does not exist
   until sign-in).
3. **`/welcome`** (new page — landing for the confirmation email link): congratulates the
   student, shows their KR8 ID (`profiles.kr8_id`) with a **Copy ID** button, and a bold
   **JOIN … WHATSAPP** button that opens `skill_settings.whatsapp_url` for the student's
   `profiles.skill` in a new tab. "Done" / "Skip for now" go to the dashboard and save
   completion in the **`onboarding_status` table** (never the browser).
4. **Sign-in before confirming** (`email_not_confirmed`) shows a friendly
   **"GO TO YOUR EMAIL AND CONFIRM YOUR REGISTRATION"** panel with a resend button —
   not a raw error.
5. **Invalid / expired email link** ("Email link is invalid or has expired") shows a
   friendly explanation with a **Resend** option (`/registered`, `/welcome`,
   `/reset-password` all handle it).
6. **`/migrations/001_onboarding.sql`** — creates `onboarding_status(user_id uuid pk →
   auth.users, whatsapp_done boolean, completed_at timestamptz)` + own-row RLS.
   (Migration is written to be safe to run more than once.)

## 3. Sign-in (existing students untouched)

- Login accepts **KR8 ID / email / phone**. The identifier is **resolved on the server**
  (`POST /api/auth/login`): `get_profile_by_kr8_id(upper(id))`, then `lower(email)`, then
  `phone_normalized` → returns the canonical email → `supabase.auth.signInWithPassword`.
  **Emails and phone numbers are never returned to the browser by lookup/public
  surfaces** (leaderboard, `get_profile_by_kr8_id`, certificate verify).
- The ~77 existing students **keep their current passwords** — no account was created,
  imported, or migrated.
- **Password reset** is link-based only: `supabase.auth.resetPasswordForEmail` with
  `emailRedirectTo: ${SITE_URL}/reset-password`. The old autofill-reset-code flow is
  **deleted everywhere** (modal, sign-in page, academy panel, store).
- Registration closed per skill: the trigger error beginning `REGISTRATION_CLOSED:` is
  shown as a friendly "Registration for this skill is closed" message.

## 4. Server endpoints → live tables / RPCs (call only — never recreated)

| Endpoint | Tables / RPCs |
|---|---|
| `POST /api/auth/login` | `get_profile_by_kr8_id`, `profiles`, `auth.signInWithPassword` |
| `POST /api/auth/register` | transition → `profiles.skill` (+ reset of `graduated`/`cert_tier`/`cert_recognition` on new skill); signUp path untouched |
| `POST /api/auth/reset` | `auth.resetPasswordForEmail` |
| `GET /api/leaderboard` | `get_leaderboard(limit_n)` |
| `GET /api/verify` | `verify_certificate_public(cert_code)`, `get_profile_by_kr8_id` (safe fields only) |
| `GET /api/site` | `public_counts()`, `get_recent_activity(limit_n)`, `skill_settings(skill_key,name,reg_open,available,whatsapp_url)`, `testimonials` |
| `POST /api/site` | `increment_link_click(p_slug)` (whatsapp clicks on `/welcome`), `submit_client_request(p_name,p_email,p_phone,p_service,p_message)` |
| `POST /api/me` | `profiles` (own row), `onboarding_status` |
| `POST /api/admin/students` | `admin_list_students(p_search,p_skill,p_status,p_limit,p_offset)`, `admin_overview()`, `get_profile_by_kr8_id`, `auth.admin.createUser({ email_confirm: true, user_metadata })` → `handle_new_user` trigger creates the profile |
| `POST /api/admin/graduation` | `certificates` (exact insert), `profiles`, `enrollments`, `notify_certificate` trigger (in-app notification), Resend email + `email_logs`, `get_profile_by_kr8_id`, withdraw/resend actions |
| `POST /api/attendance` | `attendance_submissions`, `apply_points(...)`, `user_points_log` |
| `POST /api/admin/*` (content, roles, skills) | `site_content`, `site_settings`, `announcements`, `team_members`, `testimonials`, `user_roles`, `skill_settings` (per-skill registration open/closed) |
| `GET /api/live`, `/api/livekit`, `/api/mindset`, `/api/social`, `/api/activity` | `live_rooms`, `room_admissions`, `room_messages`, `recordings`, `mindset_events`, `mindset_registrations`, `blog_posts`, `gallery_items`, `videos`, `activity_log`, `user_follows`, `blog_comments`, `blog_post_likes`, `video_comments`, `notifications` |

### profiles (REAL columns used — `extra` and `kr8_id_normalized` removed)

`id` (= auth uid), `kr8_id`, `name`, `email`, `phone`, `phone_normalized`, `country`,
`dob`, `skill`, `avatar`, `bio`, `cover_photo`, `points`, `attendance_accepted`,
`submissions`, `referrals`, `graduated`, `cert_tier`, `cert_recognition`, `joined`,
`phone_verified`. Protected columns (`points`, `graduated`, `cert_tier`, …) change only
via server-side writes (DB trigger `prevent_protected_profile_changes` enforces it).

### Certificate issuance (spec-exact)

Code: **`CERT-KR8-{kr8_id}-{SKILLKEY_UPPER}-{6 random from ABCDEFGHJKMNPQRSTUVWXYZ23456789}`**
(e.g. `CERT-KR8-KR8VZ7G4KH-GRAPHIC-9WTXEF`). Insert columns exactly: `certificate_code`,
`student_id`, `kr8_id`, `student_name`, `formatted_name`, `skill`, `skill_name`, `tier`
(e.g. "Professionalism"), `achievement_text`, `issued_by` (admin uuid), `status='active'`.
After issuance: `profiles.graduated/cert_tier/cert_recognition` + `enrollments.graduated/
graduated_at` are updated; the **`notify_certificate`** trigger sends the in-app
notification (never inserted manually). Graduation email (Resend, `RESEND_API_KEY` /
`RESEND_FROM`) carries the code + verify link **`{SITE_URL}/verify?code=…`** and sets
`certificates.email_sent_at` or `email_failure_reason` (+ `email_logs` row).
**Withdrawal**: `status='withdrawn'`, `withdrawn_at`, `withdrawal_reason`, `withdrawn_by`.
A **"Resend Email"** button sits on the admin certificate row. Registration sends **no**
custom email.

### Admin tabs (read/write DB server-side)

Students, graduation/certificates, attendance review, skill settings, announcements,
testimonials, site content, site settings, team. Nothing is stored in browser storage as
a source of truth.

---

## 5. `/migrations` — apply in this order (nothing destructive)

| File | Purpose |
|---|---|
| `0001_lockdown_legacy_policies.sql` | Drops any policies/objects this app's old auth-era code created **by name** (anonymous insert/update policies on `accounts`/`certificates`/`attendances`/etc., legacy functions such as `next_kr8_serial`, `get_unified_leaderboard`). Guarded: it only drops things that exist, never tables or data. |
| `001_onboarding.sql` | `onboarding_status` table + own-row RLS + `updated_at` trigger. |
| `002_compat_columns.sql` | Additive `CREATE TABLE IF NOT EXISTS` for `client_requests`, `messages`, `user_follows`, `blog_comments`, `blog_post_likes`, `gallery_items`, `video_comments` (only if absent) + additive `ALTER TABLE … ADD COLUMN IF NOT EXISTS` for certificates (`email_sent_at`, `email_failure_reason`, `withdrawn_at`, `withdrawal_reason`, `withdrawn_by`) and live room columns (`started_at`, `ended_at`, `participant_count`, `message_count`). |

## 6. Test checklist (live DB + Vercel preview)

1. **Register a test student** on `/register` ("Generate my ID") → lands on `/registered`
   with the email + "GO TO YOUR EMAIL AND CONFIRM YOUR REGISTRATION"; "Resend confirmation
   email" works; no KR8 ID visible anywhere yet.
2. **Open the email link** (spam folder tip included) → `/welcome` signed in: KR8 ID shown
   with Copy; **JOIN … WHATSAPP** opens the `skill_settings.whatsapp_url` group in a new
   tab; "Done" saves to `onboarding_status` and lands on the dashboard.
3. **Sign in before confirming** → friendly confirm-your-email panel (no raw error).
4. **Sign in as an existing student** with KR8 ID, email, and phone number (all three
   resolve server-side; unchanged passwords work).
5. **Graduate the test student** as admin → certificate row shows the official
   `CERT-KR8-…` code, student gets the in-app notification + graduation email with a
   working verify link; "Resend Email" re-sends.
6. **Public verify** `/verify?code=CERT-KR8-…` shows status, tier, and "Verify on the
   official KR8 Digitals Student Portal" — never exposes email/phone.
7. **Password reset** (forgot password → emailed link → `/reset-password`) — the old
   autofill-code dialog no longer appears anywhere.
8. **Live room** (LiveKit): create a stream as a staff account and join as a student.

## 7. Known gaps to confirm against the live DB

- `apply_points(...)` is called with `p_user_id, p_points, p_action, p_category, p_note`
  (then `p_student_id`/`p_amount`/`p_reason`); if the live function takes other argument
  names, the server transparently falls back to a direct points update — confirm the
  real signature and adjust `server/lib.ts`.
- Live room columns (`started_at`, `ended_at`, `participant_count`, `message_count`) are
  created additively by `002_compat_columns.sql` if the live tables don't have them yet.
