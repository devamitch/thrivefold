-- ============================================================================
-- Thrivefold migration 12: dating (propmt.md section 18)
--
-- * Verified adults at level 20 only (existing `dating` gate), opted in with a dating profile.
-- * Gender and who someone is interested in are self-declared, never inferred.
-- * Only a woman may start a new conversation (18.1), enforced here, not in the app.
-- * Chip-only messages (18.2): approved, active, non-restricted chips, combined length capped;
--   no free text, contact details, calls, location or meetups.
-- * Blocks, restrictions and closing a conversation stop delivery both ways.
-- * No religion, caste or other identity-based matching rule is active (18.1: those stay
--   explicit and off until legal/platform review).
-- ============================================================================

insert into public.thrivefold_chip_catalog (id, category, text, subtext, risk_class, is_active, version)
values
  ('dating_hello_01', 'dating_hello', 'Hi! Your profile made me smile. I would like to get to know you.', 'Warm hello', 'safe', true, '2026.10.16-v1'),
  ('dating_hello_02', 'dating_hello', 'Hello, I think we share a few interests. Would you like to talk?', 'Shared interests', 'safe', true, '2026.10.16-v1'),
  ('dating_hello_03', 'dating_hello', 'Hi there, I like how you describe your days.', 'Noticed you', 'safe', true, '2026.10.16-v1'),
  ('dating_reflect_01', 'dating_reflection', 'I value honesty and kindness in a partner.', 'What matters', 'safe', true, '2026.10.16-v1'),
  ('dating_reflect_02', 'dating_reflection', 'I am looking for something steady and unhurried.', 'What I want', 'safe', true, '2026.10.16-v1'),
  ('dating_reflect_03', 'dating_reflection', 'Making each other laugh matters a lot to me.', 'Humour', 'safe', true, '2026.10.16-v1'),
  ('dating_reflect_04', 'dating_reflection', 'I like taking things slowly and getting to know someone well.', 'Pace', 'safe', true, '2026.10.16-v1'),
  ('dating_reflect_05', 'dating_reflection', 'What does a good week look like for you?', 'Question', 'safe', true, '2026.10.16-v1'),
  ('dating_reflect_06', 'dating_reflection', 'What is something you are looking forward to?', 'Question', 'safe', true, '2026.10.16-v1'),
  ('dating_playful_01', 'dating_playful', 'Tea or coffee? This is important.', 'Playful', 'safe', true, '2026.10.16-v1'),
  ('dating_playful_02', 'dating_playful', 'Your taste in hobbies is suspiciously good.', 'Playful', 'safe', true, '2026.10.16-v1'),
  ('dating_playful_03', 'dating_playful', 'Now I am curious what your perfect Sunday looks like.', 'Playful', 'safe', true, '2026.10.16-v1'),
  ('dating_reply_01', 'dating_reply', 'I would like that. Tell me more.', 'Reply', 'safe', true, '2026.10.16-v1'),
  ('dating_reply_02', 'dating_reply', 'Thank you, that is kind of you to say.', 'Reply', 'safe', true, '2026.10.16-v1'),
  ('dating_reply_03', 'dating_reply', 'I am enjoying this, and I would like to keep the pace slow.', 'Pace', 'boundary', true, '2026.10.16-v1'),
  ('dating_close_01', 'close_conversation', 'Thank you for the conversation. I do not think we are a match, and I wish you well.', 'Kind goodbye', 'boundary', true, '2026.10.16-v1')
on conflict (id) do update
  set category = excluded.category, text = excluded.text, subtext = excluded.subtext,
      risk_class = excluded.risk_class, is_active = excluded.is_active, version = excluded.version;

create table if not exists public.thrivefold_dating_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  gender text not null check (gender in ('woman', 'man', 'nonbinary')),
  interested_in text[] not null check (array_length(interested_in, 1) between 1 and 3
    and interested_in <@ array['woman', 'man', 'nonbinary']),
  interests text[] not null default '{}' check (coalesce(array_length(interests, 1), 0) <= 12),
  prompt_chip_ids text[] not null default '{}' check (coalesce(array_length(prompt_chip_ids, 1), 0) <= 3),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.thrivefold_dating_conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  initiator uuid not null references auth.users(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'closed')),
  closed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);

create table if not exists public.thrivefold_dating_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.thrivefold_dating_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  chip_ids text[] not null,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists thrivefold_dating_messages_conv on public.thrivefold_dating_messages (conversation_id, created_at);

