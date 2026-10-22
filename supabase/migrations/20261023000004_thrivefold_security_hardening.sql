-- ============================================================================
-- Thrivefold: security hardening (REQ-008/009/010/011/012/014)
--
-- Fixes in the earlier migrations:
--  * community/organization policies compared `community_id = id` inside a subquery,
--    where `id` resolved to the membership row — private communities were broken, and
--    the organization-members policy queried its own table (infinite recursion).
--  * letters could be inserted directly with any body, status or delivery time
--    (bypassing chip-only composition and delayed delivery) and recipients could
--    update every column; in-transit letters were readable before delivery.
--  * users could set their own `is_age_verified` and grant themselves stamps.
--  * consent could not be revoked.
--  * payment tables existed although the initial release has no payments.
-- Adds: server-side letter delivery, founder-controlled special access grants,
-- account restrictions + appeals, data export. Deny by default; no anon access.
-- Idempotent.
-- ============================================================================

revoke all on all tables in schema public from anon;

-- ----------------------------------------------------------------------------
-- 1. Payments are out of scope for the initial release (REQ-014)
-- ----------------------------------------------------------------------------
drop table if exists public.thrivefold_credit_ledger;
drop table if exists public.thrivefold_entitlements;

-- ----------------------------------------------------------------------------
-- 2. Administration, special grants, restrictions, appeals, audit
-- ----------------------------------------------------------------------------
create table if not exists public.thrivefold_platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
); -- populated only with the service role (founder action); no client access

create table if not exists public.thrivefold_special_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null default 'initial_release_all_features',
  reason text not null check (length(trim(reason)) between 3 and 300),
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null
);
create unique index if not exists thrivefold_special_grants_active
  on public.thrivefold_special_grants(user_id, scope) where revoked_at is null;

create table if not exists public.thrivefold_account_restrictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('social_restricted', 'suspended')),
  reason_code text not null,
  evidence_summary text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  lifted_at timestamptz,
  lifted_by uuid references auth.users(id) on delete set null
);
create index if not exists thrivefold_restrictions_user on public.thrivefold_account_restrictions(user_id);

create table if not exists public.thrivefold_appeals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  restriction_id uuid not null references public.thrivefold_account_restrictions(id) on delete cascade,
  statement text not null check (length(trim(statement)) between 10 and 2000),
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'upheld', 'overturned')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references auth.users(id) on delete set null,
  unique (restriction_id, user_id)
);

create table if not exists public.thrivefold_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  target_user_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
); -- server-only

alter table public.thrivefold_platform_admins enable row level security;
alter table public.thrivefold_special_grants enable row level security;
alter table public.thrivefold_account_restrictions enable row level security;
alter table public.thrivefold_appeals enable row level security;
alter table public.thrivefold_audit_log enable row level security;

-- ----------------------------------------------------------------------------
-- 3. Helper functions (security definer, fixed search_path)
-- ----------------------------------------------------------------------------
create or replace function public.tf_is_platform_admin(p_user uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.thrivefold_platform_admins a where a.user_id = p_user) $$;

create or replace function public.tf_is_restricted(p_user uuid, p_kind text default null)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.thrivefold_account_restrictions r
    where r.user_id = p_user
      and r.lifted_at is null
      and r.starts_at <= now()
      and (r.ends_at is null or r.ends_at > now())
      and (p_kind is null or r.kind = p_kind or r.kind = 'suspended')
  )
$$;

create or replace function public.tf_has_special_grant(p_user uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.thrivefold_special_grants g
    where g.user_id = p_user and g.revoked_at is null
  )
$$;

create or replace function public.tf_is_blocked_between(p_a uuid, p_b uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.thrivefold_blocks b
    where (b.user_id = p_a and b.blocked_user_id = p_b)
       or (b.user_id = p_b and b.blocked_user_id = p_a)
  )
$$;

create or replace function public.tf_is_community_member(p_community uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.thrivefold_community_memberships m
    where m.community_id = p_community and m.user_id = (select auth.uid()) and m.status = 'active'
  )
$$;

create or replace function public.tf_is_org_member(p_org uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.thrivefold_organization_members m
    where m.organization_id = p_org and m.user_id = (select auth.uid()) and m.is_active
  )
$$;

