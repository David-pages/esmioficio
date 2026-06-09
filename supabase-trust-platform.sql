-- EsMiOficio trust platform upgrade
-- Run in Supabase SQL Editor after backing up your project.

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

drop policy if exists "Admins can read roles" on public.app_roles;
create policy "Admins can read roles"
on public.app_roles
for select
to authenticated
using (public.is_admin() or user_id = auth.uid());

alter table if exists public.profiles enable row level security;
grant select, insert, update on public.profiles to authenticated;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid() or public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- Professional profile 2.0 fields
alter table public.professionals
  add column if not exists response_time_minutes integer check (response_time_minutes is null or response_time_minutes > 0),
  add column if not exists coverage_zones text[] not null default '{}',
  add column if not exists services text[] not null default '{}',
  add column if not exists starting_price numeric(12,2) check (starting_price is null or starting_price >= 0),
  add column if not exists last_active_at timestamptz,
  add column if not exists jobs_count integer not null default 0 check (jobs_count >= 0),
  add column if not exists recommendations_count integer not null default 0 check (recommendations_count >= 0),
  add column if not exists trust_status text not null default 'green' check (trust_status in ('green', 'yellow', 'red')),
  add column if not exists verification_level text not null default 'none' check (verification_level in ('none', 'identity', 'documents', 'recommended', 'verified'));

create or replace view public.professionals_public as
select
  id,
  name,
  trade,
  location,
  municipality,
  state,
  rating,
  reviews_count,
  image_url,
  cover_image_url,
  portfolio_images,
  verified,
  description,
  years_experience,
  last_sensitive_update,
  response_time_minutes,
  coverage_zones,
  services,
  starting_price,
  last_active_at,
  jobs_count,
  recommendations_count,
  trust_status,
  verification_level
from public.professionals;

grant select on public.professionals_public to anon, authenticated;

alter table public.professionals enable row level security;
revoke select on public.professionals from anon;
grant select on public.professionals to authenticated;
grant update on public.professionals to authenticated;

drop policy if exists "Professionals can read own full profile" on public.professionals;
create policy "Professionals can read own full profile"
on public.professionals
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Professionals can update own profile" on public.professionals;
create policy "Professionals can update own profile"
on public.professionals
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create or replace function public.guard_professional_sensitive_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.trust_status is distinct from old.trust_status
    or new.verification_level is distinct from old.verification_level
    or new.recommendations_count is distinct from old.recommendations_count
    or new.jobs_count is distinct from old.jobs_count then
    raise exception 'Only admins can update trust, verification, jobs, and recommendation counters.';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_professional_sensitive_fields on public.professionals;
create trigger guard_professional_sensitive_fields
before update on public.professionals
for each row execute function public.guard_professional_sensitive_fields();

drop function if exists public.get_professional_contact(uuid);
create function public.get_professional_contact(p_professional_id uuid)
returns table(phone text)
language sql
stable
security definer
set search_path = public
as $$
  select p.phone
  from public.professionals p
  where p.id = p_professional_id
    and auth.uid() is not null;
$$;

grant execute on function public.get_professional_contact(uuid) to authenticated;

-- Recent works
create table if not exists public.recent_works (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  title text not null,
  description text,
  image_urls text[] not null default '{}',
  before_image_urls text[] not null default '{}',
  after_image_urls text[] not null default '{}',
  zone text,
  city text,
  service_type text,
  approximate_date text,
  created_at timestamptz not null default now()
);

alter table public.recent_works enable row level security;
grant select on public.recent_works to anon, authenticated;
grant insert, update, delete on public.recent_works to authenticated;

drop policy if exists "Recent works are public" on public.recent_works;
create policy "Recent works are public"
on public.recent_works
for select
using (true);

drop policy if exists "Professionals manage own recent works" on public.recent_works;
create policy "Professionals manage own recent works"
on public.recent_works
for all
to authenticated
using (professional_id = auth.uid() or public.is_admin())
with check (professional_id = auth.uid() or public.is_admin());

create index if not exists recent_works_professional_id_created_at_idx
on public.recent_works (professional_id, created_at desc);

-- Activity feed
create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('contact_attempt', 'contact_unlocked', 'profile_view', 'search_performed', 'recommendation_created')),
  user_id uuid references auth.users(id) on delete set null,
  professional_id uuid references public.professionals(id) on delete set null,
  city text,
  zone text,
  trade text,
  created_at timestamptz not null default now()
);

alter table public.activity_events enable row level security;
grant insert on public.activity_events to anon, authenticated;
grant select on public.activity_events to authenticated;

drop policy if exists "Anyone can add anonymous activity" on public.activity_events;
create policy "Anyone can add anonymous activity"
on public.activity_events
for insert
to anon, authenticated
with check (user_id is null or user_id = auth.uid());

drop policy if exists "Admins can read raw activity" on public.activity_events;
create policy "Admins can read raw activity"
on public.activity_events
for select
to authenticated
using (public.is_admin());

create or replace view public.activity_events_public as
select
  id,
  type,
  professional_id,
  city,
  zone,
  trade,
  created_at
