-- ============================================================================
-- Thrivefold: progression gates for communities and dating
--  * Joining a community needs level 6; creating one needs level 10.
--  * A new community is usable by its organiser (and people they invite) at once, but
--    stays out of discovery until the founder verifies the organiser on a call.
--  * Dating needs level 20, on top of the existing age-verification, consent and
--    blocking rules. Levels come from the server ledger, never from the client.
-- ============================================================================

create table if not exists public.thrivefold_progression_gates (
  feature_id text primary key,
  min_level integer not null check (min_level >= 1)
);
alter table public.thrivefold_progression_gates enable row level security;
revoke all on public.thrivefold_progression_gates from public, anon, authenticated;
grant select on public.thrivefold_progression_gates to authenticated;
drop policy if exists "gates readable" on public.thrivefold_progression_gates;
create policy "gates readable" on public.thrivefold_progression_gates for select to authenticated using (true);

insert into public.thrivefold_progression_gates (feature_id, min_level) values
  ('join_community', 6),
  ('create_community', 10),
  ('dating', 20)
on conflict (feature_id) do update set min_level = excluded.min_level;

alter table public.thrivefold_communities
  add column if not exists verification_status text not null default 'verified',
  add column if not exists topic text;
alter table public.thrivefold_communities drop constraint if exists thrivefold_communities_verification_status_check;
alter table public.thrivefold_communities add constraint thrivefold_communities_verification_status_check
  check (verification_status in ('pending_founder_call', 'verified', 'rejected'));

-- Server level for the caller, from the reward ledger.
create or replace function public.tf_level_of(p_user uuid)
returns integer language sql stable security definer set search_path = '' as $$
  select public.tf_level_for_xp(coalesce((select sum(xp) from public.thrivefold_reward_ledger where user_id = p_user), 0)::integer)
$$;

create or replace function public.tf_meets_gate(p_user uuid, p_feature text)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.tf_level_of(p_user) >= coalesce((select min_level from public.thrivefold_progression_gates where feature_id = p_feature), 1000)
$$;

revoke all on function public.tf_level_of(uuid) from public, anon, authenticated;
revoke all on function public.tf_meets_gate(uuid, text) from public, anon, authenticated;

-- Discovery lists only verified open communities; members always see their own.
drop policy if exists "Active members can view community" on public.thrivefold_communities;
create policy "Active members can view community" on public.thrivefold_communities
  for select to authenticated
  using ((not is_private and verification_status = 'verified') or public.tf_is_community_member(id));

create or replace function public.tf_join_community(p_community uuid)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_user uuid := (select auth.uid());
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if public.tf_is_restricted(v_user, 'social_restricted') then raise exception 'account_restricted'; end if;
  if not exists (select 1 from public.thrivefold_profiles where user_id = v_user and is_age_verified) then
    raise exception 'age_verification_required';
  end if;
  if not exists (
    select 1 from public.thrivefold_communities
     where id = p_community and not is_private and verification_status = 'verified'
  ) then
    raise exception 'invitation_required';
  end if;
  if not public.tf_meets_gate(v_user, 'join_community') then raise exception 'level_required'; end if;
  insert into public.thrivefold_community_memberships (community_id, user_id, role, status)
  values (p_community, v_user, 'member', 'active')
  on conflict (community_id, user_id) do update set status = 'active';
end;
$$;

create or replace function public.tf_create_community(p_name text, p_purpose text, p_topic text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_id uuid;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if public.tf_is_restricted(v_user, 'social_restricted') then raise exception 'account_restricted'; end if;
  if not exists (select 1 from public.thrivefold_profiles where user_id = v_user and is_age_verified) then
    raise exception 'age_verification_required';
  end if;
  if not public.tf_meets_gate(v_user, 'create_community') then raise exception 'level_required'; end if;
  if char_length(btrim(coalesce(p_name, ''))) not between 3 and 60
     or char_length(btrim(coalesce(p_purpose, ''))) not between 10 and 280 then
    raise exception 'invalid_details';
  end if;
  if (select count(*) from public.thrivefold_communities
       where created_by = v_user and verification_status = 'pending_founder_call') >= 3 then
    raise exception 'too_many_pending';
  end if;
  insert into public.thrivefold_communities (name, type, purpose, topic, is_private, created_by, verification_status)
  values (btrim(p_name), 'topic_support', btrim(p_purpose), nullif(btrim(coalesce(p_topic, '')), ''), false, v_user, 'pending_founder_call')
  returning id into v_id;
  insert into public.thrivefold_community_memberships (community_id, user_id, role, status)
  values (v_id, v_user, 'owner', 'active');
  return v_id;
end;
$$;

-- Founder/admin marks an organiser as verified after the call.
create or replace function public.tf_admin_verify_community(p_community uuid, p_approved boolean)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not public.tf_is_platform_admin((select auth.uid())) then raise exception 'forbidden'; end if;
  update public.thrivefold_communities
     set verification_status = case when p_approved then 'verified' else 'rejected' end
   where id = p_community;
end;
$$;

-- What the caller can open, from server state, for the app to show honest locks.
create or replace function public.tf_my_gates()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'level', public.tf_level_of(auth.uid()),
    'age_verified', coalesce((select is_age_verified from public.thrivefold_profiles where user_id = auth.uid()), false),
    'gates', (select coalesce(jsonb_object_agg(feature_id, min_level), '{}'::jsonb) from public.thrivefold_progression_gates)
  )
$$;

revoke all on function public.tf_join_community(uuid) from public, anon;
revoke all on function public.tf_create_community(text, text, text) from public, anon;
revoke all on function public.tf_admin_verify_community(uuid, boolean) from public, anon;
revoke all on function public.tf_my_gates() from public, anon;
grant execute on function public.tf_join_community(uuid) to authenticated;
grant execute on function public.tf_create_community(text, text, text) to authenticated;
grant execute on function public.tf_admin_verify_community(uuid, boolean) to authenticated;
grant execute on function public.tf_my_gates() to authenticated;
