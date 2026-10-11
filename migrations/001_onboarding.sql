-- ============================================================
-- KR8 Digitals — onboarding_status (specified migration)
-- ============================================================
-- Records /welcome completion in the DATABASE (never the browser):
--   whatsapp_done — true once the student has been sent to their
--                   learning group's WhatsApp link
--   completed_at  — when the onboarding flow was finished / skipped
--
-- RLS: a user can select / insert / update ONLY their own row.
-- Safe to run multiple times.
-- ============================================================

create table if not exists public.onboarding_status (
  user_id uuid primary key references auth.users(id) on delete cascade,
  whatsapp_done boolean default false,
  completed_at timestamptz
);

alter table public.onboarding_status enable row level security;

drop policy if exists "own onboarding select" on public.onboarding_status;
create policy "own onboarding select"
  on public.onboarding_status for select
  using (auth.uid() = user_id);

drop policy if exists "own onboarding insert" on public.onboarding_status;
create policy "own onboarding insert"
  on public.onboarding_status for insert
  with check (auth.uid() = user_id);

drop policy if exists "own onboarding update" on public.onboarding_status;
create policy "own onboarding update"
  on public.onboarding_status for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