from public.activity_events
order by created_at desc;

grant select on public.activity_events_public to anon, authenticated;

create index if not exists activity_events_created_at_idx on public.activity_events (created_at desc);
create index if not exists activity_events_city_idx on public.activity_events (city);
create index if not exists activity_events_type_idx on public.activity_events (type);
create index if not exists activity_events_professional_id_idx on public.activity_events (professional_id);

-- Service requests and quotes
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  client_name text not null,
  professional_name text,
  trade text,
  details text,
  status text not null default 'PENDING' check (status in ('PENDING', 'QUOTED', 'CONFIRMED', 'COMPLETED')),
  quote_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.service_requests
  add column if not exists client_name text,
  add column if not exists professional_name text,
  add column if not exists trade text,
  add column if not exists details text,
  add column if not exists status text not null default 'PENDING',
  add column if not exists quote_amount numeric(12,2) not null default 0,
  add column if not exists created_at timestamptz not null default now();

alter table public.service_requests enable row level security;
grant select, insert, update on public.service_requests to authenticated;

drop policy if exists "Clients create own service requests" on public.service_requests;
create policy "Clients create own service requests"
on public.service_requests
for insert
to authenticated
with check (
  client_id = auth.uid()
  and status in ('PENDING', 'COMPLETED')
);

drop policy if exists "Parties read service requests" on public.service_requests;
create policy "Parties read service requests"
on public.service_requests
for select
to authenticated
using (
  client_id = auth.uid()
  or professional_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "Parties update service requests" on public.service_requests;
create policy "Parties update service requests"
on public.service_requests
for update
to authenticated
using (
  client_id = auth.uid()
  or professional_id = auth.uid()
  or public.is_admin()
)
with check (
  client_id = auth.uid()
  or professional_id = auth.uid()
  or public.is_admin()
);

create index if not exists service_requests_client_professional_status_idx on public.service_requests (client_id, professional_id, status);
create index if not exists service_requests_professional_created_at_idx on public.service_requests (professional_id, created_at desc);

-- Reports
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in (
    'Trabajo inconcluso',
    'Desacuerdo en precio',
    'Falta de respuesta',
    'Problema con tiempos de entrega',
    'Problema con calidad del servicio',
    'Otro'
  )),
  description text not null,
  evidence_urls text[] not null default '{}',
  professional_response text,
  status text not null default 'pending' check (status in ('pending', 'under_review', 'resolved', 'dismissed', 'serious')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.reports enable row level security;
grant select, insert, update on public.reports to authenticated;

drop policy if exists "Clients can create own reports" on public.reports;
create policy "Clients can create own reports"
on public.reports
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status = 'pending'
  and description !~* '(estafador|ratero|fraudulento)'
);

drop policy if exists "Clients can read own reports" on public.reports;
create policy "Clients can read own reports"
on public.reports
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Professionals can respond to reports" on public.reports;
create policy "Professionals can respond to reports"
on public.reports
for update
to authenticated
using (professional_id = auth.uid() or public.is_admin())
with check (professional_id = auth.uid() or public.is_admin());

create or replace view public.professional_reports_safe as
select
  r.id,
  r.professional_id,
  r.reason,
  r.description,
  r.evidence_urls,
  r.professional_response,
  r.status,
  r.created_at,
  r.resolved_at
from public.reports r
where r.professional_id = auth.uid()
   or public.is_admin();

grant select on public.professional_reports_safe to authenticated;

create or replace function public.guard_report_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.user_id is distinct from old.user_id
    or new.professional_id is distinct from old.professional_id
    or new.reason is distinct from old.reason
    or new.description is distinct from old.description
    or new.evidence_urls is distinct from old.evidence_urls
    or new.created_at is distinct from old.created_at
    or new.status is distinct from old.status
    or new.resolved_at is distinct from old.resolved_at then
    raise exception 'Only admins can change report ownership, status, or resolution.';
  end if;

  if new.description ~* '(estafador|ratero|fraudulento)' then
    raise exception 'Use neutral language in reports.';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_report_admin_fields on public.reports;
create trigger guard_report_admin_fields
before update on public.reports
for each row execute function public.guard_report_admin_fields();

create index if not exists reports_professional_id_created_at_idx on public.reports (professional_id, created_at desc);
create index if not exists reports_user_id_created_at_idx on public.reports (user_id, created_at desc);
create index if not exists reports_status_idx on public.reports (status);

create or replace view public.professionals_public as
select
  p.id,
  p.name,
  p.trade,
  p.location,
  p.municipality,
  p.state,
  p.rating,
  p.reviews_count,
  p.image_url,
  p.cover_image_url,
  p.portfolio_images,
  p.verified,
  p.description,
  p.years_experience,
  p.last_sensitive_update,
  p.response_time_minutes,
  p.coverage_zones,
  p.services,
  p.starting_price,
  p.last_active_at,
  p.jobs_count,
  p.recommendations_count,
  case
    when p.trust_status = 'red'
      or exists (
        select 1 from public.reports r
        where r.professional_id = p.id
          and r.status = 'serious'
      ) then 'red'
    when p.trust_status = 'yellow'
      or exists (
        select 1 from public.reports r
        where r.professional_id = p.id
          and r.status in ('pending', 'under_review')
      ) then 'yellow'
    else 'green'
  end as trust_status,
  p.verification_level
