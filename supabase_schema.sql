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
