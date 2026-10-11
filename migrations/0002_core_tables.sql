-- ============================================================
-- KR8 Digitals — Migration 0002: core tables (additive only)
-- ============================================================
-- PURPOSE
--   Ensure every table the secure application needs exists with the columns
--   the server code uses. `create table if not exists` and
--   `add column if not exists` only — existing rows/tables are never dropped
--   or rewritten. Where a column already exists with compatible semantics, it
--   is left untouched; the server additionally stores any legacy-shaped fields
--   it needs inside `extra jsonb`.
--   Safe to run multiple times.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key,                       -- auth.users.id
  kr8_id text unique not null,
  name text not null,
  email text,
  phone text,
  country text default 'NG',
  dob text,
  skill text,
  avatar text,
  bio text,
  points integer default 0,
  referrals integer default 0,
  graduated boolean default false,
  cert_tier text,
  cert_recognition text,
  joined timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.profiles add column if not exists kr8_id_normalized text;
alter table public.profiles add column if not exists phone_normalized text;
alter table public.profiles add column if not exists extra jsonb default '{}'::jsonb;
alter table public.profiles add column if not exists updated_at timestamptz default now();

create unique index if not exists profiles_kr8_id_normalized_idx
  on public.profiles (kr8_id_normalized);
create index if not exists profiles_phone_normalized_idx
  on public.profiles (phone_normalized);
create index if not exists profiles_email_idx
  on public.profiles (lower(email));

-- Backfill normalised keys for existing rows (only fills blanks).
update public.profiles
   set kr8_id_normalized = upper(regexp_replace(coalesce(kr8_id, ''), '[\s-]', '', 'g'))
 where kr8_id is not null and (kr8_id_normalized is null or kr8_id_normalized = '');

update public.profiles
   set phone_normalized = coalesce(phone, '')
 where phone is not null and (phone_normalized is null or phone_normalized = '');

-- ---------------------------------------------------------- user_roles
create table if not exists public.user_roles (
  user_id uuid primary key,
  role text not null,
  permissions jsonb default '[]'::jsonb,
  title text,
  granted_by uuid,
  created_at timestamptz default now()
);
alter table public.user_roles add column if not exists permissions jsonb default '[]'::jsonb;
alter table public.user_roles add column if not exists title text;
alter table public.user_roles add column if not exists granted_by uuid;
alter table public.user_roles add column if not exists created_at timestamptz default now();

-- ---------------------------------------------------------- certificates
create table if not exists public.certificates (
  id uuid default uuid_generate_v4() primary key,
  certificate_code text unique not null,
  student_id uuid,
  kr8_id text,
  student_name text,
  skill text,
  tier text default 'Completion',
  status text default 'active',              -- 'active' | 'withdrawn'
  issued_at timestamptz default now(),
  issued_by text,
  email_sent_at timestamptz,
  withdrawn_at timestamptz,
  extra jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
alter table public.certificates add column if not exists extra jsonb default '{}'::jsonb;
alter table public.certificates add column if not exists student_id uuid;
alter table public.certificates add column if not exists kr8_id text;
alter table public.certificates add column if not exists student_name text;
alter table public.certificates add column if not exists email_sent_at timestamptz;
alter table public.certificates add column if not exists withdrawn_at timestamptz;
alter table public.certificates alter column id set default uuid_generate_v4();

create index if not exists certificates_student_idx on public.certificates (student_id);
create index if not exists certificates_kr8_idx on public.certificates (kr8_id);

-- ---------------------------------------------------------- attendance_submissions
create table if not exists public.attendance_submissions (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid not null,
  kr8_id text,
  student_name text,
  skill text,
  type text not null,                        -- 'class' | 'assignment' | 'mindset' | 'hangout'
  topic text not null,
  speaker text,
  proof_file_url text,
  is_duplicate boolean default false,
  status text default 'pending',             -- 'pending' | 'accepted' | 'rejected'
  feedback text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);
alter table public.attendance_submissions alter column id set default uuid_generate_v4();
alter table public.attendance_submissions add column if not exists kr8_id text;
alter table public.attendance_submissions add column if not exists student_name text;
alter table public.attendance_submissions add column if not exists skill text;
alter table public.attendance_submissions add column if not exists speaker text;
alter table public.attendance_submissions add column if not exists is_duplicate boolean default false;
alter table public.attendance_submissions add column if not exists feedback text;
alter table public.attendance_submissions add column if not exists reviewed_by text;
alter table public.attendance_submissions add column if not exists reviewed_at timestamptz;

create index if not exists attendance_student_idx on public.attendance_submissions (student_id);

-- ---------------------------------------------------------- enrollments
create table if not exists public.enrollments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid not null,
  kr8_id text,
  skill text not null,
  status text default 'active',              -- 'active' | 'graduated' | 'revoked'
  created_at timestamptz default now()
);
alter table public.enrollments alter column id set default uuid_generate_v4();

