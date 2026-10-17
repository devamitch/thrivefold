-- ============================================================================
-- Thrivefold: Seed Data for Local Development & Testing
-- ============================================================================

INSERT INTO public.thrivefold_chip_catalog (id, category, text, subtext, risk_class, is_active, version)
VALUES
  ('intro_01', 'introduction', 'Hello! I hope you are having a peaceful and calm day.', 'Friendly opening', 'safe', true, '2026.10.16-v1'),
  ('intro_02', 'introduction', 'Warm greetings from my corner of the world. Nice to connect with you.', 'Thoughtful hello', 'safe', true, '2026.10.16-v1'),
  ('interest_01', 'interests', 'I enjoy morning nature walks, warm tea, and quiet reading sessions.', 'Calm hobbies', 'safe', true, '2026.10.16-v1'),
  ('interest_02', 'interests', 'Gardening, cooking nourishing meals, and gentle mobility stretching keep me grounded.', 'Self-care practices', 'safe', true, '2026.10.16-v1'),
  ('daily_01', 'daily_checkin', 'Today feels gentle and steady. Taking things one step at a time.', 'Balanced state', 'safe', true, '2026.10.16-v1'),
  ('wellbeing_01', 'wellbeing', 'Remember to be kind and patient with yourself on difficult days.', 'Gentle reminder', 'safe', true, '2026.10.16-v1'),
  ('boundary_01', 'boundaries', 'Thank you for reaching out, but I am focusing solely on my personal health routines right now.', 'Polite decline', 'boundary', true, '2026.10.16-v1'),
  ('close_01', 'close_conversation', 'Wishing you the very best on your wellness journey. Take good care!', 'Warm closing', 'safe', true, '2026.10.16-v1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.thrivefold_communities (id, name, type, purpose, is_private)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Harmony Cycle & Hormone Circle', 'women_wellbeing', 'Phase-based nutrition and gentle cycle support.', true),
  ('c2222222-2222-2222-2222-222222222222', 'Mindful Men’s Mobility Circle', 'men_wellbeing', 'Daily spine stretching and desk worker recovery.', true),
  ('c3333333-3333-3333-3333-333333333333', 'Rainbow Calm Peer Support', 'pride_wellbeing', 'Affirmative meditation and mindful listening.', true)
ON CONFLICT (id) DO NOTHING;
