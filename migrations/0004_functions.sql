-- ============================================================
-- KR8 Digitals — Migration 0004: server-side functions (RPCs)
-- ============================================================
--   get_unified_leaderboard(p_limit int)
--     Public read of SAFE leaderboard fields only (never phone / email /
--     dob / password). Ranks profiles by points (multi-skill bonus applied).
--     security definer so RLS on profiles (owner-only) does not block it.
--
--   next_kr8_serial(p_skill text)
--     Allocates the next serial number for KR8 ID generation. Executed by
--     the SERVER ONLY (service role) during registration.
-- ============================================================

create or replace function public.get_unified_leaderboard(p_limit integer default 50)
returns table (
  kr8_id text,
  name text,
  avatar text,
  skill text,
  skills jsonb,
  points integer,
  graduated boolean,
  cert_tier text,
  multi_skill_count integer,
  is_placeholder boolean,
  rank bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.kr8_id,
    p.name,
    p.avatar,
    p.skill,
    coalesce(p.extra->'skills', '[]'::jsonb) as skills,
    coalesce(p.points, 0) as points,
    coalesce(p.graduated, false) as graduated,
    p.cert_tier,
    coalesce((p.extra->>'multi_skill_count')::int, 1) as multi_skill_count,
    coalesce((p.extra->>'is_placeholder')::boolean, false) as is_placeholder,
    rank() over (
      order by
        coalesce(p.points, 0)
        + (coalesce((p.extra->>'multi_skill_count')::int, 1) - 1) * 50 desc,
        p.name asc
    ) as rank
  from public.profiles p
  where coalesce((p.extra->>'restricted')::boolean, false) = false
    and coalesce((p.extra->>'type')::text, 'student') = 'student'
  order by
    coalesce(p.points, 0)
    + (coalesce((p.extra->>'multi_skill_count')::int, 1) - 1) * 50 desc,
    p.name asc
  limit greatest(p_limit, 1);
$$;

create or replace function public.next_kr8_serial(p_skill text)
returns integer
language sql
volatile
security definer
set search_path = public
as $$
  select coalesce(max((p.extra->>'serial')::int), 0) + 1
  from public.profiles p
  where coalesce(p.skill, '') = coalesce(p_skill, '');
$$;

-- Lock execution grants down.
revoke execute on function public.get_unified_leaderboard(integer) from public;
revoke execute on function public.next_kr8_serial(text) from public;
grant execute on function public.get_unified_leaderboard(integer) to anon, authenticated, service_role;
grant execute on function public.next_kr8_serial(text) to service_role;
