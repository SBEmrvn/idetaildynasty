-- ════════════════════════════════════════════════════════════════════════════
-- Service & Pricing Management — lock the `services` table to admin-only writes
-- Run ONCE in Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement is idempotent.
--
-- What it does
--   1. Creates `admin_users`, a tiny allow-list of admin emails. It has RLS on
--      and no policies, so nobody can read or change it through the website
--      or API; only you, from the Supabase dashboard.
--   2. Creates `is_admin()`, which checks the logged-in user's email (from
--      their Supabase login token, which can't be forged) against that list.
--   3. Replaces every existing policy on `services` with:
--        • everyone (logged in or not) can READ active services
--        • admins can also read inactive ones
--        • only admins can INSERT / UPDATE / DELETE
--   4. Adds sanity checks so a price or surcharge can never be negative.
--
-- No existing service rows are changed.
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Admin allow-list ---------------------------------------------------------
create table if not exists public.admin_users (
  email      text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

insert into public.admin_users (email)
values ('bucaguelisa@gmail.com')
on conflict (email) do nothing;

-- 2. is_admin() ---------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 3. Row Level Security on services --------------------------------------------
alter table public.services enable row level security;

-- Remove whatever policies exist today (names unknown, may be permissive).
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'services'
  loop
    execute format('drop policy %I on public.services', p.policyname);
  end loop;
end $$;

create policy "services: public reads active, admins read all"
  on public.services for select
  to anon, authenticated
  using (active = true or public.is_admin());

create policy "services: admins insert"
  on public.services for insert
  to authenticated
  with check (public.is_admin());

create policy "services: admins update"
  on public.services for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "services: admins delete"
  on public.services for delete
  to authenticated
  using (public.is_admin());

-- 4. Data sanity --------------------------------------------------------------
alter table public.services alter column active set default true;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'services_price_non_negative') then
    alter table public.services add constraint services_price_non_negative check (price >= 0) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'services_suv_surcharge_non_negative') then
    alter table public.services add constraint services_suv_surcharge_non_negative check (suv_surcharge is null or suv_surcharge >= 0) not valid;
  end if;
end $$;

-- Realtime: make sure price changes are pushed to open browsers instantly.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'services'
  ) then
    alter publication supabase_realtime add table public.services;
  end if;
end $$;

-- ── Quick check (optional) ────────────────────────────────────────────────────
-- select policyname, cmd, roles from pg_policies where tablename = 'services';
-- select * from public.admin_users;
