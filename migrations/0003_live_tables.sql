-- ============================================================
-- KR8 Digitals — Migration 0003: live rooms & recordings (additive)
-- ============================================================
-- Maps the legacy live-stream UI onto the LiveKit-era tables:
--   live_rooms, room_admissions, room_messages, recordings
-- Additive only; safe to run multiple times.
-- ============================================================

create table if not exists public.live_rooms (
  id text primary key,
  title text not null,
  category text default 'Live Class',
  description text,
  host_id uuid,
  host_name text,
  host_avatar text,
  visibility text default 'public',          -- 'public' | 'private'
  access_key text,
  is_live boolean default true,
  started_at bigint not null,
  ended_at bigint,
  viewer_count integer default 1,
  peak_viewers integer default 1,
  quality text default '1080p60',
  livekit_room_name text,
  pinned_notice text,
  chat_permission text default 'everyone',
  is_locked boolean default false,
  is_suspended boolean default false,
  spotlight_participant_id text,
  is_recording boolean default false,
  created_at timestamptz default now()
);

do $$
begin
  alter table public.live_rooms add column if not exists chat_permission text default 'everyone';
  alter table public.live_rooms add column if not exists is_locked boolean default false;
  alter table public.live_rooms add column if not exists is_suspended boolean default false;
  alter table public.live_rooms add column if not exists spotlight_participant_id text;
  alter table public.live_rooms add column if not exists is_recording boolean default false;
  alter table public.live_rooms add column if not exists livekit_room_name text;
exception when others then null;
end $$;

create table if not exists public.room_admissions (
  id uuid default uuid_generate_v4() primary key,
  room_id text not null,
  user_id uuid,
  name text,
  role text default 'attendee',
  admitted_at timestamptz default now()
);
alter table public.room_admissions alter column id set default uuid_generate_v4();

create table if not exists public.room_messages (
  id uuid default uuid_generate_v4() primary key,
  room_id text not null,
  sender_id uuid,
  sender_name text,
  sender_role text default 'viewer',
  sender_badge text,
  recipient_id uuid,
  recipient_name text,
  text text not null,
  is_pinned boolean default false,
  created_at timestamptz default now()
);
alter table public.room_messages alter column id set default uuid_generate_v4();
alter table public.room_messages add column if not exists sender_badge text;
alter table public.room_messages add column if not exists recipient_id uuid;
alter table public.room_messages add column if not exists recipient_name text;

create index if not exists room_messages_room_idx on public.room_messages (room_id, created_at);

create table if not exists public.recordings (
  id uuid default uuid_generate_v4() primary key,
  room_id text,
  title text not null,
  category text,
  description text,
  host_name text,
  host_avatar text,
  visibility text default 'public',
  access_key text,
  date text,
  duration_minutes integer default 0,
  peak_viewers integer default 1,
  thumbnail text,
  video_url text,
  created_at timestamptz default now()
);
alter table public.recordings alter column id set default uuid_generate_v4();
