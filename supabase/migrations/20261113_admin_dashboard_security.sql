-- ════════════════════════════════════════════════════════════════════════════
-- Admin dashboard: editable website + admin-only security
-- Run ONCE in Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement is idempotent. No existing rows are changed.
--
-- What it does
--   1. `admin_users`: a private allow-list of admin emails (not readable or
--      writable from the website; manage it only from the Supabase dashboard).
--   2. `is_admin()`: true when the logged-in user's email (from their Supabase
--      login token, which can't be forged) is on that list.
--   3. `settings.content`: a new jsonb column holding the website text edited
--      in Admin → Website text. Empty = the original wording.
--   4. Row Level Security on the tables the admin edits:
--        services  anyone reads active ones · admins read all and write
--        promos    anyone reads active ones · admins read all and write
--        gallery   anyone reads              · admins write
--        settings  anyone reads              · admins write
--      Existing policies on these four tables are replaced. Tables customers
--      write to (bookings, reviews, contact_messages, profiles) are NOT touched.
--   5. Non-negative price checks, and realtime on these tables so edits show
--      on open pages instantly.
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

-- 3. Editable website text -----------------------------------------------------
alter table public.settings add column if not exists content jsonb not null default '{}'::jsonb;

-- 4. Row Level Security ----------------------------------------------------------
-- Helper: drop every existing policy on a table (names unknown, may be permissive).
create or replace function pg_temp.reset_policies(t text) returns void language plpgsql as $$
declare p record;
begin
  execute format('alter table public.%I enable row level security', t);
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
    execute format('drop policy %I on public.%I', p.policyname, t);
  end loop;
end $$;

select pg_temp.reset_policies('services');
select pg_temp.reset_policies('promos');
select pg_temp.reset_policies('gallery');
select pg_temp.reset_policies('settings');

-- services
create policy "services: read active, admins read all" on public.services
  for select to anon, authenticated using (active = true or public.is_admin());
create policy "services: admins insert" on public.services
  for insert to authenticated with check (public.is_admin());
create policy "services: admins update" on public.services
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "services: admins delete" on public.services
  for delete to authenticated using (public.is_admin());

-- promos
create policy "promos: read active, admins read all" on public.promos
  for select to anon, authenticated using (active = true or public.is_admin());
create policy "promos: admins insert" on public.promos
  for insert to authenticated with check (public.is_admin());
create policy "promos: admins update" on public.promos
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "promos: admins delete" on public.promos
  for delete to authenticated using (public.is_admin());

-- gallery
create policy "gallery: public read" on public.gallery
  for select to anon, authenticated using (true);
create policy "gallery: admins insert" on public.gallery
  for insert to authenticated with check (public.is_admin());
create policy "gallery: admins update" on public.gallery
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "gallery: admins delete" on public.gallery
  for delete to authenticated using (public.is_admin());

-- settings (contact details, feature switches, website text)
create policy "settings: public read" on public.settings
  for select to anon, authenticated using (true);
create policy "settings: admins insert" on public.settings
  for insert to authenticated with check (public.is_admin());
create policy "settings: admins update" on public.settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "settings: admins delete" on public.settings
  for delete to authenticated using (public.is_admin());

-- 5. Data sanity + realtime -------------------------------------------------------
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

do $$
declare t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['services', 'promos', 'gallery', 'settings'] loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
      ) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end $$;

-- ── Quick check (optional) ──────────────────────────────────────────────────────
-- select tablename, policyname, cmd from pg_policies
--   where tablename in ('services','promos','gallery','settings') order by 1, 2;
