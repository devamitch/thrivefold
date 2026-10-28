-- Weekly summaries gain two counts from guided practice (breathing, eye, hand studios):
-- sessions and minutes. Counts only: no blink rates, distances, reps or scores leave the phone.

alter table public.thrivefold_weekly_summaries
  add column if not exists practice_sessions smallint not null default 0 check (practice_sessions between 0 and 500),
  add column if not exists practice_minutes integer not null default 0 check (practice_minutes between 0 and 10080);

create or replace function public.tf_upsert_weekly_summary_v2(
  p_week_start date, p_check_ins integer, p_avg_energy numeric, p_avg_mood numeric, p_avg_stress numeric,
  p_avg_sleep_hours numeric, p_quests_done integer, p_workouts integer, p_active_minutes integer,
  p_form_checked_sessions integer, p_xp_earned integer, p_practice_sessions integer, p_practice_minutes integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'not authenticated'; end if;
  if p_week_start > current_date or p_week_start < current_date - 400 then raise exception 'week out of range'; end if;
  insert into public.thrivefold_weekly_summaries as w (
    user_id, week_start, check_ins, avg_energy, avg_mood, avg_stress, avg_sleep_hours,
    quests_done, workouts, active_minutes, form_checked_sessions, xp_earned,
    practice_sessions, practice_minutes, updated_at)
  values (v_user, p_week_start, p_check_ins, p_avg_energy, p_avg_mood, p_avg_stress, p_avg_sleep_hours,
    p_quests_done, p_workouts, p_active_minutes, p_form_checked_sessions, p_xp_earned,
    p_practice_sessions, p_practice_minutes, now())
  on conflict (user_id, week_start) do update set
    check_ins = excluded.check_ins, avg_energy = excluded.avg_energy, avg_mood = excluded.avg_mood,
    avg_stress = excluded.avg_stress, avg_sleep_hours = excluded.avg_sleep_hours,
    quests_done = excluded.quests_done, workouts = excluded.workouts, active_minutes = excluded.active_minutes,
    form_checked_sessions = excluded.form_checked_sessions, xp_earned = excluded.xp_earned,
    practice_sessions = excluded.practice_sessions, practice_minutes = excluded.practice_minutes, updated_at = now();
  return jsonb_build_object('status', 'saved');
end;
$$;

revoke all on function public.tf_upsert_weekly_summary_v2(date, integer, numeric, numeric, numeric, numeric, integer, integer, integer, integer, integer, integer, integer) from public, anon;
grant execute on function public.tf_upsert_weekly_summary_v2(date, integer, numeric, numeric, numeric, numeric, integer, integer, integer, integer, integer, integer, integer) to authenticated;
