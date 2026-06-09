-- EsMiOficio client dashboard support
-- Run in Supabase SQL Editor after backing up your project.

alter table if exists public.profiles
  add column if not exists city text,
  add column if not exists phone text;

-- Professionals saved by clients for later review.
create table if not exists public.client_saved_professionals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (client_id, professional_id)
);

alter table public.client_saved_professionals enable row level security;
grant select, insert, delete on public.client_saved_professionals to authenticated;

drop policy if exists "Clients read own saved professionals" on public.client_saved_professionals;
create policy "Clients read own saved professionals"
on public.client_saved_professionals
for select
to authenticated
using (client_id = auth.uid() or public.is_admin());

drop policy if exists "Clients save professionals" on public.client_saved_professionals;
create policy "Clients save professionals"
on public.client_saved_professionals
for insert
to authenticated
with check (client_id = auth.uid());

drop policy if exists "Clients remove own saved professionals" on public.client_saved_professionals;
create policy "Clients remove own saved professionals"
on public.client_saved_professionals
for delete
to authenticated
using (client_id = auth.uid() or public.is_admin());

create index if not exists client_saved_professionals_client_created_at_idx
on public.client_saved_professionals (client_id, created_at desc);

-- Private contact history for client dashboards.
create table if not exists public.client_contact_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  professional_id uuid references public.professionals(id) on delete set null,
  contact_method text not null default 'contact' check (contact_method in ('whatsapp', 'phone', 'contact')),
  trade text,
  city text,
  created_at timestamptz not null default now()
);

alter table public.client_contact_events enable row level security;
grant select, insert on public.client_contact_events to authenticated;

drop policy if exists "Clients read own contact history" on public.client_contact_events;
create policy "Clients read own contact history"
on public.client_contact_events
for select
to authenticated
using (client_id = auth.uid() or public.is_admin());

drop policy if exists "Clients insert own contact history" on public.client_contact_events;
create policy "Clients insert own contact history"
on public.client_contact_events
for insert
to authenticated
with check (client_id = auth.uid());

create index if not exists client_contact_events_client_created_at_idx
on public.client_contact_events (client_id, created_at desc);

-- Optional fallback: allow clients to read their own raw contact activity.
alter table if exists public.activity_events
  add column if not exists contact_method text check (contact_method is null or contact_method in ('whatsapp', 'phone', 'contact'));

drop policy if exists "Users can read own activity" on public.activity_events;
create policy "Users can read own activity"
on public.activity_events
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create index if not exists activity_events_user_created_at_idx
on public.activity_events (user_id, created_at desc);
