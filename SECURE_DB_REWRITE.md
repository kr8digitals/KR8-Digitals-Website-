# KR8 Digitals — Secure Supabase Data-Layer Rewrite

**Branch:** `arena/83222011-kr8-digitals-website` (see note below)
**Base:** `a0cb7d1` (main)
**Date:** 2026-10-11

## Branch note

This session is pinned by the platform to the branch `arena/83222011-kr8-digitals-website`
(the suggested name `secure-db-connect` could not be used — Arena tracks the session by
its own branch name). All work was committed there and **pushed only to that branch**;
`main` is untouched. Open the PR **from** `arena/83222011-kr8-digitals-website` and review
the Vercel preview before merging.

Reference repo `kr8digitals/kr8-digitals-enhancer` (@ `975564c…`) returned **403** for both
`git clone` and the GitHub API (private repo), so the logic was re-derived from the brief
plus this repo's existing `src/data/store.ts` semantics (KR8 ID format, progression rules,
flows).

## What changed (architecture)

| Layer | Before | After |
|---|---|---|
| Credentials | plaintext `password` column + `localStorage` sessions | **Supabase Auth** email+password only (email confirmation off / auto-confirmed) |
| Sign-in identifier | client-side account scan | KR8 ID / email / phone resolved **on the server** → `signInWithPassword` |
| Sessions | `localStorage` `kr8_*` | Supabase session (access/refresh token) via `@supabase/supabase-js`; profile from `GET /api/me` |
| Data access | browser reads of accounts/settings | serverless `/api/*` (Vercel functions); service-role key server-only; admin actions gated by `user_roles` |
| Admin gates | hard-coded `KR8@Atd2026` / `MAIN_ADMIN_PASSWORD` in the bundle | role-based (`user_roles`), verified server-side on every call |
| LiveKit tokens | localStorage / env token | minted server-side `POST /api/livekit` (`LIVEKIT_API_KEY`/`SECRET` never in browser) |
| Emails | — | Resend (`RESEND_API_KEY`, `RESEND_FROM`) — graduation email only; registration sends none |
| Reset codes | in-app + "universal testing code" | hashed codes emailed to the account's own email; no autofill, no backdoor |

UI/design is unchanged; flows that moved server-side (registration → bold KR8 ID success
page → WhatsApp group join page → Done/Skip → profile) were implemented in the existing
components (`RegisterPage.tsx`).

## Migrations (apply in order, SQL editor — no data/tables dropped)

| File | What it does |
|---|---|
| `migrations/0001_lockdown_legacy_policies.sql` | Drops the public/anon policies from the legacy `supabase_schema.sql` era (write access from the browser) |
| `migrations/0002_core_tables.sql` | Core tables (below) + `kr8_id_normalized`/`phone_normalized`/`extra jsonb` columns + indexes + backfill |
| `migrations/0003_live_tables.sql` | `live_rooms`, `room_admissions`, `room_messages`, `recordings` |
| `migrations/0004_functions.sql` | RPCs `get_unified_leaderboard(p_limit)`, `next_kr8_serial(p_skill)` |
| `migrations/0005_rls_policies.sql` | RLS: student reads own `profiles` row only; tables locked to service-role (server functions) |
| `migrations/0006_social_mindset.sql` | Social + mindset + `password_reset_codes` tables |

All scripts are **additive and idempotent** (`create table if not exists`, `add column if
not exists`). Existing rows/tables are never dropped or rewritten.

## Tables the code uses (28)

**Core (0002):** `profiles`, `user_roles`, `certificates`, `attendance_submissions`,
`enrollments`, `notifications`, `announcements`, `testimonials`, `site_content`,
`site_settings`, `skill_settings`, `team_members`, `activity_log`, `email_logs`
**Live (0003):** `live_rooms`, `room_admissions`, `room_messages`, `recordings`
**Social/mindset (0006):** `password_reset_codes`, `blog_comments`, `blog_post_likes`,
`client_requests`, `gallery_items`, `messages`, `mindset_events`, `mindset_registrations`,
`user_follows`, `video_comments`

### Key columns

- **profiles** (PK `id` = auth.users.id): `kr8_id` (unique), `kr8_id_normalized`,
  `name`, `email`, `phone`, `phone_normalized`, `country`, `dob`, `skill`, `avatar`,
  `bio`, `points`, `referrals`, `graduated`, `cert_tier`, `cert_recognition`, `joined`,
  `created_at`, `updated_at`, `extra jsonb` (legacy Account fields: type, vip,
  attendanceAccepted, submissions, certificates, notifications, …).
- **user_roles** (PK `user_id`): `role` (admin/founder/co-founder/coach/assistant/
  attendance_reviewer), `permissions jsonb`, `title`, `granted_by`, `created_at`.
- **certificates**: `certificate_code` (unique, public verify key), `student_id`, `kr8_id`,
  `student_name`, `skill`, `tier` (Completion/Professionalism), `status`
  (active/withdrawn), `issued_at`, `issued_by`, `email_sent_at`, `withdrawn_at`,
  `extra jsonb`, `created_at`.
