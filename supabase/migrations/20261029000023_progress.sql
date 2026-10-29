-- Thrivefold migration 23: the person's own points and level, so reinstalling or signing in on a
-- new phone keeps their progress. Owner-only counters; no health data.
create table if not exists public.thrivefold_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0 check (xp between 0 and 10000000),
  level smallint not null default 1 check (level between 1 and 1000),
  diamonds integer not null default 0 check (diamonds between 0 and 1000000),
  streak smallint not null default 0 check (streak between 0 and 10000),
  quests_completed integer not null default 0 check (quests_completed between 0 and 1000000),
  achievements text[] not null default '{}' check (cardinality(achievements) <= 500),
  updated_at timestamptz not null default now()
);

alter table public.thrivefold_progress enable row level security;
revoke all on public.thrivefold_progress from anon;
grant select, insert, update, delete on public.thrivefold_progress to authenticated;

create policy "own progress readable" on public.thrivefold_progress
  for select to authenticated using (user_id = (select auth.uid()));
create policy "own progress insertable" on public.thrivefold_progress
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own progress updatable" on public.thrivefold_progress
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own progress deletable" on public.thrivefold_progress
  for delete to authenticated using (user_id = (select auth.uid()));
