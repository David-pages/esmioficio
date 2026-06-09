-- EsMiOficio: tabla minima para metricas administrativas.
-- Ejecuta este SQL una vez en Supabase despues de las tablas base
-- professionals, service_requests y profiles.

create extension if not exists pgcrypto;

create table if not exists public.app_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.app_roles enable row level security;
grant select on public.app_roles to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_roles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins can read roles" on public.app_roles;
create policy "Admins can read roles"
on public.app_roles
for select
to authenticated
using (public.is_admin() or user_id = auth.uid());

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in (
    'profile_view',
    'whatsapp_click',
    'phone_click',
    'service_request_created',
    'service_marked_hired',
    'service_completed',
    'review_created',
    'professional_saved',
    'search_performed'
  )),
  user_id uuid references auth.users(id) on delete set null,
  professional_id uuid references public.professionals(id) on delete set null,
  service_request_id uuid references public.service_requests(id) on delete set null,
  city text,
  state text,
  trade text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;
grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;

drop policy if exists "Anyone can insert safe analytics events" on public.analytics_events;
create policy "Anyone can insert safe analytics events"
on public.analytics_events
for insert
to anon, authenticated
with check (user_id is null or user_id = auth.uid());

drop policy if exists "Admins can read analytics events" on public.analytics_events;
create policy "Admins can read analytics events"
on public.analytics_events
for select
to authenticated
using (public.is_admin());

create index if not exists analytics_events_created_at_idx
on public.analytics_events (created_at desc);

create index if not exists analytics_events_type_created_at_idx
on public.analytics_events (event_type, created_at desc);

create index if not exists analytics_events_professional_created_at_idx
on public.analytics_events (professional_id, created_at desc);

create index if not exists analytics_events_user_created_at_idx
on public.analytics_events (user_id, created_at desc);

create index if not exists analytics_events_city_trade_idx
on public.analytics_events (city, trade);

-- Para que un usuario de Supabase pueda leer metricas privadas desde el panel:
-- insert into public.app_roles (user_id, role)
-- values ('AQUI_UUID_DEL_USUARIO_ADMIN', 'admin')
-- on conflict (user_id) do update set role = excluded.role;
