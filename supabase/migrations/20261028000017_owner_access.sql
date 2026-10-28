-- ============================================================================
-- Thrivefold migration 17: owner access. Accounts listed here see Beta Lab and developer tools
-- in release builds. The list is not readable or writable from the app; the app can only ask
-- "am I an owner?" for the signed-in account (tf_is_owner). Rows are added by the project owner
-- with the service role or SQL editor, never from the client.
-- ============================================================================

create table if not exists public.tf_owners (
  email text primary key check (email = lower(email)),
  note text,
  created_at timestamptz not null default now()
);
alter table public.tf_owners enable row level security;
revoke all on public.tf_owners from anon, authenticated;

-- Reads the signed-in user's own confirmed email from auth.users (not from token claims).
create or replace function public.tf_is_owner()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from auth.users u
    join public.tf_owners o on o.email = lower(u.email)
    where u.id = auth.uid() and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.tf_is_owner() from public, anon;
grant execute on function public.tf_is_owner() to authenticated;
