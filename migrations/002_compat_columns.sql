-- ============================================================
-- KR8 Digitals — compatibility columns (additive, idempotent)
-- ============================================================
-- PURPOSE
--   The live database already provides the real schema (profiles,
--   certificates, skill_settings, live_rooms, room_admissions,
--   room_messages, recordings, email_logs, enrollments, ...). This file only
--   ADDS any column the server code writes whose presence was not confirmed
--   in the spec, via `add column if not exists` / `create table if not
--   exists`. It NEVER drops or rewrites anything, so running it on a fully
--   provisioned database is a no-op.
--
--   Review each block against your live schema and delete anything you
--   already have with different types — the code sends:
--     * ISO timestamps for certificates.*_at
--     * epoch-milliseconds numbers for live_rooms.started_at / ended_at
-- ============================================================

-- ---------- certificates: email tracking + withdrawal audit ----------
-- (code writes: email_sent_at, email_failure_reason, withdrawn_at,
--  withdrawal_reason, withdrawn_by — plus the spec's insert set which
--  assumes formatted_name / skill_name / achievement_text / issued_at exist)
alter table public.certificates add column if not exists issued_at timestamptz default now();
alter table public.certificates add column if not exists formatted_name text;
alter table public.certificates add column if not exists skill_name text;
alter table public.certificates add column if not exists achievement_text text;
alter table public.certificates add column if not exists email_sent_at timestamptz;
alter table public.certificates add column if not exists email_failure_reason text;
alter table public.certificates add column if not exists withdrawal_reason text;
alter table public.certificates add column if not exists withdrawn_by uuid;

-- ---------- live_rooms: columns written by /api/live ----------
alter table public.live_rooms add column if not exists title text;
alter table public.live_rooms add column if not exists category text;
alter table public.live_rooms add column if not exists description text;
alter table public.live_rooms add column if not exists host_id uuid;
alter table public.live_rooms add column if not exists host_name text;
alter table public.live_rooms add column if not exists host_avatar text;
alter table public.live_rooms add column if not exists visibility text default 'public';
alter table public.live_rooms add column if not exists access_key text;
alter table public.live_rooms add column if not exists is_live boolean default true;
alter table public.live_rooms add column if not exists started_at bigint;
alter table public.live_rooms add column if not exists ended_at bigint;
alter table public.live_rooms add column if not exists viewer_count integer default 0;
alter table public.live_rooms add column if not exists peak_viewers integer default 0;
alter table public.live_rooms add column if not exists quality text default '1080p60';
alter table public.live_rooms add column if not exists livekit_room_name text;
alter table public.live_rooms add column if not exists pinned_notice text;
alter table public.live_rooms add column if not exists chat_permission text default 'everyone';
alter table public.live_rooms add column if not exists is_locked boolean default false;
alter table public.live_rooms add column if not exists is_suspended boolean default false;
alter table public.live_rooms add column if not exists spotlight_participant_id uuid;
alter table public.live_rooms add column if not exists is_recording boolean default false;

-- ---------- room_messages ----------
alter table public.room_messages add column if not exists room_id text;
alter table public.room_messages add column if not exists sender_id uuid;
alter table public.room_messages add column if not exists sender_name text;
alter table public.room_messages add column if not exists sender_role text;
alter table public.room_messages add column if not exists sender_badge text;
alter table public.room_messages add column if not exists recipient_id uuid;
alter table public.room_messages add column if not exists recipient_name text;
alter table public.room_messages add column if not exists text text;
alter table public.room_messages add column if not exists is_pinned boolean default false;
alter table public.room_messages add column if not exists created_at timestamptz default now();

-- ---------- room_admissions ----------
alter table public.room_admissions add column if not exists room_id text;
alter table public.room_admissions add column if not exists user_id uuid;
alter table public.room_admissions add column if not exists name text;
alter table public.room_admissions add column if not exists role text default 'attendee';
alter table public.room_admissions add column if not exists created_at timestamptz default now();

-- ---------- recordings ----------
alter table public.recordings add column if not exists room_id text;
alter table public.recordings add column if not exists title text;
alter table public.recordings add column if not exists category text;
alter table public.recordings add column if not exists description text;
alter table public.recordings add column if not exists host_name text;
alter table public.recordings add column if not exists host_avatar text;
alter table public.recordings add column if not exists visibility text default 'public';
alter table public.recordings add column if not exists access_key text;
alter table public.recordings add column if not exists date text;
alter table public.recordings add column if not exists duration_minutes integer default 1;
alter table public.recordings add column if not exists peak_viewers integer default 0;
alter table public.recordings add column if not exists thumbnail text;
alter table public.recordings add column if not exists video_url text;
alter table public.recordings add column if not exists created_at timestamptz default now();

-- ---------- social extras used by /api/social (created only if missing) ----------
create table if not exists public.client_requests (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text,
  phone text,
  service text,
  message text,
  status text default 'new',
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid,
  recipient_id uuid,
  text text,
  read boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.user_follows (
  follower_id uuid not null,
  followee_id uuid not null,
  created_at timestamptz default now(),
  primary key (follower_id, followee_id)
);

create table if not exists public.blog_comments (
  id uuid default gen_random_uuid() primary key,
  post_id text,
  author_name text,
  author_id uuid,
  text text,
  created_at timestamptz default now()
);

create table if not exists public.blog_post_likes (
  post_id text not null,
  user_id uuid not null,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

create table if not exists public.gallery_items (
  id uuid default gen_random_uuid() primary key,
  title text,
  media_url text,
  kind text,
  created_at timestamptz default now()
);

create table if not exists public.video_comments (
  id uuid default gen_random_uuid() primary key,
  video_id text,
  author_name text,
  author_id uuid,
  text text,
  created_at timestamptz default now()
);
