-- ============================================================
-- KR8 Digitals — Migration 0001: lockdown of legacy public policies
-- ============================================================
-- PURPOSE
--   The old supabase_schema.sql created PUBLIC select/insert/update policies
--   on accounts (which contains passwords, phones, emails, DOBs) and on the
--   legacy live tables. This migration REMOVES those permissive policies and
--   enables Row Level Security everywhere. With RLS enabled and no policy,
--   anon/authenticated users can read nothing; the service-role key (server
--   only) bypasses RLS.
--
--   This migration NEVER touches rows/data. It only changes policies.
--   Safe to run multiple times.
-- ============================================================

-- Legacy tables that must no longer be publicly readable/writable.
-- (accounts, attendances, live_streams, live_chat, stream_replays, feed_items,
--  streams, stream_roles, stream_invites, stream_access_requests,
--  stream_chat_messages, stream_qa, stream_polls, stream_poll_responses)

do $$
declare t text;
begin
  foreach t in array array[
    'accounts', 'attendances', 'live_streams', 'live_chat', 'stream_replays',
    'feed_items', 'streams', 'stream_roles', 'stream_invites',
    'stream_access_requests', 'stream_chat_messages', 'stream_qa',
    'stream_polls', 'stream_poll_responses'
  ] loop
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      execute format('alter table public.%I enable row level security', t);
      -- Drop every existing policy on the table (they were public-permissive).
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

-- The service role bypasses RLS; explicitly deny anon/authenticated on the
-- legacy tables by leaving NO policies in place (default deny).
-- Revokes for direct table grants (defense in depth):
do $$
declare t text;
begin
  foreach t in array array[
    'accounts', 'attendances', 'live_streams', 'live_chat', 'stream_replays',
    'feed_items', 'streams', 'stream_roles', 'stream_invites',
    'stream_access_requests', 'stream_chat_messages', 'stream_qa',
    'stream_polls', 'stream_poll_responses'
  ] loop
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      execute format('revoke all on table public.%I from anon, authenticated', t);
    end if;
  end loop;
end $$;
