-- ============================================================================
-- Thrivefold migration 14: therapy and practice groups that work
--
-- Spec 9.3-9.5 and the chip-first rule for group spaces (spec line 960):
-- * Each group states what it is (peer support, professionally facilitated, practice) and its
--   rules, shown before joining. A peer facilitator is never labelled a therapist.
-- * Join mode: open, or by approval of the organisers.
-- * Roles: owner, admin, moderator, facilitator, member. Owners and admins manage roles and
--   settings; moderators and up remove members, approve requests and hide messages.
-- * Group chat: members post approved cards only; owners, admins and facilitators may post a
--   short written facilitator note. Reactions, reports (three reports hide a message for review),
--   a daily posting limit. Nobody in a group can see anyone's health data.
-- * Sessions: organisers schedule them; members say whether they are coming.
-- Additive: existing functions keep working.
-- ============================================================================

insert into public.thrivefold_chip_catalog (id, category, text, subtext, risk_class, is_active, version)
values
  ('group_checkin_01', 'group_checkin', 'Checking in: today has been a good day.', 'Good day', 'safe', true, '2026.10.26-v1'),
  ('group_checkin_02', 'group_checkin', 'Checking in: today has been hard, but I am here.', 'Hard day', 'safe', true, '2026.10.26-v1'),
  ('group_checkin_03', 'group_checkin', 'I am feeling calmer than last week.', 'Calmer', 'safe', true, '2026.10.26-v1'),
  ('group_checkin_04', 'group_checkin', 'I am tired today and taking it slowly.', 'Tired', 'safe', true, '2026.10.26-v1'),
  ('group_checkin_05', 'group_checkin', 'I kept one small promise to myself today.', 'Small win', 'safe', true, '2026.10.26-v1'),
  ('group_checkin_06', 'group_checkin', 'I would like to listen today rather than share.', 'Listening', 'safe', true, '2026.10.26-v1'),
  ('group_share_01', 'group_share', 'Something that helped me this week was getting outside.', 'Fresh air', 'safe', true, '2026.10.26-v1'),
  ('group_share_02', 'group_share', 'Something that helped me this week was talking to someone I trust.', 'Talking', 'safe', true, '2026.10.26-v1'),
  ('group_share_03', 'group_share', 'Something that helped me this week was moving my body.', 'Movement', 'safe', true, '2026.10.26-v1'),
  ('group_share_04', 'group_share', 'Something that helped me this week was sleeping a little earlier.', 'Sleep', 'safe', true, '2026.10.26-v1'),
  ('group_share_05', 'group_share', 'I am finding it hard to stay motivated.', 'Motivation', 'safe', true, '2026.10.26-v1'),
  ('group_share_06', 'group_share', 'I am finding it hard to switch off at night.', 'Switching off', 'safe', true, '2026.10.26-v1'),
  ('group_share_07', 'group_share', 'I am finding it hard to ask for help.', 'Asking for help', 'safe', true, '2026.10.26-v1'),
  ('group_share_08', 'group_share', 'My goal for this week is one small, steady step.', 'Goal', 'safe', true, '2026.10.26-v1'),
  ('group_support_01', 'group_support', 'Thank you for sharing that.', 'Thanks', 'safe', true, '2026.10.26-v1'),
  ('group_support_02', 'group_support', 'That sounds really hard. You are not alone in it.', 'Not alone', 'safe', true, '2026.10.26-v1'),
  ('group_support_03', 'group_support', 'I have felt something similar.', 'Me too', 'safe', true, '2026.10.26-v1'),
  ('group_support_04', 'group_support', 'Well done for showing up today.', 'Showing up', 'safe', true, '2026.10.26-v1'),
  ('group_support_05', 'group_support', 'Sending you strength for the week.', 'Strength', 'safe', true, '2026.10.26-v1'),
  ('group_support_06', 'group_support', 'What helped you get through it?', 'Question', 'safe', true, '2026.10.26-v1'),
  ('group_support_07', 'group_support', 'Be gentle with yourself.', 'Gentle', 'safe', true, '2026.10.26-v1'),
  ('group_boundary_01', 'group_boundary', 'I would rather not go into detail, thank you.', 'Boundary', 'boundary', true, '2026.10.26-v1'),
  ('group_boundary_02', 'group_boundary', 'Please keep what is shared here inside the group.', 'Confidentiality', 'boundary', true, '2026.10.26-v1'),
  ('group_boundary_03', 'group_boundary', 'I would like the facilitator to look at this conversation.', 'Ask facilitator', 'boundary', true, '2026.10.26-v1')
