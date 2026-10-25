-- ============================================================================
-- Thrivefold migration 11: age assurance by a real provider
--
-- `is_age_verified` can only become true here, from a provider decision delivered to the
-- age-check Edge Function (signature-checked, service role). Clients can start a check and
-- read their own result; they can never write one. No ID images, document numbers or dates of
-- birth are stored: only provider, session id, outcome and time (DATA_PRIVACY.md).
-- ============================================================================

create table if not exists public.thrivefold_age_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  session_id text not null,
  status text not null default 'started'
    check (status in ('started', 'approved', 'declined', 'resubmission', 'expired', 'under_age', 'no_age')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (provider, session_id)
);
create index if not exists thrivefold_age_checks_user on public.thrivefold_age_checks (user_id, created_at desc);

alter table public.thrivefold_age_checks enable row level security;
revoke all on public.thrivefold_age_checks from anon, authenticated;
grant select on public.thrivefold_age_checks to authenticated;
drop policy if exists "Owners read their age checks" on public.thrivefold_age_checks;
create policy "Owners read their age checks" on public.thrivefold_age_checks
  for select to authenticated using (user_id = (select auth.uid()));

-- A profile row is needed before a decision can land (and for letters and groups).
create or replace function public.tf_ensure_profile(p_user uuid)
returns void language sql security definer set search_path = '' as $$
  insert into public.thrivefold_profiles (user_id, pseudonym)
  values (p_user, 'Member')
  on conflict (user_id) do nothing;
$$;

-- Service role only: the Edge Function records that a check started.
create or replace function public.tf_age_check_started(p_user uuid, p_provider text, p_session text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_user is null or coalesce(p_provider, '') = '' or coalesce(p_session, '') = '' then
    raise exception 'invalid_arguments';
  end if;
  -- At most five checks a day per person, so a provider bill can't be run up.
  if (select count(*) from public.thrivefold_age_checks
      where user_id = p_user and created_at > now() - interval '1 day') >= 5 then
    raise exception 'too_many_attempts';
  end if;
  perform public.tf_ensure_profile(p_user);
  insert into public.thrivefold_age_checks (user_id, provider, session_id)
  values (p_user, p_provider, p_session)
  on conflict (provider, session_id) do nothing;
end;
$$;

-- Service role only: the provider's signed decision. Only an approved check of an adult
-- (the function decides 18+ from the provider's date of birth and passes the boolean)
-- verifies the profile. A later decline never un-verifies someone already verified by an
-- earlier approved check; that is a moderation action, not an automatic one.
create or replace function public.tf_age_check_decided(
  p_provider text,
  p_session text,
  p_status text,
  p_is_adult boolean
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_check public.thrivefold_age_checks%rowtype;
  v_final text;
begin
  select * into v_check from public.thrivefold_age_checks
   where provider = p_provider and session_id = p_session
   for update;
  if not found then raise exception 'unknown_session'; end if;

  v_final := case
    when p_status = 'approved' and p_is_adult is true then 'approved'
    when p_status = 'approved' and p_is_adult is false then 'under_age'
    when p_status = 'approved' then 'no_age'
    when p_status in ('declined', 'resubmission', 'expired') then p_status
    else 'declined'
  end;

  update public.thrivefold_age_checks
     set status = v_final, decided_at = now()
   where id = v_check.id;

  if v_final = 'approved' then
    perform public.tf_ensure_profile(v_check.user_id);
    update public.thrivefold_profiles
       set is_age_verified = true, updated_at = now()
     where user_id = v_check.user_id;
  end if;

  return jsonb_build_object('user_id', v_check.user_id, 'status', v_final);
end;
$$;

-- The person's latest check, for the app's status screen.
create or replace function public.tf_my_age_check()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'verified', coalesce((select is_age_verified from public.thrivefold_profiles where user_id = (select auth.uid())), false),
    'status', (select status from public.thrivefold_age_checks where user_id = (select auth.uid()) order by created_at desc limit 1),
    'checked_at', (select coalesce(decided_at, created_at) from public.thrivefold_age_checks where user_id = (select auth.uid()) order by created_at desc limit 1)
  )
$$;

revoke all on function public.tf_ensure_profile(uuid) from public, anon, authenticated;
revoke all on function public.tf_age_check_started(uuid, text, text) from public, anon, authenticated;
revoke all on function public.tf_age_check_decided(text, text, text, boolean) from public, anon, authenticated;
revoke all on function public.tf_my_age_check() from public, anon;
grant execute on function public.tf_ensure_profile(uuid) to service_role;
grant execute on function public.tf_age_check_started(uuid, text, text) to service_role;
grant execute on function public.tf_age_check_decided(text, text, text, boolean) to service_role;
grant execute on function public.tf_my_age_check() to authenticated;
