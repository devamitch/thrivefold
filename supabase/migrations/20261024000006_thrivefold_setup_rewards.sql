-- Setup rewards: finishing each onboarding step earns a fixed amount of XP, once per person.
-- The amount is set here, never by the client, and never depends on what was answered (the
-- catalog forbids rewarding health or sensitive disclosure). Mirrors SETUP_REWARDS in
-- src/domain/game/setupProfile.ts.

alter table public.thrivefold_reward_ledger drop constraint if exists thrivefold_reward_ledger_kind_check;
alter table public.thrivefold_reward_ledger add constraint thrivefold_reward_ledger_kind_check
  check (kind in ('task_reward','setup_reward','daily_goal','level_clear','unlock_spend','legacy_import'));

create or replace function public.tf_claim_setup_reward(p_section text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_xp integer;
  v_key text := 'setup:' || p_section;
begin
  if v_user is null then raise exception 'not authenticated'; end if;
  if public.tf_is_restricted(v_user, null) then raise exception 'account restricted'; end if;
  v_xp := case p_section
    when 'experience' then 20
    when 'privacy' then 20
    when 'goals' then 25
    when 'body_baseline' then 25
    when 'mind_baseline' then 25
    when 'constraints' then 30
    when 'lifestyle' then 20
  end;
  if v_xp is null then raise exception 'unknown setup step'; end if;
  perform pg_advisory_xact_lock(hashtext(v_user::text));
  if exists (select 1 from public.thrivefold_reward_ledger where user_id = v_user and key = v_key) then
    return jsonb_build_object('status', 'duplicate');
  end if;
  insert into public.thrivefold_reward_ledger (user_id, key, kind, xp, game_date, source_id, policy_version)
  values (v_user, v_key, 'setup_reward', v_xp, current_date, p_section, 'thrivefold-economy-v1');
  perform public.tf_settle_levels(v_user, current_date);
  return jsonb_build_object('status', 'recorded', 'xp', v_xp);
end;
$$;

revoke all on function public.tf_claim_setup_reward(text) from public, anon;
grant execute on function public.tf_claim_setup_reward(text) to authenticated;
