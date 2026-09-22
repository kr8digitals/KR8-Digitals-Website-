-- ========================================================
-- KR8 DIGITALS UNIFIED PLATFORM SUPABASE DATABASE SCHEMA
-- Run this script in the Supabase SQL Editor (1-Click Run)
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ACCOUNTS & STUDENTS TABLE
create table if not exists public.accounts (
  id text primary key, -- KR8 ID or tribe_xxx
  type text not null default 'student', -- 'student' | 'tribe' | 'founder' | 'co-founder'
  executive_role text, -- 'Founder' | 'Co-Founder'
  name text not null,
  email text unique not null,
  phone text not null,
  country text default 'NG',
  skill text,
  dob text,
  password text not null,
  vip boolean default false,
  points integer default 0,
  attendance_accepted integer default 0,
  submissions integer default 0,
  referrals integer default 0,
  graduated boolean default false,
  cert_tier text,
  cert_recognition text,
  avatar text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ATTENDANCE SUBMISSIONS TABLE
create table if not exists public.attendances (
  id uuid default uuid_generate_v4() primary key,
  student_id text references public.accounts(id) on delete cascade not null,
  type text not null, -- 'class' | 'assignment' | 'mindset' | 'hangout'
  topic text not null,
  speaker text,
  proof_file_url text,
  status text default 'pending', -- 'pending' | 'accepted' | 'rejected'
  reviewed_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. LIVE STREAMS TABLE
create table if not exists public.live_streams (
  id text primary key,
  title text not null,
  category text not null,
  description text,
  host_id text references public.accounts(id) on delete set null,
  host_name text not null,
  host_avatar text,
  visibility text default 'public', -- 'public' | 'private'
  access_key text,
  is_live boolean default true,
  started_at bigint not null,
  ended_at bigint,
  viewer_count integer default 1,
  peak_viewers integer default 1,
  quality text default '1080p60',
  video_url text,
  poster_url text,
  pinned_notice text,
  viewers jsonb default '[]'::jsonb,
  assigned_tasks jsonb default '[]'::jsonb,
  recognized_participants jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. LIVE CHAT MESSAGES TABLE
create table if not exists public.live_chat (
  id text primary key,
  stream_id text references public.live_streams(id) on delete cascade not null,
  sender_id text not null,
  sender_name text not null,
  sender_role text default 'viewer',
  sender_badge text,
  text text not null,
  is_pinned boolean default false,
  is_deleted boolean default false,
  created_at bigint not null
);

-- 5. STREAM REPLAYS ARCHIVE TABLE
create table if not exists public.stream_replays (
  id text primary key,
  stream_id text not null,
  title text not null,
  category text not null,
  description text,
  host_name text not null,
  host_avatar text,
  visibility text default 'public',
  access_key text,
  date text not null,
  duration_minutes integer default 0,
  peak_viewers integer default 1,
  real_viewers_count integer default 1,
  thumbnail text not null,
  video_url text not null,
  messages_count integer default 0,
  tasks_completed integer default 0,
  recognized_engagers jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. LIVE COMMUNITY FEED TABLE
create table if not exists public.feed_items (
  id text primary key,
  kind text not null,
  name text not null,
  skill text not null,
  avatar text,
  ts bigint not null
);

-- Enable Realtime on live tables
alter publication supabase_realtime add table public.live_streams;
alter publication supabase_realtime add table public.live_chat;
alter publication supabase_realtime add table public.feed_items;
alter publication supabase_realtime add table public.attendances;

-- Allow public access for reading & creating (Row Level Security permissive policies)
alter table public.accounts enable row level security;
alter table public.attendances enable row level security;
alter table public.live_streams enable row level security;
alter table public.live_chat enable row level security;
alter table public.stream_replays enable row level security;
alter table public.feed_items enable row level security;

create policy "Allow public read accounts" on public.accounts for select using (true);
create policy "Allow public insert accounts" on public.accounts for insert with check (true);
create policy "Allow public update accounts" on public.accounts for update using (true);

create policy "Allow public read live_streams" on public.live_streams for select using (true);
create policy "Allow public insert live_streams" on public.live_streams for insert with check (true);
create policy "Allow public update live_streams" on public.live_streams for update using (true);

create policy "Allow public read live_chat" on public.live_chat for select using (true);
create policy "Allow public insert live_chat" on public.live_chat for insert with check (true);
create policy "Allow public update live_chat" on public.live_chat for update using (true);

create policy "Allow public read stream_replays" on public.stream_replays for select using (true);
create policy "Allow public insert stream_replays" on public.stream_replays for insert with check (true);

create policy "Allow public read feed_items" on public.feed_items for select using (true);
create policy "Allow public insert feed_items" on public.feed_items for insert with check (true);

-- ========================================================
-- 7. LIVEKIT REALTIME STREAMS & ADVANCED WEBRTC TABLES
-- ========================================================

-- Streams Master Table
create table if not exists public.streams (
  id text primary key,
  host_id text references public.accounts(id) on delete set null,
  title text not null,
  visibility text not null default 'public', -- 'public' | 'private'
  status text not null default 'live', -- 'scheduled' | 'live' | 'ended'
  livekit_room_name text not null,
  started_at bigint not null,
  ended_at bigint,
  recording_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Stream Roles
create table if not exists public.stream_roles (
  id text primary key,
  stream_id text references public.streams(id) on delete cascade not null,
  user_id_or_guest_name text not null,
  role text not null default 'attendee', -- 'host' | 'co-host' | 'panelist' | 'moderator' | 'attendee'
  assigned_at bigint not null
);

-- Stream Invites (Host-initiated direct invites)
create table if not exists public.stream_invites (
  id text primary key,
  stream_id text references public.streams(id) on delete cascade not null,
  invited_by text references public.accounts(id) on delete cascade not null,
  invitee_user_id_or_null text,
  invite_key text not null,
  role_granted text not null default 'attendee', -- 'attendee' | 'co-host' | 'panelist' | 'moderator'
  created_at bigint not null,
  used_at bigint
);

-- Stream Access Requests (Viewer-initiated requests for private streams)
create table if not exists public.stream_access_requests (
  id text primary key,
  stream_id text references public.streams(id) on delete cascade not null,
  requester_id text not null,
  requester_name text not null,
  status text not null default 'pending', -- 'pending' | 'accepted' | 'rejected' | 'conditional'
  host_response_message text,
  created_at bigint not null
);

-- Stream Chat Messages (with private DM support)
create table if not exists public.stream_chat_messages (
  id text primary key,
  stream_id text references public.streams(id) on delete cascade not null,
  sender_id_or_guest_name text not null,
  sender_name text not null,
  message text not null,
  visibility text not null default 'public', -- 'public' or 'private_<recipientId>'
  created_at bigint not null
);

-- Stream Q&A Queue
create table if not exists public.stream_qa (
  id text primary key,
  stream_id text references public.streams(id) on delete cascade not null,
  submitter_id_or_null text,
  submitter_name text not null,
  question text not null,
  is_anonymous boolean default false,
  upvotes integer default 0,
  answered boolean default false,
  answer_text text,
  answer_visibility text default 'public', -- 'public' | 'private'
  created_at bigint not null
);

-- Stream Polls & Quizzes
create table if not exists public.stream_polls (
  id text primary key,
  stream_id text references public.streams(id) on delete cascade not null,
  created_by text not null,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  is_anonymous boolean default false,
  is_quiz boolean default false,
  correct_option integer,
  launched_at bigint not null,
  closed_at bigint
);

-- Stream Poll Responses
create table if not exists public.stream_poll_responses (
  id text primary key,
  poll_id text references public.stream_polls(id) on delete cascade not null,
  respondent_id_or_null text,
  selected_option integer not null,
  created_at bigint not null
);

-- Enable RLS and Realtime
alter publication supabase_realtime add table public.streams;
alter publication supabase_realtime add table public.stream_roles;
alter publication supabase_realtime add table public.stream_invites;
alter publication supabase_realtime add table public.stream_access_requests;
alter publication supabase_realtime add table public.stream_chat_messages;
alter publication supabase_realtime add table public.stream_qa;
alter publication supabase_realtime add table public.stream_polls;
alter publication supabase_realtime add table public.stream_poll_responses;

alter table public.streams enable row level security;
alter table public.stream_roles enable row level security;
alter table public.stream_invites enable row level security;
alter table public.stream_access_requests enable row level security;
alter table public.stream_chat_messages enable row level security;
alter table public.stream_qa enable row level security;
alter table public.stream_polls enable row level security;
alter table public.stream_poll_responses enable row level security;

create policy "Allow public read streams" on public.streams for select using (true);
create policy "Allow public insert streams" on public.streams for insert with check (true);
create policy "Allow public update streams" on public.streams for update using (true);

create policy "Allow public read stream_roles" on public.stream_roles for select using (true);
create policy "Allow public insert stream_roles" on public.stream_roles for insert with check (true);
create policy "Allow public update stream_roles" on public.stream_roles for update using (true);

create policy "Allow public read stream_invites" on public.stream_invites for select using (true);
create policy "Allow public insert stream_invites" on public.stream_invites for insert with check (true);
create policy "Allow public update stream_invites" on public.stream_invites for update using (true);

create policy "Allow public read stream_access_requests" on public.stream_access_requests for select using (true);
create policy "Allow public insert stream_access_requests" on public.stream_access_requests for insert with check (true);
create policy "Allow public update stream_access_requests" on public.stream_access_requests for update using (true);

create policy "Allow public read stream_chat_messages" on public.stream_chat_messages for select using (true);
create policy "Allow public insert stream_chat_messages" on public.stream_chat_messages for insert with check (true);

create policy "Allow public read stream_qa" on public.stream_qa for select using (true);
create policy "Allow public insert stream_qa" on public.stream_qa for insert with check (true);
create policy "Allow public update stream_qa" on public.stream_qa for update using (true);

create policy "Allow public read stream_polls" on public.stream_polls for select using (true);
create policy "Allow public insert stream_polls" on public.stream_polls for insert with check (true);
create policy "Allow public update stream_polls" on public.stream_polls for update using (true);

create policy "Allow public read stream_poll_responses" on public.stream_poll_responses for select using (true);
create policy "Allow public insert stream_poll_responses" on public.stream_poll_responses for insert with check (true);
