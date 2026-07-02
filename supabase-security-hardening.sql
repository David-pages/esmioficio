-- EsMiOficio security hardening policies.
-- Run this in Supabase SQL Editor after assigning app_metadata.role = 'admin'
-- to the administrator account.

alter table if exists public.trade_requests enable row level security;
alter table if exists public.activity_events enable row level security;
alter table if exists public.analytics_events enable row level security;
alter table if exists public.client_contact_events enable row level security;
alter table if exists public.client_saved_professionals enable row level security;
alter table if exists public.service_requests enable row level security;
alter table if exists public.professionals enable row level security;
alter table if exists public.reviews enable row level security;

drop policy if exists "Only admins can update professionals" on public.professionals;
create policy "Only admins can update professionals"
on public.professionals
for update
to authenticated
using (coalesce(auth.jwt()->'app_metadata'->>'role', '') = 'admin')
with check (coalesce(auth.jwt()->'app_metadata'->>'role', '') = 'admin');

drop policy if exists "Cualquiera puede leer solicitudes aprobadas" on public.trade_requests;
create policy "Cualquiera puede leer solicitudes aprobadas"
on public.trade_requests
for select
using (status = 'APPROVED');

drop policy if exists "Usuarios autenticados pueden crear solicitudes" on public.trade_requests;
create policy "Usuarios autenticados pueden crear solicitudes"
on public.trade_requests
for insert
to authenticated
with check (true);

drop policy if exists "Solo insertar eventos de actividad" on public.activity_events;
create policy "Solo insertar eventos de actividad"
on public.activity_events
for insert
to authenticated
with check (true);

drop policy if exists "Solo insertar eventos de analytics" on public.analytics_events;
create policy "Solo insertar eventos de analytics"
on public.analytics_events
for insert
to authenticated
with check (true);

drop policy if exists "Solo insertar eventos de contacto" on public.client_contact_events;
create policy "Solo insertar eventos de contacto"
on public.client_contact_events
for insert
to authenticated
with check (client_id = auth.uid());

drop policy if exists "Clientes ven sus propios guardados" on public.client_saved_professionals;
create policy "Clientes ven sus propios guardados"
on public.client_saved_professionals
for select
to authenticated
using (client_id = auth.uid());

drop policy if exists "Clientes gestionan sus propios guardados" on public.client_saved_professionals;
create policy "Clientes gestionan sus propios guardados"
on public.client_saved_professionals
for all
to authenticated
using (client_id = auth.uid())
with check (client_id = auth.uid());

drop policy if exists "Limitar service_requests por hora" on public.service_requests;
create policy "Limitar service_requests por hora"
on public.service_requests
for insert
to authenticated
with check (
  client_id = auth.uid()
  and (
    select count(*)
    from public.service_requests sr
    where sr.client_id = auth.uid()
      and sr.professional_id = service_requests.professional_id
      and sr.created_at > now() - interval '1 hour'
  ) < 3
);

drop policy if exists "Authors or admins can delete reviews" on public.reviews;
create policy "Authors or admins can delete reviews"
on public.reviews
for delete
to authenticated
using (
  author_id = auth.uid()
  or coalesce(auth.jwt()->'app_metadata'->>'role', '') = 'admin'
);