- **attendance_submissions**: student/kr8 id, type, status (pending/accepted/rejected),
  screenshot, feedback, submitted/reviewed timestamps, `extra`.
- **skill_settings** (per skill): `reg_open`, `reg_close`, `whatsapp` (group link),
  `available`, `suffix`, `name` (7-skill seed inserted only when the table is empty).
- **site_content / site_settings**: key/value docs — public keys (`site_content`,
  `homepage_settings`, `announcement_bar`, `signatures`, `attendance_types`, …) plus the
  historic client `kr8_*` keys (CMS, homepage settings, signatures).
- **live_rooms**: `livekit_room_name`, `title`, `host_id`, `is_live`, `visibility`,
  `access_key`, `quality`, `ended_at`; `room_messages` (chat), `room_admissions`,
  `recordings`.
- **mindset_events / mindset_registrations**: event config docs + registration queue.
- **password_reset_codes**: hashed 6-digit codes + expiry (emailed, never stored plain).
- **activity_log**: feed (kind, name, skill, avatar, created_at) — replaces `feed_items`.
- **email_logs**: Resend sends (graduation mails).

### RPCs the code calls

- `get_unified_leaderboard(p_limit integer)` — ranks `profiles` by points; used by
  `GET /api/leaderboard`.
- `next_kr8_serial(p_skill text)` — atomic per-skill serial for server-generated KR8 IDs.

### Auth operations used (Supabase Admin/Auth)

`signInWithPassword`, `getUser`, `setSession`, `signOut`, `auth.admin.createUser`,
`auth.admin.updateUserById` (password changes), `auth.admin.deleteUser` (revoked
registrations).

## Environment variables (Vercel — names only; values never in the repo)

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PUBLISHABLE_KEY`,
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
`VITE_SUPABASE_PROJECT_ID`, `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`,
`VITE_LIVEKIT_URL`, `RESEND_API_KEY`, `RESEND_FROM`, `SITE_URL`, `VITE_SITE_URL`,
`NITRO_PRESET=vercel`. See `.env.example` (no values).

## Server API surface

`/api/auth/login|register|reset`, `/api/me`, `/api/admin/students|graduation|content|
skills|roles`, `/api/site`, `/api/verify`, `/api/leaderboard`, `/api/activity`,
`/api/attendance`, `/api/livekit`, `/api/live`, `/api/mindset`, `/api/social`.
Shared runtime in `server/lib.ts` (service-role client, Bearer auth → `getUser`,
`requireUser`/`requireAdmin` via `user_roles`, Resend `sendEmail`, LiveKit token minting).
Local dev: `npm run dev:api` (tsx) + vite `/api` proxy (`scripts/dev-api.mts`).

## Test checklist (against the live project)

1. **Register** — `/register` as a student: "Generate My ID →" shows the bold KR8 ID
   success page → WhatsApp group page (link from `skill_settings`) → Done/Skip lands on
   the profile. Sign-in with the new ID + password works; `profiles` row + auth user
   exist. Repeat for a Tribe registration (KR8 TRIBE ID).
2. **Log in as an existing student** — one of the ~77 migrated accounts signs in with
   **KR8 ID / email / phone + their existing password** (their Supabase Auth user is
   pre-provisioned with the same password hash). Their profile, points, certs appear.
   Wrong password → "The KR8 ID / email / phone or password is incorrect."
   Forgot-password: code arrives **by email**; no autofill; new password works after.
3. **Graduate a test student** — Admin → Graduation: issue a certificate → `certificates`
   row with `certificate_code`, student sees it on the dashboard, Resend email logged in
   `email_logs`. Withdrawal requires a reason and flips `status='withdrawn'`.
4. **Verify certificate** — public `/verify` with KR8 ID or certificate code shows the
   record (name, skill, tier, status); withdrawn certs show the withdrawal state.
5. **Live room** — open a live room as host (token minted via `/api/livekit`; check
   `LIVEKIT_*` env), join as attendee, chat message posts to `room_messages`, end-room
   clears `is_live`.
6. **Admin surfaces** — reg open/close + WhatsApp per skill (`skill_settings`),
   announcements/testimonials/`site_content` save and persist across devices; attendance
   review (+10 XP class/mindset/hangout, +15 assignment) writes `attendance_submissions`;
   leaderboard/`activity_log` update; suspended account cannot sign in or reset password;
   role changes in Granular Permissions reflect in `user_roles` and gate `/api/admin/*`.

## Known limitations

- `kr8digitals/kr8-digitals-enhancer` is private (403) — logic re-derived from the brief
  and this repo's legacy store semantics; verify KR8 ID format/progression edge cases
  against production during review.
- Migration SQL must be applied in the Supabase SQL editor (no access from here);
  everything DB-side is in `/migrations` with comments.
- Legacy localStorage social extras (client requests archive, per-device blocks) still use
  browser storage as a session cache; all brief-specified domains are DB-backed.
