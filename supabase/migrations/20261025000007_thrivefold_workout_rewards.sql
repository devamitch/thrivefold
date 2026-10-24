-- Workout rewards: a finished plan workout earns 5 XP; one checked by the on-device pose
-- camera with good form (at least 12 clearly tracked frames and 80% of them fault-free) earns
-- ten times that. At most two workout rewards per person per day. The client reports the
-- form numbers; the server fixes the amounts and the limits. Mirrors workoutRewardXp in
-- src/domain/game/progression.ts.

alter table public.thrivefold_reward_ledger drop constraint if exists thrivefold_reward_ledger_kind_check;
alter table public.thrivefold_reward_ledger add constraint thrivefold_reward_ledger_kind_check
  check (kind in ('task_reward','setup_reward','workout_reward','daily_goal','level_clear','unlock_spend','legacy_import'));

create or replace function public.tf_claim_workout_reward(
  p_session_key text, p_game_date date, p_valid_frames integer, p_form_score numeric)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_key text := 'workout:' || p_session_key;
  v_xp integer;
  v_count integer;
begin
  if v_user is null then raise exception 'not authenticated'; end if;
  if public.tf_is_restricted(v_user, null) then raise exception 'account restricted'; end if;
  if p_game_date < current_date - 1 or p_game_date > current_date + 1 then raise exception 'stale game date'; end if;
  if length(coalesce(p_session_key, '')) not between 1 and 80 then raise exception 'invalid session'; end if;
  perform pg_advisory_xact_lock(hashtext(v_user::text));
  if exists (select 1 from public.thrivefold_reward_ledger where user_id = v_user and key = v_key) then
    return jsonb_build_object('status', 'duplicate');
  end if;
  select count(*) into v_count from public.thrivefold_reward_ledger
    where user_id = v_user and kind = 'workout_reward' and game_date = p_game_date;
  if v_count >= 2 then raise exception 'workout limit reached'; end if;
  v_xp := case when coalesce(p_valid_frames, 0) >= 12 and coalesce(p_form_score, 0) between 0.8 and 1 then 50 else 5 end;
  insert into public.thrivefold_reward_ledger (user_id, key, kind, xp, game_date, source_id, policy_version)
  values (v_user, v_key, 'workout_reward', v_xp, p_game_date, p_session_key, 'thrivefold-economy-v1');
  perform public.tf_settle_levels(v_user, p_game_date);
  return jsonb_build_object('status', 'recorded', 'xp', v_xp);
end;
$$;

revoke all on function public.tf_claim_workout_reward(text, date, integer, numeric) from public, anon;
grant execute on function public.tf_claim_workout_reward(text, date, integer, numeric) to authenticated;
