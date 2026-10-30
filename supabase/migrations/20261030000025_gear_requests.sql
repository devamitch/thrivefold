-- Thrivefold migration 25: real workout gear for gems. Limited stock, one open request per person
-- per item, the person's own delivery details visible only to them (and the owner via service
-- role). The owner reviews each request against the person's progress before shipping.
create table if not exists public.thrivefold_gear_stock (
  item_id text primary key check (char_length(item_id) between 3 and 60),
  remaining integer not null default 0 check (remaining between 0 and 100000)
);

alter table public.thrivefold_gear_stock enable row level security;
revoke all on public.thrivefold_gear_stock from anon;
grant select on public.thrivefold_gear_stock to authenticated;
create policy "gear stock readable" on public.thrivefold_gear_stock for select to authenticated using (true);

create table if not exists public.thrivefold_gear_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  item_id text not null references public.thrivefold_gear_stock(item_id),
  gems integer not null check (gems >= 10000),
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text not null check (char_length(phone) between 6 and 20),
  address text not null check (char_length(address) between 10 and 500),
  status text not null default 'requested' check (status in ('requested', 'approved', 'shipped', 'delivered', 'declined')),
  created_at timestamptz not null default now()
);

create unique index if not exists thrivefold_gear_one_open_request
  on public.thrivefold_gear_requests (user_id, item_id)
  where status in ('requested', 'approved', 'shipped');

alter table public.thrivefold_gear_requests enable row level security;
revoke all on public.thrivefold_gear_requests from anon;
grant select, insert on public.thrivefold_gear_requests to authenticated;
create policy "own gear requests readable" on public.thrivefold_gear_requests
  for select to authenticated using (user_id = (select auth.uid()));
create policy "own gear requests insertable" on public.thrivefold_gear_requests
  for insert to authenticated with check (user_id = (select auth.uid()) and status = 'requested');

-- Takes one from stock when a request is made; refuses when none is left.
create or replace function public.tf_take_gear_stock() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.thrivefold_gear_stock set remaining = remaining - 1
   where item_id = new.item_id and remaining > 0;
  if not found then
    raise exception 'out_of_stock' using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists tf_gear_take_stock on public.thrivefold_gear_requests;
create trigger tf_gear_take_stock before insert on public.thrivefold_gear_requests
  for each row execute function public.tf_take_gear_stock();

insert into public.thrivefold_gear_stock (item_id, remaining) values
  ('gear_pushup_bars', 0), ('gear_gyroball', 0), ('gear_dumbbells', 0), ('gear_barbell', 0), ('gear_stationery', 0)
on conflict (item_id) do nothing;