-- ---------------------------------------------------------- notifications
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid not null,
  type text default 'info',                  -- 'graduation' | 'withdrawal' | 'achievement' | 'info'
  title text not null,
  message text not null,
  reason text,
  certificate_id text,
  skill text,
  skill_name text,
  tier text,
  read boolean default false,
  created_at timestamptz default now()
);
alter table public.notifications alter column id set default uuid_generate_v4();
alter table public.notifications add column if not exists reason text;
alter table public.notifications add column if not exists certificate_id text;
alter table public.notifications add column if not exists skill_name text;
alter table public.notifications add column if not exists tier text;

create index if not exists notifications_student_idx on public.notifications (student_id);

-- ---------------------------------------------------------- announcements
create table if not exists public.announcements (
  id uuid default uuid_generate_v4() primary key,
  type text default 'text',                  -- 'text' | 'flyer' | 'image' | 'video'
  title text not null,
  body text,
  image text,
  video_url text,
  video_poster text,
  caption text,
  date text,
  author text default 'KR8 Admin',
  speaker text,
  active boolean default true,
  created_at timestamptz default now()
);
alter table public.announcements alter column id set default uuid_generate_v4();

-- ---------------------------------------------------------- testimonials
create table if not exists public.testimonials (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  kr8_id text,
  skill text,
  school_or_role text,
  caption text,
  img text,
  video text,
  duration numeric,
  extra jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
alter table public.testimonials alter column id set default uuid_generate_v4();
alter table public.testimonials add column if not exists extra jsonb default '{}'::jsonb;

-- ---------------------------------------------------------- site_content / site_settings
create table if not exists public.site_content (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  updated_by uuid
);
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------- skill_settings
create table if not exists public.skill_settings (
  skill text primary key,
  name text,
  suffix text,
  whatsapp text default '',
  available boolean default true,
  reg_open boolean default true,
  updated_at timestamptz default now()
);
alter table public.skill_settings add column if not exists name text;
alter table public.skill_settings add column if not exists suffix text;
alter table public.skill_settings add column if not exists available boolean default true;
alter table public.skill_settings add column if not exists updated_at timestamptz default now();

-- Seed the seven skill tracks ONLY when the table is empty (no overwrites).
insert into public.skill_settings (skill, name, suffix, whatsapp, available, reg_open)
select * from (values
  ('graphic', 'Graphic Design', 'GDVFD', '', true, true),
  ('video', 'Video Editing & Animation', 'VEVFD', '', true, true),
  ('web', 'Website Development', 'WDVFD', '', true, true),
  ('frontend', 'Front-End Development', 'FEDVFD', '', true, true),
  ('content_creation', 'Content Creation', 'CCVFD', '', true, true),
  ('smm', 'Social Media Management', 'SMMVFD', '', true, true),
  ('marketing', 'Digital Marketing', 'DMVFD', '', true, true)
) as v(skill, name, suffix, whatsapp, available, reg_open)
where not exists (select 1 from public.skill_settings limit 1);

-- ---------------------------------------------------------- team_members
create table if not exists public.team_members (
  id uuid default uuid_generate_v4() primary key,
  slug text unique,
  name text not null,
  role text,
  bio text,
  photo text,
  founder boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);
alter table public.team_members alter column id set default uuid_generate_v4();
alter table public.team_members add column if not exists founder boolean default false;
alter table public.team_members add column if not exists sort_order integer default 0;

-- ---------------------------------------------------------- activity_log
create table if not exists public.activity_log (
  id uuid default uuid_generate_v4() primary key,
  kind text not null,
  name text not null,
  skill text,
  avatar text,
  custom_action text,
  created_at timestamptz default now()
);
alter table public.activity_log alter column id set default uuid_generate_v4();
create index if not exists activity_log_created_idx on public.activity_log (created_at desc);

-- ---------------------------------------------------------- email_logs
create table if not exists public.email_logs (
  id uuid default uuid_generate_v4() primary key,
  to_email text,
  subject text,
  kind text,
  status text,
  error text,
  external_id text,
  created_at timestamptz default now()
);
alter table public.email_logs alter column id set default uuid_generate_v4();