on conflict (id) do update
  set category = excluded.category, text = excluded.text, subtext = excluded.subtext,
      risk_class = excluded.risk_class, is_active = excluded.is_active, version = excluded.version;

alter table public.thrivefold_communities
  add column if not exists kind text not null default 'peer_support'
    check (kind in ('peer_support', 'professional', 'practice')),
  add column if not exists join_mode text not null default 'open'
    check (join_mode in ('open', 'approval')),
  add column if not exists rules text not null default
    'Be kind. Keep what is shared here inside the group. No selling, recruiting or contact details. This group is not an emergency service.';

alter table public.thrivefold_community_memberships drop constraint if exists thrivefold_community_memberships_role_check;
alter table public.thrivefold_community_memberships add constraint thrivefold_community_memberships_role_check
  check (role in ('owner', 'admin', 'moderator', 'facilitator', 'member'));
alter table public.thrivefold_community_memberships drop constraint if exists thrivefold_community_memberships_status_check;
alter table public.thrivefold_community_memberships add constraint thrivefold_community_memberships_status_check
  check (status in ('active', 'pending', 'removed'));

create table if not exists public.thrivefold_community_messages (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.thrivefold_communities(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'cards' check (kind in ('cards', 'facilitator')),
  chip_ids text[] not null default '{}',
  body text not null,
  hidden boolean not null default false,
  report_count int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists thrivefold_community_messages_feed on public.thrivefold_community_messages (community_id, created_at desc);

create table if not exists public.thrivefold_community_reactions (
  message_id uuid not null references public.thrivefold_community_messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null check (reaction in ('heart', 'support', 'thanks', 'same')),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, reaction)
);

create table if not exists public.thrivefold_community_message_reports (
  message_id uuid not null references public.thrivefold_community_messages(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (message_id, reporter_id)
);

create table if not exists public.thrivefold_event_rsvps (
  event_id uuid not null references public.thrivefold_community_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  going boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

alter table public.thrivefold_community_messages enable row level security;
alter table public.thrivefold_community_reactions enable row level security;
alter table public.thrivefold_community_message_reports enable row level security;
alter table public.thrivefold_event_rsvps enable row level security;
revoke all on public.thrivefold_community_messages, public.thrivefold_community_reactions,
  public.thrivefold_community_message_reports, public.thrivefold_event_rsvps from anon, authenticated;
-- All reads go through the functions below; no direct table access.

-- Caller's role in a group (active members only), or null.
create or replace function public.tf_group_role(p_community uuid, p_user uuid)
returns text language sql stable security definer set search_path = '' as $$
  select m.role from public.thrivefold_community_memberships m
   where m.community_id = p_community and m.user_id = p_user and m.status = 'active'
$$;

create or replace function public.tf_group_rank(p_role text)
returns int language sql immutable set search_path = '' as $$
  select case p_role when 'owner' then 5 when 'admin' then 4 when 'moderator' then 3
                     when 'facilitator' then 2 when 'member' then 1 else 0 end
$$;

create or replace function public.tf_group_assert(p_community uuid, p_min text)
returns text language plpgsql stable security definer set search_path = '' as $$
declare v_role text := public.tf_group_role(p_community, (select auth.uid()));
begin
  if (select auth.uid()) is null then raise exception 'not_authenticated'; end if;
  if v_role is null then raise exception 'not_a_member'; end if;
  if public.tf_group_rank(v_role) < public.tf_group_rank(p_min) then raise exception 'forbidden'; end if;
  return v_role;
end;
$$;

-- Join: open groups add you at once; approval groups record a request.
create or replace function public.tf_group_join(p_community uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare v_user uuid := (select auth.uid()); v_mode text; v_status text;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if public.tf_is_restricted(v_user, 'social_restricted') then raise exception 'account_restricted'; end if;
  if not exists (select 1 from public.thrivefold_profiles where user_id = v_user and is_age_verified) then
    raise exception 'age_verification_required';
  end if;
  select join_mode into v_mode from public.thrivefold_communities
   where id = p_community and not is_private and verification_status = 'verified';
  if not found then raise exception 'invitation_required'; end if;
  if not public.tf_meets_gate(v_user, 'join_community') then raise exception 'level_required'; end if;
  if exists (select 1 from public.thrivefold_community_memberships
              where community_id = p_community and user_id = v_user and status = 'removed') then
    raise exception 'removed_from_group';
  end if;
  v_status := case when v_mode = 'approval' then 'pending' else 'active' end;
  insert into public.thrivefold_community_memberships (community_id, user_id, role, status)
  values (p_community, v_user, 'member', v_status)
  on conflict (community_id, user_id) do update
    set status = case when public.thrivefold_community_memberships.status = 'active' then 'active' else excluded.status end;
  return v_status;
end;
$$;

create or replace function public.tf_group_leave(p_community uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid := (select auth.uid());
begin
  if public.tf_group_role(p_community, v_user) = 'owner' then raise exception 'owner_cannot_leave'; end if;
  delete from public.thrivefold_community_memberships
   where community_id = p_community and user_id = v_user and status <> 'removed';
end;
$$;

-- Everything the group screen needs in one call, scoped to what the caller may see.
create or replace function public.tf_group_detail(p_community uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_user uuid := (select auth.uid());
  v_role text := public.tf_group_role(p_community, v_user);
  v_status text;
  v_c public.thrivefold_communities%rowtype;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  select * into v_c from public.thrivefold_communities where id = p_community;
  if not found then raise exception 'group_unavailable'; end if;
  select status into v_status from public.thrivefold_community_memberships
   where community_id = p_community and user_id = v_user;
  if v_role is null and (v_c.is_private or v_c.verification_status <> 'verified') then
    raise exception 'group_unavailable';
  end if;
  return jsonb_build_object(
    'id', v_c.id, 'name', v_c.name, 'purpose', v_c.purpose, 'topic', v_c.topic,
    'kind', v_c.kind, 'join_mode', v_c.join_mode, 'rules', v_c.rules,
    'verification_status', v_c.verification_status,
    'my_role', v_role, 'my_status', v_status,
    'member_count', (select count(*) from public.thrivefold_community_memberships
                      where community_id = p_community and status = 'active'),
    'members', case when v_role is null then '[]'::jsonb else (
      select coalesce(jsonb_agg(jsonb_build_object('user_id', m.user_id, 'role', m.role,
               'pseudonym', coalesce(sp.pseudonym, 'Member'))
               order by public.tf_group_rank(m.role) desc, m.joined_at), '[]'::jsonb)
        from public.thrivefold_community_memberships m
        left join public.thrivefold_social_profiles sp on sp.user_id = m.user_id
       where m.community_id = p_community and m.status = 'active'
         and not public.tf_is_blocked_between(v_user, m.user_id)) end,
    'pending', case when public.tf_group_rank(v_role) >= 3 then (
      select coalesce(jsonb_agg(jsonb_build_object('user_id', m.user_id,
               'pseudonym', coalesce(sp.pseudonym, 'Member'), 'requested_at', m.joined_at)
               order by m.joined_at), '[]'::jsonb)
        from public.thrivefold_community_memberships m
        left join public.thrivefold_social_profiles sp on sp.user_id = m.user_id
       where m.community_id = p_community and m.status = 'pending') else '[]'::jsonb end,
    'events', case when v_role is null then '[]'::jsonb else (
      select coalesce(jsonb_agg(jsonb_build_object('id', e.id, 'title', e.title, 'description', e.description,
               'event_type', e.event_type, 'start_time', e.start_time, 'end_time', e.end_time,
               'going', (select count(*) from public.thrivefold_event_rsvps r where r.event_id = e.id and r.going),
               'me_going', coalesce((select r.going from public.thrivefold_event_rsvps r
                                      where r.event_id = e.id and r.user_id = v_user), false))
               order by e.start_time), '[]'::jsonb)
        from public.thrivefold_community_events e
       where e.community_id = p_community and not e.is_cancelled and e.end_time > now()) end
  );
end;
$$;

-- Chat feed for members: newest 100, oldest first, with reactions. Hidden messages are
-- shown only to moderators and up (marked hidden).
create or replace function public.tf_group_messages(p_community uuid)
returns table (id uuid, sender_id uuid, pseudonym text, sender_role text, kind text, body text,
               hidden boolean, created_at timestamptz, reactions jsonb, my_reactions text[])
language plpgsql stable security definer set search_path = '' as $$
declare v_user uuid := (select auth.uid()); v_role text;
begin
  v_role := public.tf_group_assert(p_community, 'member');
  return query
    select m.id, m.sender_id, coalesce(sp.pseudonym, 'Member'), mm.role, m.kind, m.body, m.hidden, m.created_at,
           (select coalesce(jsonb_object_agg(x.reaction, x.n), '{}'::jsonb)
              from (select r.reaction, count(*) as n from public.thrivefold_community_reactions r
                     where r.message_id = m.id group by r.reaction) x),
           array(select r.reaction from public.thrivefold_community_reactions r
                  where r.message_id = m.id and r.user_id = v_user)
    from (select * from public.thrivefold_community_messages cm
           where cm.community_id = p_community
             and (not cm.hidden or public.tf_group_rank(v_role) >= 3)
           order by cm.created_at desc limit 100) m
    left join public.thrivefold_social_profiles sp on sp.user_id = m.sender_id
    left join public.thrivefold_community_memberships mm on mm.community_id = p_community and mm.user_id = m.sender_id
    where not public.tf_is_blocked_between(v_user, m.sender_id)
    order by m.created_at;
end;
$$;

create or replace function public.tf_group_post(p_community uuid, p_chip_ids text[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid := (select auth.uid()); v_id uuid;
begin
  perform public.tf_group_assert(p_community, 'member');
  if public.tf_is_restricted(v_user, 'social_restricted') then raise exception 'account_restricted'; end if;
  if (select count(*) from public.thrivefold_community_messages
       where community_id = p_community and sender_id = v_user and created_at >= date_trunc('day', now())) >= 30 then
    raise exception 'slow_down';
  end if;
  insert into public.thrivefold_community_messages (community_id, sender_id, kind, chip_ids, body)
  values (p_community, v_user, 'cards', p_chip_ids, public.tf_dating_assemble(p_chip_ids))
  returning id into v_id;
  return v_id;
end;
$$;

-- Facilitators, admins and owners may write a short note (prompts, session info).
create or replace function public.tf_group_note(p_community uuid, p_text text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid := (select auth.uid()); v_role text; v_id uuid; v_text text := btrim(coalesce(p_text, ''));
begin
  v_role := public.tf_group_assert(p_community, 'facilitator');
  if v_role = 'moderator' then raise exception 'forbidden'; end if;
  if char_length(v_text) not between 2 and 500 then raise exception 'invalid_details'; end if;
  if v_text ~* '(https?://|www\.|@[a-z0-9_]{3,}|\+?[0-9][0-9 ()-]{7,}[0-9])' then raise exception 'contact_details'; end if;
  insert into public.thrivefold_community_messages (community_id, sender_id, kind, body)
  values (p_community, v_user, 'facilitator', v_text)
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.tf_group_react(p_message uuid, p_reaction text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid := (select auth.uid()); v_comm uuid;
begin
  select community_id into v_comm from public.thrivefold_community_messages where id = p_message and not hidden;
  if not found then raise exception 'message_unavailable'; end if;
  perform public.tf_group_assert(v_comm, 'member');
  if exists (select 1 from public.thrivefold_community_reactions
              where message_id = p_message and user_id = v_user and reaction = p_reaction) then
    delete from public.thrivefold_community_reactions
     where message_id = p_message and user_id = v_user and reaction = p_reaction;
  else
    insert into public.thrivefold_community_reactions (message_id, user_id, reaction) values (p_message, v_user, p_reaction);
  end if;
end;
$$;

-- Report a message: goes to the safety queue; three reports hide it until a moderator looks.
create or replace function public.tf_group_report(p_message uuid, p_category text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid := (select auth.uid()); v_m public.thrivefold_community_messages%rowtype;
begin
  select * into v_m from public.thrivefold_community_messages where id = p_message;
  if not found then raise exception 'message_unavailable'; end if;
  perform public.tf_group_assert(v_m.community_id, 'member');
  if p_category not in ('harassment', 'pressure', 'selling', 'unsafe', 'other') then raise exception 'invalid_category'; end if;
  insert into public.thrivefold_community_message_reports (message_id, reporter_id) values (p_message, v_user)
  on conflict do nothing;
  if found then
    update public.thrivefold_community_messages
       set report_count = report_count + 1, hidden = hidden or report_count + 1 >= 3
     where id = p_message;
    insert into public.thrivefold_safety_reports (reporter_id, target_id, category, evidence_summary)
    values (v_user, v_m.sender_id, 'group_' || p_category,
            'group ' || v_m.community_id::text || ' message ' || v_m.id::text || E'\n' || v_m.body);
  end if;
end;
$$;

create or replace function public.tf_group_hide(p_message uuid, p_hidden boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare v_comm uuid;
begin
  select community_id into v_comm from public.thrivefold_community_messages where id = p_message;
  if not found then raise exception 'message_unavailable'; end if;
  perform public.tf_group_assert(v_comm, 'moderator');
  update public.thrivefold_community_messages set hidden = p_hidden where id = p_message;
end;
$$;

-- Approve or decline a join request (moderator and up).
create or replace function public.tf_group_decide(p_community uuid, p_user uuid, p_approve boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.tf_group_assert(p_community, 'moderator');
  if p_approve then
    update public.thrivefold_community_memberships set status = 'active', joined_at = now()
     where community_id = p_community and user_id = p_user and status = 'pending';
  else
    delete from public.thrivefold_community_memberships
     where community_id = p_community and user_id = p_user and status = 'pending';
  end if;
end;
$$;

-- Remove someone (moderator and up, never someone of equal or higher role). They cannot rejoin.
create or replace function public.tf_group_remove(p_community uuid, p_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_role text; v_target text;
begin
  v_role := public.tf_group_assert(p_community, 'moderator');
  v_target := public.tf_group_role(p_community, p_user);
  if v_target is null then raise exception 'not_a_member'; end if;
  if public.tf_group_rank(v_target) >= public.tf_group_rank(v_role) then raise exception 'forbidden'; end if;
  update public.thrivefold_community_memberships set status = 'removed', role = 'member'
   where community_id = p_community and user_id = p_user;
end;
$$;

-- Change someone's role. Owners set any role below owner; admins set moderator/facilitator/member.
create or replace function public.tf_group_set_role(p_community uuid, p_user uuid, p_role text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_role text; v_target text;
begin
  v_role := public.tf_group_assert(p_community, 'admin');
  if p_role not in ('admin', 'moderator', 'facilitator', 'member') then raise exception 'invalid_role'; end if;
  v_target := public.tf_group_role(p_community, p_user);
  if v_target is null then raise exception 'not_a_member'; end if;
  if public.tf_group_rank(v_target) >= public.tf_group_rank(v_role)
     or public.tf_group_rank(p_role) >= public.tf_group_rank(v_role) then
    raise exception 'forbidden';
  end if;
  update public.thrivefold_community_memberships set role = p_role
   where community_id = p_community and user_id = p_user;
end;
$$;

-- Settings (owner and admin). Choosing "professional" is a claim the founder checks on the
-- verification call; it is shown to members as "professionally facilitated".
create or replace function public.tf_group_settings(p_community uuid, p_kind text, p_join_mode text, p_rules text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_rules text := btrim(coalesce(p_rules, ''));
begin
  perform public.tf_group_assert(p_community, 'admin');
  if char_length(v_rules) not between 20 and 1000 then raise exception 'invalid_details'; end if;
  update public.thrivefold_communities
     set kind = p_kind, join_mode = p_join_mode, rules = v_rules
   where id = p_community;
end;
$$;

create or replace function public.tf_group_create_event(
  p_community uuid, p_title text, p_description text, p_type text, p_start timestamptz, p_minutes int
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_role text;
begin
  v_role := public.tf_group_assert(p_community, 'facilitator');
  if v_role = 'moderator' then raise exception 'forbidden'; end if;
  if char_length(btrim(coalesce(p_title, ''))) not between 3 and 80
     or char_length(btrim(coalesce(p_description, ''))) > 400
     or p_start < now() - interval '5 minutes'
     or p_minutes not between 15 and 240
     or p_type not in ('mindful_reflection', 'support_circle', 'expert_qa', 'practice_session') then
    raise exception 'invalid_details';
  end if;
  insert into public.thrivefold_community_events (community_id, title, description, event_type, start_time, end_time, created_by)
  values (p_community, btrim(p_title), btrim(coalesce(p_description, '')), p_type, p_start,
          p_start + make_interval(mins => p_minutes), (select auth.uid()))
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.tf_group_cancel_event(p_event uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_comm uuid;
begin
  select community_id into v_comm from public.thrivefold_community_events where id = p_event;
  if not found then raise exception 'event_unavailable'; end if;
  perform public.tf_group_assert(v_comm, 'facilitator');
  update public.thrivefold_community_events set is_cancelled = true where id = p_event;
end;
$$;

create or replace function public.tf_group_rsvp(p_event uuid, p_going boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare v_comm uuid;
begin
  select community_id into v_comm from public.thrivefold_community_events where id = p_event and not is_cancelled;
  if not found then raise exception 'event_unavailable'; end if;
  perform public.tf_group_assert(v_comm, 'member');
  insert into public.thrivefold_event_rsvps (event_id, user_id, going) values (p_event, (select auth.uid()), p_going)
  on conflict (event_id, user_id) do update set going = excluded.going, updated_at = now();
end;
$$;

revoke all on function public.tf_group_role(uuid, uuid) from public, anon, authenticated;
revoke all on function public.tf_group_rank(text) from public, anon, authenticated;
revoke all on function public.tf_group_assert(uuid, text) from public, anon, authenticated;
do $$
declare f text;
begin
  foreach f in array array[
    'tf_group_join(uuid)', 'tf_group_leave(uuid)', 'tf_group_detail(uuid)', 'tf_group_messages(uuid)',
    'tf_group_post(uuid, text[])', 'tf_group_note(uuid, text)', 'tf_group_react(uuid, text)',
    'tf_group_report(uuid, text)', 'tf_group_hide(uuid, boolean)', 'tf_group_decide(uuid, uuid, boolean)',
    'tf_group_remove(uuid, uuid)', 'tf_group_set_role(uuid, uuid, text)', 'tf_group_settings(uuid, text, text, text)',
    'tf_group_create_event(uuid, text, text, text, timestamptz, int)', 'tf_group_cancel_event(uuid)',
    'tf_group_rsvp(uuid, boolean)'
  ] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end;
$$;