revoke all on function public.tf_is_platform_admin(uuid) from public;
revoke all on function public.tf_is_restricted(uuid, text) from public;
revoke all on function public.tf_has_special_grant(uuid) from public;
revoke all on function public.tf_is_blocked_between(uuid, uuid) from public;
revoke all on function public.tf_is_community_member(uuid) from public;
revoke all on function public.tf_is_org_member(uuid) from public;
grant execute on function public.tf_is_community_member(uuid) to authenticated;
grant execute on function public.tf_is_org_member(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 4. Profiles: verification and age band are server-controlled
-- ----------------------------------------------------------------------------
create or replace function public.tf_protect_profile_fields()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if (select auth.role()) = 'service_role' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.is_age_verified := false;
  else
    new.is_age_verified := old.is_age_verified;
    new.age_band := old.age_band;
    new.user_id := old.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists tf_protect_profile_fields on public.thrivefold_profiles;
create trigger tf_protect_profile_fields
  before insert or update on public.thrivefold_profiles
  for each row execute function public.tf_protect_profile_fields();

alter table public.thrivefold_profiles alter column age_band drop not null;
alter table public.thrivefold_profiles alter column age_band drop default;

-- ----------------------------------------------------------------------------
-- 5. Consents can be revoked by their owner
-- ----------------------------------------------------------------------------
drop policy if exists "Users update own consents" on public.thrivefold_consents;
create policy "Users update own consents" on public.thrivefold_consents
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6. Communities and organizations (fixed membership checks, no recursion)
-- ----------------------------------------------------------------------------
drop policy if exists "Active members can view community" on public.thrivefold_communities;
create policy "Active members can view community" on public.thrivefold_communities
  for select to authenticated
  using (not is_private or public.tf_is_community_member(id));

drop policy if exists "Organizations are viewable by authenticated users" on public.thrivefold_organizations;
create policy "Organizations are viewable by authenticated users" on public.thrivefold_organizations
  for select to authenticated
  using (is_verified or public.tf_is_org_member(id));

drop policy if exists "Organization members viewable by org colleagues" on public.thrivefold_organization_members;
create policy "Organization members viewable by org colleagues" on public.thrivefold_organization_members
  for select to authenticated
  using (user_id = auth.uid() or public.tf_is_org_member(organization_id));

drop policy if exists "Community events viewable by members" on public.thrivefold_community_events;
create policy "Community events viewable by members" on public.thrivefold_community_events
  for select to authenticated
  using (public.tf_is_community_member(community_id));

-- Stamps are granted by the server, never self-assigned.
drop policy if exists "Users insert into own stamp collection" on public.thrivefold_user_stamps;

-- ----------------------------------------------------------------------------
-- 7. Letters: delivered only through tf_send_letter; readable after delivery time
-- ----------------------------------------------------------------------------
drop policy if exists "Sender can insert letters" on public.thrivefold_letters;
drop policy if exists "Recipient can update letter status" on public.thrivefold_letters;
drop policy if exists "Sender or recipient can view letters" on public.thrivefold_letters;
create policy "Sender sees sent letters; recipient sees delivered ones" on public.thrivefold_letters
  for select to authenticated
  using (
    (auth.uid() = sender_id)
    or (
      auth.uid() = recipient_id
      and status in ('in_transit', 'delivered', 'opened')
      and scheduled_delivery_at <= now()
      and not public.tf_is_blocked_between(sender_id, recipient_id)
    )
  );

create or replace function public.tf_send_letter(
  p_recipient uuid,
  p_chip_ids text[],
  p_stamp_id text
) returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_sender uuid := (select auth.uid());
  v_body text;
  v_valid int;
  v_is_new_pair boolean;
  v_new_today int;
  v_transit int := 12;
  v_id uuid;
begin
  if v_sender is null then raise exception 'not_authenticated'; end if;
  if v_sender = p_recipient then raise exception 'invalid_recipient'; end if;

  -- Both sides must be verified adults (REQ-013); verification is server-set only.
  if not exists (select 1 from public.thrivefold_profiles where user_id = v_sender and is_age_verified) then
    raise exception 'age_verification_required';
  end if;
  if not exists (select 1 from public.thrivefold_profiles where user_id = p_recipient and is_age_verified) then
    raise exception 'recipient_unavailable';
  end if;
  if public.tf_is_restricted(v_sender, 'social_restricted') then raise exception 'account_restricted'; end if;
  if public.tf_is_restricted(p_recipient, 'social_restricted') then raise exception 'recipient_unavailable'; end if;
  if public.tf_is_blocked_between(v_sender, p_recipient) then raise exception 'recipient_unavailable'; end if;

  -- Chip-only composition (ADR-002): 1..12 approved, active, non-restricted chips.
  if p_chip_ids is null or array_length(p_chip_ids, 1) is null or array_length(p_chip_ids, 1) > 12 then
    raise exception 'invalid_chips';
  end if;
  select count(*) into v_valid
  from public.thrivefold_chip_catalog c
  where c.id = any(p_chip_ids) and c.is_active and c.risk_class in ('safe', 'boundary');
  if v_valid <> (select count(distinct x) from unnest(p_chip_ids) as x) then
    raise exception 'invalid_chips';
  end if;
  select string_agg(c.text, ' ' order by u.ord) into v_body
  from unnest(p_chip_ids) with ordinality as u(chip_id, ord)
  join public.thrivefold_chip_catalog c on c.id = u.chip_id;

  -- New introductions need the recipient's consent and are limited to one per day.
  v_is_new_pair := not exists (
    select 1 from public.thrivefold_letters l
    where (l.sender_id = v_sender and l.recipient_id = p_recipient)
       or (l.sender_id = p_recipient and l.recipient_id = v_sender)
  );
  if v_is_new_pair then
    if not exists (
      select 1 from public.thrivefold_social_profiles sp
      where sp.user_id = p_recipient and sp.accepts_introductions
    ) then
      raise exception 'recipient_unavailable';
    end if;
    select count(distinct l.recipient_id) into v_new_today
    from public.thrivefold_letters l
    where l.sender_id = v_sender
      and l.sent_at >= date_trunc('day', now())
      and not exists (
        select 1 from public.thrivefold_letters e
        where e.sender_id = v_sender and e.recipient_id = l.recipient_id and e.sent_at < l.sent_at
      );
    if v_new_today >= 1 then raise exception 'daily_introduction_limit'; end if;
  end if;

  insert into public.thrivefold_letters (
    sender_id, recipient_id, stamp_id, chip_ids, assembled_body,
    transit_hours, status, sent_at, scheduled_delivery_at
  ) values (
    v_sender, p_recipient, coalesce(p_stamp_id, 'standard'), p_chip_ids, v_body,
    v_transit, 'in_transit', now(), now() + make_interval(hours => v_transit)
  ) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.tf_mark_letter_opened(p_letter uuid)
returns void language sql security definer set search_path = ''
as $$
  update public.thrivefold_letters
     set status = 'opened', opened_at = coalesce(opened_at, now())
   where id = p_letter
     and recipient_id = (select auth.uid())
     and scheduled_delivery_at <= now()
     and status in ('in_transit', 'delivered', 'opened');
$$;

create or replace function public.tf_decline_letter(p_letter uuid)
returns void language sql security definer set search_path = ''
as $$
  update public.thrivefold_letters
     set status = 'declined'
   where id = p_letter
     and recipient_id = (select auth.uid())
     and scheduled_delivery_at <= now();
$$;

revoke all on function public.tf_send_letter(uuid, text[], text) from public;
revoke all on function public.tf_mark_letter_opened(uuid) from public;
revoke all on function public.tf_decline_letter(uuid) from public;
grant execute on function public.tf_send_letter(uuid, text[], text) to authenticated;
grant execute on function public.tf_mark_letter_opened(uuid) to authenticated;
grant execute on function public.tf_decline_letter(uuid) to authenticated;

-- Blocking or restricting someone stops their letters that are still travelling.
create or replace function public.tf_cancel_pending_on_block()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  update public.thrivefold_letters
     set status = 'cancelled'
   where status = 'in_transit'
     and scheduled_delivery_at > now()
     and ((sender_id = new.user_id and recipient_id = new.blocked_user_id)
       or (sender_id = new.blocked_user_id and recipient_id = new.user_id));
  return new;
end;
$$;
drop trigger if exists tf_cancel_pending_on_block on public.thrivefold_blocks;
create trigger tf_cancel_pending_on_block after insert on public.thrivefold_blocks
  for each row execute function public.tf_cancel_pending_on_block();

create or replace function public.tf_cancel_pending_on_restriction()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  update public.thrivefold_letters
     set status = 'cancelled'
   where sender_id = new.user_id and status = 'in_transit' and scheduled_delivery_at > now();
  return new;
end;
$$;
drop trigger if exists tf_cancel_pending_on_restriction on public.thrivefold_account_restrictions;
create trigger tf_cancel_pending_on_restriction after insert on public.thrivefold_account_restrictions
  for each row execute function public.tf_cancel_pending_on_restriction();

-- ----------------------------------------------------------------------------
-- 8. Community joining (restricted users excluded server-side)
-- ----------------------------------------------------------------------------
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
  if not exists (select 1 from public.thrivefold_communities where id = p_community and not is_private) then
    raise exception 'invitation_required';
  end if;
  insert into public.thrivefold_community_memberships (community_id, user_id, role, status)
  values (p_community, v_user, 'member', 'active')
  on conflict (community_id, user_id) do update set status = 'active';
end;
$$;

create or replace function public.tf_leave_community(p_community uuid)
returns void language sql security definer set search_path = ''
as $$
  delete from public.thrivefold_community_memberships
   where community_id = p_community and user_id = (select auth.uid());
$$;

revoke all on function public.tf_join_community(uuid) from public;
revoke all on function public.tf_leave_community(uuid) from public;
grant execute on function public.tf_join_community(uuid) to authenticated;
grant execute on function public.tf_leave_community(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 9. Special grants: founder-controlled, never self-assigned (REQ-010)
--    A grant unlocks eligible features but never overrides age, consent, blocks,
--    restrictions or safety rules — those checks run regardless.
-- ----------------------------------------------------------------------------
drop policy if exists "Users read own special grants" on public.thrivefold_special_grants;
create policy "Users read own special grants" on public.thrivefold_special_grants
  for select to authenticated using (user_id = auth.uid());

create or replace function public.tf_admin_grant_special(p_user uuid, p_reason text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_admin uuid := (select auth.uid()); v_id uuid;
begin
  if not public.tf_is_platform_admin(v_admin) then raise exception 'forbidden'; end if;
  if p_user = v_admin then raise exception 'cannot_self_grant'; end if;
  insert into public.thrivefold_special_grants (user_id, reason, granted_by)
  values (p_user, p_reason, v_admin)
  on conflict (user_id, scope) where revoked_at is null do nothing
  returning id into v_id;
  insert into public.thrivefold_audit_log (actor_id, action, target_user_id, details)
  values (v_admin, 'special_grant.created', p_user, jsonb_build_object('reason', p_reason));
  return v_id;
end;
$$;

create or replace function public.tf_admin_revoke_special(p_user uuid, p_reason text)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_admin uuid := (select auth.uid());
begin
  if not public.tf_is_platform_admin(v_admin) then raise exception 'forbidden'; end if;
  update public.thrivefold_special_grants
     set revoked_at = now(), revoked_by = v_admin
   where user_id = p_user and revoked_at is null;
  insert into public.thrivefold_audit_log (actor_id, action, target_user_id, details)
  values (v_admin, 'special_grant.revoked', p_user, jsonb_build_object('reason', p_reason));
end;
$$;

revoke all on function public.tf_admin_grant_special(uuid, text) from public;
revoke all on function public.tf_admin_revoke_special(uuid, text) from public;
grant execute on function public.tf_admin_grant_special(uuid, text) to authenticated;
grant execute on function public.tf_admin_revoke_special(uuid, text) to authenticated;

-- ----------------------------------------------------------------------------
-- 10. Restrictions are applied by admins with evidence; users can appeal (REQ-011)
-- ----------------------------------------------------------------------------
drop policy if exists "Users read own restrictions" on public.thrivefold_account_restrictions;
create policy "Users read own restrictions" on public.thrivefold_account_restrictions
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "Users read own appeals" on public.thrivefold_appeals;
create policy "Users read own appeals" on public.thrivefold_appeals
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users appeal own restrictions" on public.thrivefold_appeals;
create policy "Users appeal own restrictions" on public.thrivefold_appeals
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'submitted'
    and exists (
      select 1 from public.thrivefold_account_restrictions r
      where r.id = restriction_id and r.user_id = auth.uid()
    )
  );

create or replace function public.tf_admin_restrict(
  p_user uuid, p_kind text, p_reason_code text, p_evidence text, p_ends_at timestamptz default null
) returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_admin uuid := (select auth.uid()); v_id uuid;
begin
  if not public.tf_is_platform_admin(v_admin) then raise exception 'forbidden'; end if;
  if p_user = v_admin then raise exception 'cannot_restrict_self'; end if;
  if length(trim(coalesce(p_evidence, ''))) < 10 then raise exception 'evidence_required'; end if;
  insert into public.thrivefold_account_restrictions (user_id, kind, reason_code, evidence_summary, ends_at, created_by)
  values (p_user, p_kind, p_reason_code, p_evidence, p_ends_at, v_admin)
  returning id into v_id;
  insert into public.thrivefold_audit_log (actor_id, action, target_user_id, details)
  values (v_admin, 'restriction.created', p_user, jsonb_build_object('kind', p_kind, 'reason_code', p_reason_code));
  return v_id;
end;
$$;

create or replace function public.tf_admin_decide_appeal(p_appeal uuid, p_overturn boolean)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_admin uuid := (select auth.uid()); v_restriction uuid; v_user uuid;
begin
  if not public.tf_is_platform_admin(v_admin) then raise exception 'forbidden'; end if;
  update public.thrivefold_appeals
     set status = case when p_overturn then 'overturned' else 'upheld' end,
         decided_at = now(), decided_by = v_admin
   where id = p_appeal and status in ('submitted', 'under_review')
  returning restriction_id, user_id into v_restriction, v_user;
  if v_restriction is null then raise exception 'appeal_not_open'; end if;
  if v_user = v_admin then raise exception 'cannot_decide_own_appeal'; end if;
  if p_overturn then
    update public.thrivefold_account_restrictions
       set lifted_at = now(), lifted_by = v_admin
     where id = v_restriction;
  end if;
  insert into public.thrivefold_audit_log (actor_id, action, target_user_id, details)
  values (v_admin, 'appeal.decided', v_user, jsonb_build_object('overturned', p_overturn));
end;
$$;

revoke all on function public.tf_admin_restrict(uuid, text, text, text, timestamptz) from public;
revoke all on function public.tf_admin_decide_appeal(uuid, boolean) from public;
grant execute on function public.tf_admin_restrict(uuid, text, text, text, timestamptz) to authenticated;
grant execute on function public.tf_admin_decide_appeal(uuid, boolean) to authenticated;

-- ----------------------------------------------------------------------------
-- 11. Export everything the server holds about the caller (REQ-008)
-- ----------------------------------------------------------------------------
create or replace function public.tf_export_my_data()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'exported_at', now(),
    'profile', (select to_jsonb(p) from public.thrivefold_profiles p where p.user_id = (select auth.uid())),
    'social_profile', (select to_jsonb(s) from public.thrivefold_social_profiles s where s.user_id = (select auth.uid())),
    'consents', (select coalesce(jsonb_agg(c), '[]') from public.thrivefold_consents c where c.user_id = (select auth.uid())),
    'letters_sent', (select coalesce(jsonb_agg(l), '[]') from public.thrivefold_letters l where l.sender_id = (select auth.uid())),
    'letters_received', (select coalesce(jsonb_agg(l), '[]') from public.thrivefold_letters l
                          where l.recipient_id = (select auth.uid()) and l.scheduled_delivery_at <= now()),
    'memberships', (select coalesce(jsonb_agg(m), '[]') from public.thrivefold_community_memberships m where m.user_id = (select auth.uid())),
    'blocks', (select coalesce(jsonb_agg(b), '[]') from public.thrivefold_blocks b where b.user_id = (select auth.uid())),
    'reports_submitted', (select coalesce(jsonb_agg(r), '[]') from public.thrivefold_safety_reports r where r.reporter_id = (select auth.uid())),
    'restrictions', (select coalesce(jsonb_agg(r), '[]') from public.thrivefold_account_restrictions r where r.user_id = (select auth.uid())),
    'appeals', (select coalesce(jsonb_agg(a), '[]') from public.thrivefold_appeals a where a.user_id = (select auth.uid())),
    'special_grants', (select coalesce(jsonb_agg(g), '[]') from public.thrivefold_special_grants g where g.user_id = (select auth.uid()))
  )
$$;
revoke all on function public.tf_export_my_data() from public;
grant execute on function public.tf_export_my_data() to authenticated;
