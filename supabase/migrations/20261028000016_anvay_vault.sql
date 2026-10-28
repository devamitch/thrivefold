-- ============================================================================
-- Thrivefold migration 16: Anvay Vault (AnvayKosh shared profile), minimal and owner-only.
-- Holds only basic, non-sensitive profile facts a person chooses to share across AnvayKosh apps.
-- Never health, cycle, location, religion or other sensitive data. Each field records which app
-- supplied it (`sources`). Apps merge by filling empty fields only; nothing is overwritten.
-- ============================================================================

create table if not exists public.anvay_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  avatar_seed text check (char_length(avatar_seed) <= 60),
  photo_url text check (char_length(photo_url) <= 500),
  locale text check (char_length(locale) <= 20),
  time_zone text check (char_length(time_zone) <= 60),
  -- {"display_name": {"app": "com.amit.thrivefold", "at": "2026-10-28T10:00:00Z"}, ...}
  sources jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.anvay_profiles enable row level security;
revoke all on public.anvay_profiles from anon;

create policy "owner reads own anvay profile"
  on public.anvay_profiles for select to authenticated
  using (user_id = (select auth.uid()));

create policy "owner creates own anvay profile"
  on public.anvay_profiles for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "owner updates own anvay profile"
  on public.anvay_profiles for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "owner deletes own anvay profile"
  on public.anvay_profiles for delete to authenticated
  using (user_id = (select auth.uid()));
