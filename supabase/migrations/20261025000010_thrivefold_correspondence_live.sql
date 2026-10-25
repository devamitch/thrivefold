-- ============================================================================
-- Thrivefold migration 10: correspondence goes live end to end
--
-- * Seeds the approved chip catalogue. tf_send_letter only accepts chips that exist here, and
--   until now production had none (seed.sql is local-only), so every letter was refused.
--   Mirrors src/domain/chips/catalog.ts; ids are stable, text updates in place.
-- * tf_intro_candidates(): who a verified adult may write a first letter to. Only verified
--   adults who accept introductions, never the caller, blocked or socially restricted people.
--   Returns pseudonymous fields only. Stated religion or other traits play no part.
-- ============================================================================

insert into public.thrivefold_chip_catalog (id, category, text, subtext, risk_class, is_active, version)
values
  ('intro_01', 'introduction', 'Hello! I hope you are having a peaceful and calm day.', 'Friendly opening', 'safe', true, '2026.10.16-v1'),
  ('intro_02', 'introduction', 'Warm greetings from my corner of the world. Nice to connect with you.', 'Thoughtful hello', 'safe', true, '2026.10.16-v1'),
  ('intro_03', 'introduction', 'I noticed our shared interest in sustainable wellness and mindful living.', 'Shared resonance', 'safe', true, '2026.10.16-v1'),
  ('interest_01', 'interests', 'I enjoy morning nature walks, warm tea, and quiet reading sessions.', 'Calm hobbies', 'safe', true, '2026.10.16-v1'),
  ('interest_02', 'interests', 'Gardening, cooking nourishing meals, and gentle mobility stretching keep me grounded.', 'Self-care practices', 'safe', true, '2026.10.16-v1'),
  ('interest_03', 'interests', 'Music, creative reflection, and ambient soundscapes are my daily recharge.', 'Creative outlets', 'safe', true, '2026.10.16-v1'),
  ('checkin_01', 'daily_checkin', 'Today feels gentle and steady. Taking things one step at a time.', 'Balanced state', 'safe', true, '2026.10.16-v1'),
  ('checkin_02', 'daily_checkin', 'Work was quite busy today, but I made time for an evening breath break.', 'Decompressing', 'safe', true, '2026.10.16-v1'),
  ('checkin_03', 'daily_checkin', 'Resting today to replenish energy and reset my focus.', 'Rest day', 'safe', true, '2026.10.16-v1'),
  ('wellbeing_01', 'wellbeing', 'Remember to be kind and patient with yourself on difficult days.', 'Gentle reminder', 'safe', true, '2026.10.16-v1'),
  ('wellbeing_02', 'wellbeing', 'Celebrating the small daily wins—even drinking water and taking deep breaths counts.', 'Progress support', 'safe', true, '2026.10.16-v1'),
  ('wellbeing_03', 'wellbeing', 'Sending peaceful thoughts and strength for whatever challenges you are navigating.', 'Supportive solidarity', 'safe', true, '2026.10.16-v1'),
  ('listening_01', 'listening', 'I appreciate your reflection. Thank you for sharing your thoughts with me.', 'Attentive reply', 'safe', true, '2026.10.16-v1'),
  ('listening_02', 'listening', 'It takes courage to acknowledge life transitions. You are doing well.', 'Empathetic presence', 'safe', true, '2026.10.16-v1'),
  ('lang_01', 'language_culture', 'I love learning about different cultural traditions and festive celebrations.', 'Cultural appreciation', 'safe', true, '2026.10.16-v1'),
  ('lang_02', 'language_culture', 'The changing seasons here remind me of the beauty of continuous renewal.', 'Seasonal reflection', 'safe', true, '2026.10.16-v1'),
  ('comm_01', 'communication_style', 'I prefer slow, thoughtful letters rather than fast messaging. Take your time replying!', 'No reply pressure', 'safe', true, '2026.10.16-v1'),
  ('comm_02', 'communication_style', 'I check my correspondence once a day during quiet hours.', 'Pacing schedule', 'safe', true, '2026.10.16-v1'),
  ('gratitude_01', 'gratitude', 'Thank you for your kind letter and warm thoughts. It brightened my day.', 'Heartfelt thanks', 'safe', true, '2026.10.16-v1'),
  ('gratitude_02', 'gratitude', 'I value this quiet, respectful space we share on Thrivefold.', 'Respectful connection', 'safe', true, '2026.10.16-v1'),
  ('boundary_01', 'boundaries', 'Thank you for reaching out, but I am focusing solely on my personal health routines right now.', 'Polite decline', 'boundary', true, '2026.10.16-v1'),
  ('boundary_02', 'boundaries', 'I prefer to keep our communication strictly within our shared wellness topics.', 'Scope boundary', 'boundary', true, '2026.10.16-v1'),
  ('close_01', 'close_conversation', 'Wishing you the very best on your wellness journey. Take good care!', 'Warm closing', 'safe', true, '2026.10.16-v1')
on conflict (id) do update
  set category = excluded.category,
      text = excluded.text,
      subtext = excluded.subtext,
      risk_class = excluded.risk_class,
      is_active = excluded.is_active,
      version = excluded.version;

create or replace function public.tf_intro_candidates(p_limit int default 20)
returns table (user_id uuid, pseudonym text, coarse_region text, languages text[], interests text[])
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from public.thrivefold_profiles me where me.user_id = v_me and me.is_age_verified) then
    raise exception 'age_verification_required';
  end if;
  if public.tf_is_restricted(v_me, 'social_restricted') then raise exception 'account_restricted'; end if;

  return query
    select sp.user_id, sp.pseudonym, sp.coarse_region, sp.languages, sp.interests
    from public.thrivefold_social_profiles sp
    join public.thrivefold_profiles p on p.user_id = sp.user_id
    where sp.user_id <> v_me
      and sp.accepts_introductions
      and p.is_age_verified
      and not public.tf_is_restricted(sp.user_id, 'social_restricted')
      and not public.tf_is_blocked_between(v_me, sp.user_id)
      -- people already written to are in the inbox/outbox, not discovery
      and not exists (
        select 1 from public.thrivefold_letters l
        where (l.sender_id = v_me and l.recipient_id = sp.user_id)
           or (l.sender_id = sp.user_id and l.recipient_id = v_me)
      )
    order by sp.created_at desc
    limit least(greatest(coalesce(p_limit, 20), 1), 50);
end;
$$;

revoke all on function public.tf_intro_candidates(int) from public;
grant execute on function public.tf_intro_candidates(int) to authenticated;