from public.professionals p;

grant select on public.professionals_public to anon, authenticated;

-- Mediation
create table if not exists public.mediation_cases (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade,
  report_id uuid references public.reports(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'waiting_professional', 'waiting_client', 'resolved', 'unresolved', 'closed')),
  client_message text not null,
  professional_response text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

alter table public.mediation_cases enable row level security;
grant select, insert, update on public.mediation_cases to authenticated;

drop policy if exists "Clients create own mediations" on public.mediation_cases;
create policy "Clients create own mediations"
on public.mediation_cases
for insert
to authenticated
with check (
  client_id = auth.uid()
  and status = 'open'
  and admin_notes is null
  and closed_at is null
  and client_message !~* '(estafador|ratero|fraudulento)'
);

drop policy if exists "Clients read own mediations" on public.mediation_cases;
create policy "Clients read own mediations"
on public.mediation_cases
for select
to authenticated
using (client_id = auth.uid() or public.is_admin());

drop policy if exists "Professionals respond to mediations" on public.mediation_cases;
create policy "Professionals respond to mediations"
on public.mediation_cases
for update
to authenticated
using (professional_id = auth.uid() or public.is_admin())
with check (professional_id = auth.uid() or public.is_admin());

create or replace view public.professional_mediations_safe as
select
  id,
  professional_id,
  report_id,
  status,
  client_message,
  professional_response,
  created_at,
  updated_at,
  closed_at
from public.mediation_cases
where professional_id = auth.uid()
   or public.is_admin();

grant select on public.professional_mediations_safe to authenticated;

create or replace function public.touch_mediation_case()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_mediation_case on public.mediation_cases;
create trigger touch_mediation_case
before update on public.mediation_cases
for each row execute function public.touch_mediation_case();

create or replace function public.guard_mediation_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.client_id is distinct from old.client_id
    or new.professional_id is distinct from old.professional_id
    or new.report_id is distinct from old.report_id
    or new.client_message is distinct from old.client_message
    or new.created_at is distinct from old.created_at
    or new.admin_notes is distinct from old.admin_notes
    or new.closed_at is distinct from old.closed_at
    or new.status in ('resolved', 'unresolved', 'closed') and new.status is distinct from old.status then
    raise exception 'Only admins can change mediation ownership, final status, closed date, or admin notes.';
  end if;

  if new.client_message ~* '(estafador|ratero|fraudulento)' then
    raise exception 'Use neutral language in mediations.';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_mediation_admin_fields on public.mediation_cases;
create trigger guard_mediation_admin_fields
before update on public.mediation_cases
for each row execute function public.guard_mediation_admin_fields();

create index if not exists mediation_cases_professional_id_created_at_idx on public.mediation_cases (professional_id, created_at desc);
create index if not exists mediation_cases_client_id_created_at_idx on public.mediation_cases (client_id, created_at desc);
create index if not exists mediation_cases_status_idx on public.mediation_cases (status);

-- Reviews hardening
alter table public.reviews enable row level security;

alter table public.reviews
  add column if not exists images text[] not null default '{}';

drop policy if exists "Reviews are publicly readable" on public.reviews;
create policy "Reviews are publicly readable"
on public.reviews
for select
using (true);

drop policy if exists "Clients can insert reviews after contact" on public.reviews;
create policy "Clients can insert reviews after contact"
on public.reviews
for insert
to authenticated
with check (
  author_id = auth.uid()
  and exists (
    select 1
    from public.service_requests sr
    where sr.client_id = auth.uid()
      and sr.professional_id = reviews.professional_id
      and sr.status in ('PENDING', 'QUOTED', 'CONFIRMED', 'COMPLETED')
  )
);

drop policy if exists "Clients can update their own reviews" on public.reviews;
create policy "Clients can update their own reviews"
on public.reviews
for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

-- Storage buckets
insert into storage.buckets (id, name, public)
values ('recent-works', 'recent-works', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('report-evidence', 'report-evidence', false)
on conflict (id) do update set public = false;

drop policy if exists "Recent work images are public" on storage.objects;
create policy "Recent work images are public"
on storage.objects
for select
using (bucket_id = 'recent-works');

drop policy if exists "Professionals upload own recent work images" on storage.objects;
create policy "Professionals upload own recent work images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'recent-works'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users upload own report evidence" on storage.objects;
create policy "Users upload own report evidence"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'report-evidence'
  and split_part(name, '/', 2) = auth.uid()::text
);

drop policy if exists "Related parties read report evidence" on storage.objects;
create policy "Related parties read report evidence"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'report-evidence'
  and (
    split_part(name, '/', 2) = auth.uid()::text
    or split_part(name, '/', 1) = auth.uid()::text
    or public.is_admin()
  )
);
