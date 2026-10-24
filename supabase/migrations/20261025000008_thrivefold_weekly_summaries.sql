-- Weekly summaries: opt-in backup of averages and counts per week for signed-in people.
-- No notes, symptoms, cycle dates, journal text or individual entries are accepted.

create table if not exists public.thrivefold_weekly_summaries (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  check_ins smallint not null check (check_ins between 0 and 7),
  avg_energy numeric(3,1) check (avg_energy between 1 and 10),
  avg_mood numeric(3,1) check (avg_mood between 1 and 10),
  avg_stress numeric(3,1) check (avg_stress between 1 and 10),
  avg_sleep_hours numeric(3,1) check (avg_sleep_hours between 0 and 24),
  quests_done smallint not null check (quests_done between 0 and 70),
  workouts smallint not null check (workouts between 0 and 50),
  active_minutes integer not null check (active_minutes between 0 and 10080),
  form_checked_sessions smallint not null check (form_checked_sessions between 0 and 200),
  xp_earned integer not null check (xp_earned between 0 and 100000),
  updated_at timestamptz not null default now(),
  primary key (user_id, week_start),
  check (extract(isodow from week_start) = 1)
);

alter table public.thrivefold_weekly_summaries enable row level security;
revoke all on public.thrivefold_weekly_summaries from anon, authenticated;
grant select, delete on public.thrivefold_weekly_summaries to authenticated;
create policy "own weekly summaries readable" on public.thrivefold_weekly_summaries
  for select to authenticated using (user_id = auth.uid());
create policy "own weekly summaries deletable" on public.thrivefold_weekly_summaries
  for delete to authenticated using (user_id = auth.uid());

create or replace function public.tf_upsert_weekly_summary(
  p_week_start date, p_check_ins integer, p_avg_energy numeric, p_avg_mood numeric, p_avg_stress numeric,
  p_avg_sleep_hours numeric, p_quests_done integer, p_workouts integer, p_active_minutes integer,
  p_form_checked_sessions integer, p_xp_earned integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'not authenticated'; end if;
  if p_week_start > current_date or p_week_start < current_date - 400 then raise exception 'week out of range'; end if;
  insert into public.thrivefold_weekly_summaries as w (
    user_id, week_start, check_ins, avg_energy, avg_mood, avg_stress, avg_sleep_hours,
    quests_done, workouts, active_minutes, form_checked_sessions, xp_earned, updated_at)
  values (v_user, p_week_start, p_check_ins, p_avg_energy, p_avg_mood, p_avg_stress, p_avg_sleep_hours,
    p_quests_done, p_workouts, p_active_minutes, p_form_checked_sessions, p_xp_earned, now())
  on conflict (user_id, week_start) do update set
    check_ins = excluded.check_ins, avg_energy = excluded.avg_energy, avg_mood = excluded.avg_mood,
    avg_stress = excluded.avg_stress, avg_sleep_hours = excluded.avg_sleep_hours,
    quests_done = excluded.quests_done, workouts = excluded.workouts, active_minutes = excluded.active_minutes,
    form_checked_sessions = excluded.form_checked_sessions, xp_earned = excluded.xp_earned, updated_at = now();
  return jsonb_build_object('status', 'saved');
end;
$$;

revoke all on function public.tf_upsert_weekly_summary(date, integer, numeric, numeric, numeric, numeric, integer, integer, integer, integer, integer) from public, anon;
grant execute on function public.tf_upsert_weekly_summary(date, integer, numeric, numeric, numeric, numeric, integer, integer, integer, integer, integer) to authenticated;