alter table public.thrivefold_dating_profiles enable row level security;
alter table public.thrivefold_dating_conversations enable row level security;
alter table public.thrivefold_dating_messages enable row level security;
revoke all on public.thrivefold_dating_profiles, public.thrivefold_dating_conversations, public.thrivefold_dating_messages from anon, authenticated;
grant select on public.thrivefold_dating_profiles, public.thrivefold_dating_conversations, public.thrivefold_dating_messages to authenticated;

drop policy if exists "Own dating profile" on public.thrivefold_dating_profiles;
create policy "Own dating profile" on public.thrivefold_dating_profiles
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Participants see their conversations" on public.thrivefold_dating_conversations;
create policy "Participants see their conversations" on public.thrivefold_dating_conversations
  for select to authenticated using ((select auth.uid()) in (user_a, user_b));

drop policy if exists "Participants see messages unless blocked" on public.thrivefold_dating_messages;
create policy "Participants see messages unless blocked" on public.thrivefold_dating_messages
  for select to authenticated using (
    exists (
      select 1 from public.thrivefold_dating_conversations c
      where c.id = conversation_id
        and (select auth.uid()) in (c.user_a, c.user_b)
        and not public.tf_is_blocked_between(c.user_a, c.user_b)
    )
  );

-- Caller may use dating at all: verified adult, level gate, not socially restricted.
create or replace function public.tf_dating_assert_eligible(p_user uuid)
returns void language plpgsql stable security definer set search_path = '' as $$
begin
  if p_user is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from public.thrivefold_profiles where user_id = p_user and is_age_verified) then
    raise exception 'age_verification_required';
  end if;
  if not public.tf_meets_gate(p_user, 'dating') then raise exception 'level_required'; end if;
  if public.tf_is_restricted(p_user, 'social_restricted') then raise exception 'account_restricted'; end if;
end;
$$;

-- Validates chips and returns the assembled body (combined-message moderation, 18.2).
create or replace function public.tf_dating_assemble(p_chip_ids text[])
returns text language plpgsql stable security definer set search_path = '' as $$
declare v_valid int; v_body text;
begin
  if p_chip_ids is null or array_length(p_chip_ids, 1) is null or array_length(p_chip_ids, 1) > 6 then
    raise exception 'invalid_chips';
  end if;
  select count(*) into v_valid from public.thrivefold_chip_catalog c
   where c.id = any(p_chip_ids) and c.is_active and c.risk_class in ('safe', 'boundary');
  if v_valid <> (select count(distinct x) from unnest(p_chip_ids) as x) then raise exception 'invalid_chips'; end if;
  select string_agg(c.text, ' ' order by u.ord) into v_body
    from unnest(p_chip_ids) with ordinality as u(chip_id, ord)
    join public.thrivefold_chip_catalog c on c.id = u.chip_id;
  if length(v_body) > 900 then raise exception 'invalid_chips'; end if;
  return v_body;
end;
$$;

create or replace function public.tf_dating_save_profile(
  p_gender text, p_interested_in text[], p_interests text[], p_prompt_chip_ids text[], p_active boolean
) returns void language plpgsql security definer set search_path = '' as $$
declare v_me uuid := (select auth.uid());
begin
  perform public.tf_dating_assert_eligible(v_me);
  if coalesce(array_length(p_prompt_chip_ids, 1), 0) > 0 then
    perform public.tf_dating_assemble(p_prompt_chip_ids);
  end if;
  insert into public.thrivefold_dating_profiles (user_id, gender, interested_in, interests, prompt_chip_ids, is_active)
  values (v_me, p_gender, p_interested_in, coalesce(p_interests, '{}'), coalesce(p_prompt_chip_ids, '{}'), coalesce(p_active, true))
  on conflict (user_id) do update
    set gender = excluded.gender, interested_in = excluded.interested_in, interests = excluded.interests,
        prompt_chip_ids = excluded.prompt_chip_ids, is_active = excluded.is_active, updated_at = now();
end;
$$;

create or replace function public.tf_dating_delete_profile()
returns void language sql security definer set search_path = '' as $$
  delete from public.thrivefold_dating_profiles where user_id = (select auth.uid());
$$;

