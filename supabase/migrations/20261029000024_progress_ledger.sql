-- Thrivefold migration 24: keep the reward ledger itself (each entry has a unique key), so points,
-- level and streaks are rebuilt exactly on a new phone and two phones merge without double counting.
alter table public.thrivefold_progress
  add column if not exists ledger jsonb not null default '[]'::jsonb
    check (jsonb_typeof(ledger) = 'array' and jsonb_array_length(ledger) <= 20000),
  add column if not exists completed_checkpoints text[] not null default '{}'
    check (cardinality(completed_checkpoints) <= 500);
