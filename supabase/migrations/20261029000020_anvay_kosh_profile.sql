-- Thrivefold migration 20: Anvay Kosh profile domains on the person's own personal profile.
-- Everything here is typed in or confirmed by the person (provenance per field in `field_sources`);
-- nothing is inferred. Food restrictions and allergies are kept separate from preferences.

alter table public.thrivefold_personal_profiles
  add column if not exists preferred_name text check (char_length(preferred_name) <= 60),
  add column if not exists phone text check (phone ~ '^\+?[0-9 ()-]{6,20}$'),
  add column if not exists languages text[] not null default '{}' check (cardinality(languages) <= 10),
  add column if not exists food_restrictions text[] not null default '{}' check (cardinality(food_restrictions) <= 20),
  add column if not exists allergies text[] not null default '{}' check (cardinality(allergies) <= 20),
  add column if not exists cuisines text[] not null default '{}' check (cardinality(cuisines) <= 20),
  add column if not exists food_dislikes text[] not null default '{}' check (cardinality(food_dislikes) <= 30),
  add column if not exists interests text[] not null default '{}' check (cardinality(interests) <= 30),
  add column if not exists skills text[] not null default '{}' check (cardinality(skills) <= 30),
  add column if not exists career_goal text check (char_length(career_goal) <= 300),
  add column if not exists accessibility jsonb not null default '{}'::jsonb,
  add column if not exists field_sources jsonb not null default '{}'::jsonb;

-- Emergency contacts the person adds themselves, for one-tap calling from the app.
create table if not exists public.anvay_emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  phone text not null check (phone ~ '^\+?[0-9 ()-]{6,20}$'),
  relation text check (char_length(relation) <= 40),
  created_at timestamptz not null default now()
);
create index if not exists anvay_emergency_contacts_user on public.anvay_emergency_contacts (user_id);

alter table public.anvay_emergency_contacts enable row level security;
revoke all on public.anvay_emergency_contacts from anon;
grant select, insert, update, delete on public.anvay_emergency_contacts to authenticated;

create policy "own emergency contacts readable" on public.anvay_emergency_contacts
  for select to authenticated using (user_id = (select auth.uid()));
create policy "own emergency contacts insertable" on public.anvay_emergency_contacts
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and (select count(*) from public.anvay_emergency_contacts c where c.user_id = (select auth.uid())) < 5
  );
create policy "own emergency contacts updatable" on public.anvay_emergency_contacts
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own emergency contacts deletable" on public.anvay_emergency_contacts
  for delete to authenticated using (user_id = (select auth.uid()));