-- Mutually compatible, active, eligible people with no existing conversation.
create or replace function public.tf_dating_candidates(p_limit int default 20)
returns table (user_id uuid, pseudonym text, gender text, interests text[], intro text)
language plpgsql stable security definer set search_path = '' as $$
declare v_me uuid := (select auth.uid()); v_mine public.thrivefold_dating_profiles%rowtype;
begin
  perform public.tf_dating_assert_eligible(v_me);
  select * into v_mine from public.thrivefold_dating_profiles where thrivefold_dating_profiles.user_id = v_me and is_active;
  if not found then raise exception 'dating_profile_required'; end if;
  return query
    select d.user_id, coalesce(sp.pseudonym, 'Member'), d.gender, d.interests,
           (select string_agg(c.text, ' ' order by u.ord)
              from unnest(d.prompt_chip_ids) with ordinality as u(chip_id, ord)
              join public.thrivefold_chip_catalog c on c.id = u.chip_id and c.is_active)
    from public.thrivefold_dating_profiles d
    join public.thrivefold_profiles p on p.user_id = d.user_id and p.is_age_verified
    left join public.thrivefold_social_profiles sp on sp.user_id = d.user_id
    where d.user_id <> v_me
      and d.is_active
      and d.gender = any(v_mine.interested_in)
      and v_mine.gender = any(d.interested_in)
      and public.tf_meets_gate(d.user_id, 'dating')
      and not public.tf_is_restricted(d.user_id, 'social_restricted')
      and not public.tf_is_blocked_between(v_me, d.user_id)
      and not exists (
        select 1 from public.thrivefold_dating_conversations c
        where c.user_a = least(v_me, d.user_id) and c.user_b = greatest(v_me, d.user_id)
      )
    order by d.updated_at desc
    limit least(greatest(coalesce(p_limit, 20), 1), 50);
end;
$$;

