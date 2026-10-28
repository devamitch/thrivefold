-- Thrivefold migration 19: the person's own personal profile (separate from the community-facing
-- thrivefold_profiles), so signing in again on any phone
-- restores it instead of asking for the birthday and space again.
-- Owner-only. Holds what the person typed or confirmed: birthday (self-declared, never age
-- verification), chosen space, display name, onboarding answers that are not sensitive, and
-- language. Never religion or observances, health records, location or anything inferred.

create table if not exists public.thrivefold_personal_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  birth_date date check (birth_date between date '1900-01-01' and current_date),
  experience text check (experience in ('women_health', 'men_health', 'pride_wellbeing')),
  onboarded boolean not null default false,
  goals text[] not null default '{}' check (cardinality(goals) <= 20),
  constraints text[] not null default '{}' check (cardinality(constraints) <= 20),
  routine_minutes smallint check (routine_minutes in (5, 10, 20)),
  diet text check (char_length(diet) <= 40),
  language text check (char_length(language) <= 20),
  updated_at timestamptz not null default now()
);

alter table public.thrivefold_personal_profiles enable row level security;
revoke all on public.thrivefold_personal_profiles from anon;
grant select, insert, update, delete on public.thrivefold_personal_profiles to authenticated;

create policy "own personal profile readable" on public.thrivefold_personal_profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy "own personal profile insertable" on public.thrivefold_personal_profiles
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own personal profile updatable" on public.thrivefold_personal_profiles
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own personal profile deletable" on public.thrivefold_personal_profiles
  for delete to authenticated using (user_id = (select auth.uid()));
