-- ============================================================================
-- Thrivefold migration 13: dating preferences, ranked matches, reporting
--
-- * Self-described age band and the bands someone would like to meet (spec 23.4: "user-selected
--   age range"). Labelled self-described in the app: verification proves 18+, not an exact age.
-- * Languages, what someone is looking for, and preferred pace (spec 23.4 / 26.7 matching
--   preferences). All chosen by the person; nothing inferred.
-- * Candidates are filtered by mutual preferences and ranked by shared interests, languages,
--   intention and pace, with the reasons returned so the app can show why someone appears.
-- * Report from a conversation: a safety report with the chip messages as evidence, optionally
--   blocking at the same time.
-- Additive only: migration 12 functions keep their signatures except tf_dating_candidates,
-- which gains columns.
-- ============================================================================

alter table public.thrivefold_dating_profiles
  add column if not exists age_band text
    check (age_band in ('18-24', '25-34', '35-44', '45-54', '55+')),
  add column if not exists want_age_bands text[] not null default '{}'
    check (want_age_bands <@ array['18-24', '25-34', '35-44', '45-54', '55+']),
  add column if not exists languages text[] not null default '{}'
    check (coalesce(array_length(languages, 1), 0) <= 6),
  add column if not exists intention text
    check (intention in ('friendship_first', 'long_term', 'open')),
  add column if not exists pace text
    check (pace in ('slow', 'steady'));

create or replace function public.tf_dating_save_preferences(
  p_age_band text, p_want_age_bands text[], p_languages text[], p_intention text, p_pace text
) returns void language plpgsql security definer set search_path = '' as $$
declare v_me uuid := (select auth.uid());
begin
  perform public.tf_dating_assert_eligible(v_me);
  update public.thrivefold_dating_profiles
     set age_band = p_age_band,
         want_age_bands = coalesce(p_want_age_bands, '{}'),
         languages = coalesce(p_languages, '{}'),
         intention = p_intention,
         pace = p_pace,
         updated_at = now()
   where user_id = v_me;
  if not found then raise exception 'dating_profile_required'; end if;
end;
$$;

-- Both people fit each other's stated preferences (gender and, when set, age band).
create or replace function public.tf_dating_mutual(
  a public.thrivefold_dating_profiles, b public.thrivefold_dating_profiles
) returns boolean language sql immutable set search_path = '' as $$
  select b.gender = any(a.interested_in)
     and a.gender = any(b.interested_in)
     and (cardinality(a.want_age_bands) = 0 or b.age_band = any(a.want_age_bands))
     and (cardinality(b.want_age_bands) = 0 or a.age_band = any(b.want_age_bands));
$$;

drop function if exists public.tf_dating_candidates(int);
create function public.tf_dating_candidates(p_limit int default 20)
returns table (
  user_id uuid, pseudonym text, gender text, interests text[], intro text,
  age_band text, intention text, pace text, languages text[],
  shared_interests text[], shared_languages text[], score int
)
language plpgsql stable security definer set search_path = '' as $$
declare v_me uuid := (select auth.uid()); v_mine public.thrivefold_dating_profiles%rowtype;
begin
  perform public.tf_dating_assert_eligible(v_me);
  select * into v_mine from public.thrivefold_dating_profiles dp where dp.user_id = v_me and dp.is_active;
  if not found then raise exception 'dating_profile_required'; end if;
  return query
    with pool as (
      select d.*,
             array(select unnest(d.interests) intersect select unnest(v_mine.interests)) as si,
             array(select unnest(d.languages) intersect select unnest(v_mine.languages)) as sl
      from public.thrivefold_dating_profiles d
      join public.thrivefold_profiles p on p.user_id = d.user_id and p.is_age_verified
      where d.user_id <> v_me
        and d.is_active
        and public.tf_dating_mutual(v_mine, d)
        and public.tf_meets_gate(d.user_id, 'dating')
        and not public.tf_is_restricted(d.user_id, 'social_restricted')
        and not public.tf_is_blocked_between(v_me, d.user_id)
        and not exists (
          select 1 from public.thrivefold_dating_conversations c
          where c.user_a = least(v_me, d.user_id) and c.user_b = greatest(v_me, d.user_id)
        )
    )
    select pool.user_id, coalesce(sp.pseudonym, 'Member'), pool.gender, pool.interests,
           (select string_agg(c.text, ' ' order by u.ord)
              from unnest(pool.prompt_chip_ids) with ordinality as u(chip_id, ord)
              join public.thrivefold_chip_catalog c on c.id = u.chip_id and c.is_active),
           pool.age_band, pool.intention, pool.pace, pool.languages,
           pool.si, pool.sl,
           (2 * coalesce(cardinality(pool.si), 0)
             + case when cardinality(pool.sl) > 0 then 3 else 0 end
             + case when pool.intention is not null and pool.intention = v_mine.intention then 3 else 0 end
             + case when pool.pace is not null and pool.pace = v_mine.pace then 1 else 0 end)::int as score
    from pool
    left join public.thrivefold_social_profiles sp on sp.user_id = pool.user_id
    order by 12 desc, pool.updated_at desc
    limit least(greatest(coalesce(p_limit, 20), 1), 50);
end;
$$;

-- First contact now also honours both people's age-band preferences.
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
     or not public.tf_dating_mutual(v_mine, v_theirs)
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

-- Report the other person in a conversation. The evidence is the last 20 chip messages (all
-- pre-approved text), so a moderator sees exactly what was sent. Optionally blocks too.
create or replace function public.tf_dating_report(p_conversation uuid, p_category text, p_block boolean default true)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_me uuid := (select auth.uid());
  v_conv public.thrivefold_dating_conversations%rowtype;
  v_other uuid;
  v_evidence text;
  v_id uuid;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_category not in ('harassment', 'pressure', 'underage', 'fake_profile', 'spam', 'other') then
    raise exception 'invalid_category';
  end if;
  select * into v_conv from public.thrivefold_dating_conversations where id = p_conversation;
  if not found or v_me not in (v_conv.user_a, v_conv.user_b) then raise exception 'conversation_unavailable'; end if;
  v_other := case when v_me = v_conv.user_a then v_conv.user_b else v_conv.user_a end;
  if (select count(*) from public.thrivefold_safety_reports
      where reporter_id = v_me and created_at >= now() - interval '1 day') >= 10 then
    raise exception 'slow_down';
  end if;
  select 'dating conversation ' || p_conversation::text || E'\n' ||
         coalesce(string_agg(case when m.sender_id = v_me then 'me: ' else 'them: ' end || m.body, E'\n' order by m.created_at), '')
    into v_evidence
    from (select * from public.thrivefold_dating_messages
           where conversation_id = p_conversation order by created_at desc limit 20) m;
  insert into public.thrivefold_safety_reports (reporter_id, target_id, category, evidence_summary)
  values (v_me, v_other, 'dating_' || p_category, v_evidence)
  returning id into v_id;
  if coalesce(p_block, true) then
    insert into public.thrivefold_blocks (user_id, blocked_user_id) values (v_me, v_other)
    on conflict do nothing;
    update public.thrivefold_dating_conversations
       set status = 'closed', closed_by = v_me
     where id = p_conversation and status = 'open';
  end if;
  return v_id;
end;
$$;

revoke all on function public.tf_dating_save_preferences(text, text[], text[], text, text) from public, anon;
revoke all on function public.tf_dating_mutual(public.thrivefold_dating_profiles, public.thrivefold_dating_profiles) from public, anon, authenticated;
revoke all on function public.tf_dating_candidates(int) from public, anon;
revoke all on function public.tf_dating_report(uuid, text, boolean) from public, anon;
grant execute on function public.tf_dating_save_preferences(text, text[], text[], text, text) to authenticated;
grant execute on function public.tf_dating_candidates(int) to authenticated;
grant execute on function public.tf_dating_report(uuid, text, boolean) to authenticated;