-- First contact: only a woman, to a compatible person, three new conversations a day.
create or replace function public.tf_dating_start(p_recipient uuid, p_chip_ids text[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_me uuid := (select auth.uid());
  v_mine public.thrivefold_dating_profiles%rowtype;
  v_theirs public.thrivefold_dating_profiles%rowtype;
  v_body text;
  v_conv uuid;
begin
  perform public.tf_dating_assert_eligible(v_me);
  if p_recipient is null or p_recipient = v_me then raise exception 'recipient_unavailable'; end if;
  select * into v_mine from public.thrivefold_dating_profiles where user_id = v_me and is_active;
  if not found then raise exception 'dating_profile_required'; end if;
  if v_mine.gender <> 'woman' then raise exception 'women_start_conversations'; end if;
  select * into v_theirs from public.thrivefold_dating_profiles where user_id = p_recipient and is_active;
  if not found
     or not (v_theirs.gender = any(v_mine.interested_in) and v_mine.gender = any(v_theirs.interested_in))
     or not exists (select 1 from public.thrivefold_profiles where user_id = p_recipient and is_age_verified)
     or not public.tf_meets_gate(p_recipient, 'dating')
     or public.tf_is_restricted(p_recipient, 'social_restricted')
     or public.tf_is_blocked_between(v_me, p_recipient) then
    raise exception 'recipient_unavailable';
  end if;
  if exists (select 1 from public.thrivefold_dating_conversations
             where user_a = least(v_me, p_recipient) and user_b = greatest(v_me, p_recipient)) then
    raise exception 'conversation_exists';
  end if;
  if (select count(*) from public.thrivefold_dating_conversations
      where initiator = v_me and created_at >= date_trunc('day', now())) >= 3 then
    raise exception 'daily_introduction_limit';
  end if;
  v_body := public.tf_dating_assemble(p_chip_ids);
  insert into public.thrivefold_dating_conversations (user_a, user_b, initiator)
  values (least(v_me, p_recipient), greatest(v_me, p_recipient), v_me)
  returning id into v_conv;
  insert into public.thrivefold_dating_messages (conversation_id, sender_id, chip_ids, body)
  values (v_conv, v_me, p_chip_ids, v_body);
  return v_conv;
end;
$$;

-- Replies in an open conversation: either participant (18.1 "separate rules for replying").
create or replace function public.tf_dating_send(p_conversation uuid, p_chip_ids text[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_me uuid := (select auth.uid());
  v_conv public.thrivefold_dating_conversations%rowtype;
  v_other uuid;
  v_id uuid;
begin
  perform public.tf_dating_assert_eligible(v_me);
  select * into v_conv from public.thrivefold_dating_conversations where id = p_conversation for update;
  if not found or v_me not in (v_conv.user_a, v_conv.user_b) then raise exception 'conversation_unavailable'; end if;
  if v_conv.status <> 'open' then raise exception 'conversation_closed'; end if;
  v_other := case when v_me = v_conv.user_a then v_conv.user_b else v_conv.user_a end;
  if public.tf_is_blocked_between(v_me, v_other) or public.tf_is_restricted(v_other, 'social_restricted') then
    raise exception 'conversation_unavailable';
  end if;
  -- Calm pacing: at most 40 messages per person per conversation per day.
  if (select count(*) from public.thrivefold_dating_messages
      where conversation_id = p_conversation and sender_id = v_me and created_at >= date_trunc('day', now())) >= 40 then
    raise exception 'slow_down';
  end if;
  insert into public.thrivefold_dating_messages (conversation_id, sender_id, chip_ids, body)
  values (p_conversation, v_me, p_chip_ids, public.tf_dating_assemble(p_chip_ids))
  returning id into v_id;
  update public.thrivefold_dating_conversations set last_message_at = now() where id = p_conversation;
  return v_id;
end;
$$;

create or replace function public.tf_dating_mark_read(p_conversation uuid)
returns void language sql security definer set search_path = '' as $$
  update public.thrivefold_dating_messages m
     set read_at = now()
   where m.conversation_id = p_conversation
     and m.read_at is null
     and m.sender_id <> (select auth.uid())
     and exists (select 1 from public.thrivefold_dating_conversations c
                 where c.id = p_conversation and (select auth.uid()) in (c.user_a, c.user_b));
$$;

-- Either side can end a conversation at any time; no new messages after that.
create or replace function public.tf_dating_close(p_conversation uuid)
returns void language sql security definer set search_path = '' as $$
  update public.thrivefold_dating_conversations
     set status = 'closed', closed_by = (select auth.uid())
   where id = p_conversation and (select auth.uid()) in (user_a, user_b) and status = 'open';
$$;

-- Conversation list with the other person's pseudonym, last message and unread count.
create or replace function public.tf_dating_conversations()
returns table (id uuid, other_id uuid, other_pseudonym text, status text, initiator uuid,
               last_body text, last_message_at timestamptz, unread int)
language sql stable security definer set search_path = '' as $$
  select c.id,
         o.other_id,
         coalesce(sp.pseudonym, 'Member'),
         c.status,
         c.initiator,
         (select m.body from public.thrivefold_dating_messages m where m.conversation_id = c.id order by m.created_at desc limit 1),
         c.last_message_at,
         (select count(*)::int from public.thrivefold_dating_messages m
           where m.conversation_id = c.id and m.sender_id <> (select auth.uid()) and m.read_at is null)
  from public.thrivefold_dating_conversations c
  cross join lateral (select case when c.user_a = (select auth.uid()) then c.user_b else c.user_a end as other_id) o
  left join public.thrivefold_social_profiles sp on sp.user_id = o.other_id
  where (select auth.uid()) in (c.user_a, c.user_b)
    and not public.tf_is_blocked_between(c.user_a, c.user_b)
  order by c.last_message_at desc
$$;

revoke all on function public.tf_dating_assert_eligible(uuid) from public, anon, authenticated;
revoke all on function public.tf_dating_assemble(text[]) from public, anon, authenticated;
revoke all on function public.tf_dating_save_profile(text, text[], text[], text[], boolean) from public, anon;
revoke all on function public.tf_dating_delete_profile() from public, anon;
revoke all on function public.tf_dating_candidates(int) from public, anon;
revoke all on function public.tf_dating_start(uuid, text[]) from public, anon;
revoke all on function public.tf_dating_send(uuid, text[]) from public, anon;
revoke all on function public.tf_dating_mark_read(uuid) from public, anon;
revoke all on function public.tf_dating_close(uuid) from public, anon;
revoke all on function public.tf_dating_conversations() from public, anon;
grant execute on function public.tf_dating_save_profile(text, text[], text[], text[], boolean) to authenticated;
grant execute on function public.tf_dating_delete_profile() to authenticated;
grant execute on function public.tf_dating_candidates(int) to authenticated;
grant execute on function public.tf_dating_start(uuid, text[]) to authenticated;
grant execute on function public.tf_dating_send(uuid, text[]) to authenticated;
grant execute on function public.tf_dating_mark_read(uuid) to authenticated;
grant execute on function public.tf_dating_close(uuid) to authenticated;
grant execute on function public.tf_dating_conversations() to authenticated;
