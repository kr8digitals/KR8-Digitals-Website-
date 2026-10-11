-- ============================================================
-- KR8 Digitals — Migration 0006: social, mindset & reset-code tables
-- ============================================================
-- Additive only (`create table if not exists`). Includes RLS for the new
-- tables. Safe to run multiple times.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------- password_reset_codes
-- SERVER-ONLY (RLS enabled with no policies). Stores SHA-256 hashes — the raw
-- code is only ever delivered to the account's email address.
create table if not exists public.password_reset_codes (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid not null,
  identifier_hash text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);
alter table public.password_reset_codes alter column id set default uuid_generate_v4();

-- ---------------------------------------------------------- blog
create table if not exists public.blog_comments (
  id uuid default uuid_generate_v4() primary key,
  post_id text not null,
  author_id uuid,
  author_name text not null,
  comment text not null,
  created_at timestamptz default now()
);
alter table public.blog_comments alter column id set default uuid_generate_v4();

create table if not exists public.blog_post_likes (
  post_id text not null,
  user_id uuid not null,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

-- ---------------------------------------------------------- gallery
create table if not exists public.gallery_items (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  category text default 'Student Showcases',
  media_type text default 'image',
  url text not null,
  thumbnail text,
  date text,
  author text,
  author_role text,
  status text default 'pending',             -- 'pending' | 'approved'
  featured boolean default false,
  link text,
  submitted_at timestamptz default now()
);
alter table public.gallery_items alter column id set default uuid_generate_v4();
alter table public.gallery_items add column if not exists submitted_at timestamptz default now();

-- ---------------------------------------------------------- client requests (agency + appeals)
create table if not exists public.client_requests (
  id uuid default uuid_generate_v4() primary key,
  name text,
  email text,
  phone text,
  company text,
  service text,
  budget text,
  message text,
  status text default 'new',
  created_at timestamptz default now()
);
alter table public.client_requests alter column id set default uuid_generate_v4();

-- ---------------------------------------------------------- video comments
create table if not exists public.video_comments (
  id uuid default uuid_generate_v4() primary key,
  video_id text not null,
  author_name text not null,
  author_id uuid,
  comment text not null,
  likes integer default 0,
  created_at timestamptz default now()
);
alter table public.video_comments alter column id set default uuid_generate_v4();

-- ---------------------------------------------------------- direct messages & follows
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid not null,
  sender_name text,
  recipient_id uuid not null,
  recipient_name text,
  text text not null,
  read boolean default false,
  created_at timestamptz default now()
);
alter table public.messages alter column id set default uuid_generate_v4();

create table if not exists public.user_follows (
  follower_id uuid not null,
  followed_id uuid not null,
  created_at timestamptz default now(),
  primary key (follower_id, followed_id)
);

-- ---------------------------------------------------------- mindset shift
create table if not exists public.mindset_events (
  id uuid default uuid_generate_v4() primary key,
  event_code text unique not null,
  config jsonb default '{}'::jsonb,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);
alter table public.mindset_events alter column id set default uuid_generate_v4();

create table if not exists public.mindset_registrations (
  id uuid default uuid_generate_v4() primary key,
  edition text default 'mindset_shift',
  full_name text not null,
  email text not null,
  phone text not null,
  whatsapp text,
  location text,
  status text default 'pending',
  access_code text,
  resume_code text,
  answers jsonb default '{}'::jsonb,
  proof jsonb,
  created_at timestamptz default now()
);
alter table public.mindset_registrations alter column id set default uuid_generate_v4();

-- ============================================================
-- RLS for the new tables
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array[
    'password_reset_codes', 'blog_comments', 'blog_post_likes', 'gallery_items',
    'client_requests', 'video_comments', 'messages', 'user_follows',
    'mindset_events', 'mindset_registrations'
  ] loop
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      execute format('alter table public.%I enable row level security', t);
      execute format(
        $f$
        do $d$
        declare p record;
        begin
          for p in
            select policyname from pg_policies
            where schemaname = 'public' and tablename = %L
          loop
            execute format('drop policy if exists %%I on public.%I', p.policyname);
          end loop;
        end $d$;
        $f$, t, t
      );
    end if;
  end loop;
end $$;

-- password_reset_codes: service-only (no policies at all).

-- blog comments: public read, signed-in write (own author).
create policy blog_comments_public_select on public.blog_comments
  for select to anon, authenticated using (true);
create policy blog_comments_auth_insert on public.blog_comments
  for insert to authenticated with check (auth.uid() = author_id);
create policy blog_comments_author_delete on public.blog_comments
  for delete to authenticated using (auth.uid() = author_id);

-- blog likes: public read, own rows only.
create policy blog_likes_public_select on public.blog_post_likes
  for select to anon, authenticated using (true);
create policy blog_likes_self_insert on public.blog_post_likes
  for insert to authenticated with check (auth.uid() = user_id);
create policy blog_likes_self_delete on public.blog_post_likes
  for delete to authenticated using (auth.uid() = user_id);

-- gallery: approved items public; pending visible to submitter (server handles
-- moderation with the service role).
create policy gallery_public_select on public.gallery_items
  for select to anon, authenticated using (status = 'approved');
create policy gallery_own_pending_select on public.gallery_items
  for select to authenticated using (author = (auth.jwt() ->> 'email'));
create policy gallery_auth_insert on public.gallery_items
  for insert to authenticated with check (status = 'pending');

-- client requests: anyone may submit; only the server (service role) reads.
create policy clients_public_insert on public.client_requests
  for insert to anon, authenticated with check (true);

-- video comments: public read, signed-in insert.
create policy video_comments_public_select on public.video_comments
  for select to anon, authenticated using (true);
create policy video_comments_auth_insert on public.video_comments
  for insert to authenticated with check (auth.uid() = author_id);

-- messages: participants only.
create policy messages_participants_select on public.messages
  for select to authenticated using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy messages_sender_insert on public.messages
  for insert to authenticated with check (auth.uid() = sender_id);
create policy messages_recipient_update on public.messages
  for update to authenticated using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

-- follows: own rows.
create policy follows_public_select on public.user_follows
  for select to anon, authenticated using (true);
create policy follows_self_insert on public.user_follows
  for insert to authenticated with check (auth.uid() = follower_id);
create policy follows_self_delete on public.user_follows
  for delete to authenticated using (auth.uid() = follower_id);

-- mindset: events public read; registrations handled by the server (public
-- registration goes through /api/mindset with the service role).
create policy mindset_events_public_select on public.mindset_events
  for select to anon, authenticated using (true);

-- mindset_registrations: service-only (contains email/phone of participants,
-- some of whom are minors).
