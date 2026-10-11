-- ============================================================
-- KR8 Digitals — Migration 0005: Row Level Security policies
-- ============================================================
-- DESIGN
--   * profiles            → owner-only SELECT/UPDATE (a student sees only
--                           their own row). All admin access goes through
--                           server functions with the service role.
--   * certificates        → public SELECT (name + skill + tier are the
--                           public verification record); writes service-only.
--   * attendance / notifications / enrollments → owner-only.
--   * content tables (announcements, testimonials, site_content,
--     site_settings, skill_settings, team_members, activity_log,
--     recordings, live_rooms) → public SELECT; writes service-only.
--   * room_messages       → public SELECT + authenticated INSERT (own rows).
--   * email_logs, password_reset_codes, user_roles → service-only.
--   Every write not listed as client-writable is service-role only, which is
--   the role used by the Vercel server functions that check `user_roles`.
--   Safe to run multiple times.
-- ============================================================

-- helper: enable RLS + drop all existing policies on a table
do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'user_roles', 'certificates', 'attendance_submissions',
    'enrollments', 'notifications', 'announcements', 'testimonials',
    'site_content', 'site_settings', 'skill_settings', 'team_members',
    'activity_log', 'email_logs', 'live_rooms', 'room_admissions',
    'room_messages', 'recordings', 'password_reset_codes', 'blog_comments',
    'blog_post_likes', 'gallery_items', 'client_requests', 'video_comments',
    'messages', 'user_follows', 'mindset_events', 'mindset_registrations'
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

-- ---------------------------------------------------------- profiles
-- Owner-only. No anonymous read at all (leaderboard/verify use RPC/server).
create policy profiles_owner_select on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy profiles_owner_update on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- ---------------------------------------------------------- user_roles
-- Users may read their own roles; writes happen via the server only.
create policy user_roles_self_select on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------- certificates
-- Public verification record (no PII columns).
create policy certificates_public_select on public.certificates
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------- attendance_submissions
create policy attendance_owner_select on public.attendance_submissions
  for select to authenticated using (auth.uid() = student_id);
create policy attendance_owner_insert on public.attendance_submissions
  for insert to authenticated with check (auth.uid() = student_id);

-- ---------------------------------------------------------- enrollments
create policy enrollments_owner_select on public.enrollments
  for select to authenticated using (auth.uid() = student_id);

-- ---------------------------------------------------------- notifications
create policy notifications_owner_select on public.notifications
  for select to authenticated using (auth.uid() = student_id);
create policy notifications_owner_update on public.notifications
  for update to authenticated using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- ---------------------------------------------------------- public content
create policy announcements_public_select on public.announcements
  for select to anon, authenticated using (true);
create policy testimonials_public_select on public.testimonials
  for select to anon, authenticated using (true);
create policy site_content_public_select on public.site_content
  for select to anon, authenticated using (true);
create policy site_settings_public_select on public.site_settings
  for select to anon, authenticated using (true);
create policy skill_settings_public_select on public.skill_settings
  for select to anon, authenticated using (true);
create policy team_members_public_select on public.team_members
  for select to anon, authenticated using (true);
create policy activity_log_public_select on public.activity_log
  for select to anon, authenticated using (true);
create policy recordings_public_select on public.recordings
  for select to anon, authenticated using (true);
create policy live_rooms_public_select on public.live_rooms
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------- live rooms
create policy room_messages_public_select on public.room_messages
  for select to anon, authenticated using (true);
create policy room_messages_auth_insert on public.room_messages
  for insert to authenticated with check (auth.uid() = sender_id);
create policy room_admissions_self_insert on public.room_admissions
  for insert to authenticated with check (auth.uid() = user_id);

-- ---------------------------------------------------------- service-only tables
-- email_logs, password_reset_codes: RLS enabled, NO policies → only the
-- service role (server code) can touch them.

-- Final defense-in-depth: no table privileges for anon/authenticated beyond
-- what the policies above grant (policies govern; grants are revoked).
do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'user_roles', 'certificates', 'attendance_submissions',
    'enrollments', 'notifications', 'announcements', 'testimonials',
    'site_content', 'site_settings', 'skill_settings', 'team_members',
    'activity_log', 'email_logs', 'live_rooms', 'room_admissions',
    'room_messages', 'recordings', 'password_reset_codes'
  ] loop
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      execute format('revoke all on table public.%I from anon, authenticated', t);
      execute format('grant select on table public.%I to anon, authenticated', t);
    end if;
  end loop;
  -- owner-write tables need insert/update grants as well
  foreach t in array array['profiles', 'attendance_submissions', 'notifications', 'room_messages', 'room_admissions'] loop
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      execute format('grant insert, update on table public.%I to authenticated', t);
    end if;
  end loop;
end $$;
