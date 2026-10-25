-- ============================================================================
-- Thrivefold migration 15: cloud AI usage ledger (spec: cloud AI optional, consent-controlled,
-- cost-capped). The ai-chat function counts requests per person per day with the service role;
-- nobody can read or write this table from the app. No message content is stored.
-- ============================================================================

create table if not exists public.thrivefold_ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  requests int not null default 0,
  provider text,
  primary key (user_id, day)
);
alter table public.thrivefold_ai_usage enable row level security;
revoke all on public.thrivefold_ai_usage from anon, authenticated;

-- Atomically counts one request and returns the new total (called by the edge function only).
create or replace function public.tf_ai_count(p_user uuid, p_provider text)
returns int language sql security definer set search_path = '' as $$
  insert into public.thrivefold_ai_usage (user_id, day, requests, provider)
  values (p_user, current_date, 1, p_provider)
  on conflict (user_id, day) do update
    set requests = public.thrivefold_ai_usage.requests + 1, provider = excluded.provider
  returning requests;
$$;
revoke all on function public.tf_ai_count(uuid, text) from public, anon, authenticated;
