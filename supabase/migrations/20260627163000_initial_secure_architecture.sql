-- EsMiOficio secure greenfield architecture.
-- Designed for a fresh Supabase project. Authorization is enforced in Postgres.

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text,
  role text not null default 'USER' check (role in ('USER','PRO')),
  city text,
  municipality text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table private.app_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role = 'admin'),
  created_at timestamptz not null default now()
);

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from private.app_roles where user_id = (select auth.uid()) and role = 'admin');
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

create table public.professionals (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  trade text not null,
  location text not null default '',
  municipality text not null default '',
  state text not null default '',
  rating numeric(3,2) not null default 0 check (rating between 0 and 5),
  reviews_count integer not null default 0 check (reviews_count >= 0),
  image_url text,
  cover_image_url text,
  portfolio_images text[] not null default '{}',
  verified boolean not null default false,
  phone text not null default '',
  email text,
  description text not null default '',
  years_experience integer not null default 0 check (years_experience >= 0),
  last_sensitive_update timestamptz,
  response_time_minutes integer check (response_time_minutes is null or response_time_minutes > 0),
  coverage_zones text[] not null default '{}',
  services text[] not null default '{}',
  starting_price numeric(12,2) check (starting_price is null or starting_price >= 0),
  last_active_at timestamptz,
  jobs_count integer not null default 0 check (jobs_count >= 0),
  recommendations_count integer not null default 0 check (recommendations_count >= 0),
  trust_status text not null default 'green' check (trust_status in ('green','yellow','red')),
  verification_level text not null default 'none' check (verification_level in ('none','identity','documents','recommended','verified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Physical projection prevents contact fields from leaking through a definer view.
create table public.professionals_public (
  id uuid primary key references public.professionals(id) on delete cascade,
  name text not null, trade text not null, location text not null default '',
  municipality text not null default '', state text not null default '',
  rating numeric(3,2) not null default 0, reviews_count integer not null default 0,
  image_url text, cover_image_url text, portfolio_images text[] not null default '{}',
  verified boolean not null default false, description text not null default '',
  years_experience integer not null default 0, last_sensitive_update timestamptz,
  response_time_minutes integer, coverage_zones text[] not null default '{}',
  services text[] not null default '{}', starting_price numeric(12,2), last_active_at timestamptz,
  jobs_count integer not null default 0, recommendations_count integer not null default 0,
  trust_status text not null default 'green', verification_level text not null default 'none'
);

create table public.professional_contacts (
  professional_id uuid primary key references public.professionals(id) on delete cascade,
  phone text not null default ''
);

create or replace function private.sync_professional_public()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.professionals_public
  select new.id,new.name,new.trade,new.location,new.municipality,new.state,new.rating,new.reviews_count,
    new.image_url,new.cover_image_url,new.portfolio_images,new.verified,new.description,new.years_experience,
    new.last_sensitive_update,new.response_time_minutes,new.coverage_zones,new.services,new.starting_price,
    new.last_active_at,new.jobs_count,new.recommendations_count,new.trust_status,new.verification_level
  on conflict (id) do update set
    name=excluded.name,trade=excluded.trade,location=excluded.location,municipality=excluded.municipality,
    state=excluded.state,rating=excluded.rating,reviews_count=excluded.reviews_count,image_url=excluded.image_url,
    cover_image_url=excluded.cover_image_url,portfolio_images=excluded.portfolio_images,verified=excluded.verified,
    description=excluded.description,years_experience=excluded.years_experience,
    last_sensitive_update=excluded.last_sensitive_update,response_time_minutes=excluded.response_time_minutes,
    coverage_zones=excluded.coverage_zones,services=excluded.services,starting_price=excluded.starting_price,
    last_active_at=excluded.last_active_at,jobs_count=excluded.jobs_count,
    recommendations_count=excluded.recommendations_count,trust_status=excluded.trust_status,
    verification_level=excluded.verification_level;
  insert into public.professional_contacts(professional_id, phone)
  values(new.id, new.phone)
  on conflict(professional_id) do update set phone=excluded.phone;
  return new;
end $$;
revoke all on function private.sync_professional_public() from public;
create trigger sync_professional_public after insert or update on public.professionals
for each row execute function private.sync_professional_public();

create table public.trade_requests (
  id uuid primary key default gen_random_uuid(), requester_id uuid default auth.uid() references auth.users(id) on delete set null,
  trade_name text not null check (char_length(trim(trade_name)) between 2 and 80),
  reason text not null check (char_length(trim(reason)) between 5 and 500),
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  created_at timestamptz not null default now()
);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  client_name text not null, professional_name text, trade text, details text,
  status text not null default 'PENDING' check (status in ('PENDING','QUOTED','CONFIRMED','COMPLETED','CANCELLED')),
  quote_amount numeric(12,2) check (quote_amount is null or quote_amount >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null, rating integer not null check (rating between 1 and 5),
  text text not null check (char_length(trim(text)) between 20 and 2000),
  images text[] not null default '{}', created_at timestamptz not null default now(),
  unique(author_id, professional_id),
  check (cardinality(images) <= 3),
  check (rating >= 3 or cardinality(images) > 0)
);

create table public.recent_works (
  id uuid primary key default gen_random_uuid(), professional_id uuid not null references public.professionals(id) on delete cascade,
  title text not null, description text, image_urls text[] not null default '{}', before_image_urls text[] not null default '{}',
  after_image_urls text[] not null default '{}', zone text, city text, service_type text, approximate_date text,
  created_at timestamptz not null default now()
);

create table public.job_posts (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references auth.users(id) on delete cascade,
  client_name text not null, state text not null, municipality text not null, title text not null,
  description text not null, phone_number text not null,
  status text not null default 'OPEN' check (status in ('OPEN','CLOSED')),
  created_at timestamptz not null default now()
);
create table public.job_posts_public (
  id uuid primary key references public.job_posts(id) on delete cascade,
  client_id uuid not null, client_name text not null, state text not null, municipality text not null,
  title text not null, description text not null, status text not null, created_at timestamptz not null
);
create table public.job_post_contacts (
  job_post_id uuid primary key references public.job_posts(id) on delete cascade,
  phone_number text not null
);
create or replace function private.sync_job_post_public()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.job_posts_public(id,client_id,client_name,state,municipality,title,description,status,created_at)
 values(new.id,new.client_id,new.client_name,new.state,new.municipality,new.title,new.description,new.status,new.created_at)
 on conflict(id) do update set client_name=excluded.client_name,state=excluded.state,municipality=excluded.municipality,title=excluded.title,description=excluded.description,status=excluded.status;
 insert into public.job_post_contacts(job_post_id,phone_number) values(new.id,new.phone_number)
 on conflict(job_post_id) do update set phone_number=excluded.phone_number;
 return new;
end $$;
revoke all on function private.sync_job_post_public() from public;
create trigger sync_job_post_public after insert or update on public.job_posts for each row execute function private.sync_job_post_public();
create or replace function public.get_job_post_contact(p_job_post_id uuid)
returns table(phone_number text) language sql stable security invoker set search_path='' as $$
 select c.phone_number from public.job_post_contacts c where c.job_post_id=p_job_post_id and (select auth.uid()) is not null;
$$;
revoke all on function public.get_job_post_contact(uuid) from public,anon;
grant execute on function public.get_job_post_contact(uuid) to authenticated;

create table public.client_saved_professionals (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references auth.users(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  created_at timestamptz not null default now(), unique(client_id,professional_id)
);
create table public.client_contact_events (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references auth.users(id) on delete cascade,
  professional_id uuid references public.professionals(id) on delete set null,
  contact_method text not null default 'contact' check (contact_method in ('whatsapp','phone','contact')),
  trade text, city text, created_at timestamptz not null default now()
);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(), type text not null,
  user_id uuid references auth.users(id) on delete set null, professional_id uuid references public.professionals(id) on delete set null,
  contact_method text check (contact_method is null or contact_method in ('whatsapp','phone','contact')),
  city text, zone text, trade text, created_at timestamptz not null default now()
);
create table public.activity_events_public (
  id uuid primary key references public.activity_events(id) on delete cascade, type text not null,
  professional_id uuid references public.professionals(id) on delete set null,
  city text, zone text, trade text, created_at timestamptz not null
);
create or replace function private.publish_activity_event()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.activity_events_public(id,type,professional_id,city,zone,trade,created_at)
  values(new.id,new.type,new.professional_id,new.city,new.zone,new.trade,new.created_at);
  return new;
end $$;
revoke all on function private.publish_activity_event() from public;
create trigger publish_activity_event after insert on public.activity_events for each row execute function private.publish_activity_event();

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('profile_view','whatsapp_click','phone_click','service_request_created','service_marked_hired','service_completed','review_created','professional_saved','search_performed')),
  user_id uuid references auth.users(id) on delete set null, professional_id uuid references public.professionals(id) on delete set null,
  service_request_id uuid references public.service_requests(id) on delete set null,
  city text,state text,trade text,metadata jsonb not null default '{}',created_at timestamptz not null default now(),
  check (jsonb_typeof(metadata) = 'object')
);

create table public.reports (
  id uuid primary key default gen_random_uuid(), professional_id uuid not null references public.professionals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null, description text not null, evidence_urls text[] not null default '{}', professional_response text,
  status text not null default 'pending' check(status in ('pending','under_review','resolved','dismissed','serious')),
  created_at timestamptz not null default now(), resolved_at timestamptz
);
create table public.mediation_cases (
  id uuid primary key default gen_random_uuid(), professional_id uuid not null references public.professionals(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade, report_id uuid references public.reports(id) on delete set null,
  status text not null default 'open' check(status in ('open','waiting_professional','waiting_client','resolved','unresolved','closed')),
  client_message text not null, professional_response text, admin_notes text,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),closed_at timestamptz
);

create view public.professional_reports_safe with (security_invoker=true) as
select id,professional_id,reason,description,evidence_urls,professional_response,status,created_at,resolved_at from public.reports;
create view public.professional_mediations_safe with (security_invoker=true) as
select id,professional_id,report_id,status,client_message,professional_response,created_at,updated_at,closed_at from public.mediation_cases;

create or replace function public.get_professional_contact(p_professional_id uuid)
returns table(phone text) language sql stable security invoker set search_path = '' as $$
  select p.phone from public.professional_contacts p
  where p.professional_id=p_professional_id and (select auth.uid()) is not null;
$$;
revoke all on function public.get_professional_contact(uuid) from public,anon;
grant execute on function public.get_professional_contact(uuid) to authenticated;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare requested_role text := case when upper(coalesce(new.raw_user_meta_data->>'role','USER'))='PRO' then 'PRO' else 'USER' end;
begin
  insert into public.profiles(id,name,email,role,city,municipality)
  values(new.id,coalesce(new.raw_user_meta_data->>'name',split_part(new.email,'@',1)),new.email,requested_role,
    coalesce(new.raw_user_meta_data->>'city',new.raw_user_meta_data->>'municipality'),new.raw_user_meta_data->>'municipality')
  on conflict(id) do nothing;
  if requested_role = 'PRO' then
    insert into public.professionals(
      id,name,trade,location,municipality,state,description,years_experience,last_sensitive_update,last_active_at
    ) values(
      new.id,
      coalesce(new.raw_user_meta_data->>'name',split_part(new.email,'@',1)),
      coalesce(nullif(new.raw_user_meta_data->>'trade',''),'Oficio por definir'),
      coalesce(new.raw_user_meta_data->>'municipality',''),
      coalesce(new.raw_user_meta_data->>'municipality',''),
      coalesce(new.raw_user_meta_data->>'state',''),
      coalesce(new.raw_user_meta_data->>'description','Completa tu perfil profesional.'),
      greatest(coalesce((nullif(new.raw_user_meta_data->>'yearsExperience',''))::integer,0),0),
      now(),now()
    ) on conflict(id) do nothing;
  end if;
  return new;
end $$;
revoke all on function private.handle_new_user() from public;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

create or replace function private.guard_professional_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if private.is_admin() then return new; end if;
  if new.id is distinct from old.id or new.rating is distinct from old.rating or new.reviews_count is distinct from old.reviews_count
    or new.verified is distinct from old.verified or new.jobs_count is distinct from old.jobs_count
    or new.recommendations_count is distinct from old.recommendations_count or new.trust_status is distinct from old.trust_status
    or new.verification_level is distinct from old.verification_level then
    raise exception 'Only administrators may change protected professional fields';
  end if;
  new.updated_at := now(); return new;
end $$;
revoke all on function private.guard_professional_update() from public;
create trigger guard_professional_update before update on public.professionals for each row execute function private.guard_professional_update();

create or replace function private.guard_service_request_update()
returns trigger language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if private.is_admin() then new.updated_at:=now(); return new; end if;
  if new.client_id<>old.client_id or new.professional_id<>old.professional_id or new.created_at<>old.created_at then raise exception 'Ownership is immutable'; end if;
  if uid=old.professional_id and not (old.status='PENDING' and new.status='QUOTED' or old.status='CONFIRMED' and new.status='COMPLETED' or new.status=old.status) then raise exception 'Invalid professional transition'; end if;
  if uid=old.client_id and not (old.status='QUOTED' and new.status='CONFIRMED' or new.status='CANCELLED' or new.status=old.status) then raise exception 'Invalid client transition'; end if;
  new.updated_at:=now(); return new;
end $$;
revoke all on function private.guard_service_request_update() from public;
create trigger guard_service_request_update before update on public.service_requests for each row execute function private.guard_service_request_update();

create or replace function private.guard_report_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if private.is_admin() then return new; end if;
 if new.user_id<>old.user_id or new.professional_id<>old.professional_id or new.reason<>old.reason or new.description<>old.description
   or new.evidence_urls<>old.evidence_urls or new.status<>old.status or new.resolved_at is distinct from old.resolved_at then
   raise exception 'Only administrators may change protected report fields'; end if;
 return new;
end $$;
revoke all on function private.guard_report_update() from public;
create trigger guard_report_update before update on public.reports for each row execute function private.guard_report_update();

create or replace function private.guard_mediation_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if private.is_admin() then new.updated_at:=now(); return new; end if;
 if new.client_id<>old.client_id or new.professional_id<>old.professional_id or new.report_id is distinct from old.report_id
   or new.client_message<>old.client_message or new.admin_notes is distinct from old.admin_notes or new.closed_at is distinct from old.closed_at
   or (new.status in ('resolved','unresolved','closed') and new.status<>old.status) then
   raise exception 'Only administrators may change protected mediation fields'; end if;
 new.updated_at:=now(); return new;
end $$;
revoke all on function private.guard_mediation_update() from public;
create trigger guard_mediation_update before update on public.mediation_cases for each row execute function private.guard_mediation_update();

-- RLS is mandatory on every Data API table, including read-only projections.
alter table public.profiles enable row level security;
alter table public.professionals enable row level security;
alter table public.professionals_public enable row level security;
alter table public.professional_contacts enable row level security;
alter table public.trade_requests enable row level security;
alter table public.service_requests enable row level security;
alter table public.reviews enable row level security;
alter table public.recent_works enable row level security;
alter table public.job_posts enable row level security;
alter table public.job_posts_public enable row level security;
alter table public.job_post_contacts enable row level security;
alter table public.client_saved_professionals enable row level security;
alter table public.client_contact_events enable row level security;
alter table public.activity_events enable row level security;
alter table public.activity_events_public enable row level security;
alter table public.analytics_events enable row level security;
alter table public.reports enable row level security;
alter table public.mediation_cases enable row level security;

create policy profiles_own_select on public.profiles for select to authenticated using ((select auth.uid())=id or (select private.is_admin()));
create policy profiles_own_insert on public.profiles for insert to authenticated with check ((select auth.uid())=id and role in ('USER','PRO'));
create policy profiles_own_update on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id and role in ('USER','PRO'));
create policy professionals_own_select on public.professionals for select to authenticated using ((select auth.uid())=id or (select private.is_admin()));
create policy professionals_own_insert on public.professionals for insert to authenticated with check ((select auth.uid())=id);
create policy professionals_own_update on public.professionals for update to authenticated using ((select auth.uid())=id or (select private.is_admin())) with check ((select auth.uid())=id or (select private.is_admin()));
create policy professionals_public_read on public.professionals_public for select to anon,authenticated using(true);
create policy professional_contacts_authenticated_read on public.professional_contacts for select to authenticated using((select auth.uid()) is not null);
create policy trade_requests_public_approved on public.trade_requests for select to anon,authenticated using(status='APPROVED' or requester_id=(select auth.uid()) or (select private.is_admin()));
create policy trade_requests_auth_insert on public.trade_requests for insert to authenticated with check (requester_id=(select auth.uid()));
create policy service_requests_parties_select on public.service_requests for select to authenticated using(client_id=(select auth.uid()) or professional_id=(select auth.uid()) or (select private.is_admin()));
create policy service_requests_client_insert on public.service_requests for insert to authenticated with check(client_id=(select auth.uid()) and status in ('PENDING','COMPLETED') and (select count(*) from public.service_requests x where x.client_id=(select auth.uid()) and x.professional_id=professional_id and x.created_at>now()-interval '1 hour')<3);
create policy service_requests_parties_update on public.service_requests for update to authenticated using(client_id=(select auth.uid()) or professional_id=(select auth.uid()) or (select private.is_admin())) with check(client_id=(select auth.uid()) or professional_id=(select auth.uid()) or (select private.is_admin()));
create policy reviews_public_select on public.reviews for select to anon,authenticated using(true);
create policy reviews_eligible_insert on public.reviews for insert to authenticated with check(author_id=(select auth.uid()) and exists(select 1 from public.service_requests s where s.client_id=(select auth.uid()) and s.professional_id=professional_id and s.status in ('PENDING','QUOTED','CONFIRMED','COMPLETED')));
create policy reviews_own_update on public.reviews for update to authenticated using(author_id=(select auth.uid())) with check(author_id=(select auth.uid()));
create policy reviews_own_delete on public.reviews for delete to authenticated using(author_id=(select auth.uid()) or (select private.is_admin()));
create policy recent_works_public_select on public.recent_works for select to anon,authenticated using(true);
create policy recent_works_owner_insert on public.recent_works for insert to authenticated with check(professional_id=(select auth.uid()) or (select private.is_admin()));
create policy recent_works_owner_update on public.recent_works for update to authenticated using(professional_id=(select auth.uid()) or (select private.is_admin())) with check(professional_id=(select auth.uid()) or (select private.is_admin()));
create policy recent_works_owner_delete on public.recent_works for delete to authenticated using(professional_id=(select auth.uid()) or (select private.is_admin()));
create policy job_posts_owner_select on public.job_posts for select to authenticated using(client_id=(select auth.uid()) or (select private.is_admin()));
create policy job_posts_public_open on public.job_posts_public for select to anon,authenticated using(status='OPEN');
create policy job_post_contacts_authenticated on public.job_post_contacts for select to authenticated using((select auth.uid()) is not null);
create policy job_posts_owner_insert on public.job_posts for insert to authenticated with check(client_id=(select auth.uid()) and status='OPEN');
create policy job_posts_owner_update on public.job_posts for update to authenticated using(client_id=(select auth.uid()) or (select private.is_admin())) with check(client_id=(select auth.uid()) or (select private.is_admin()));
create policy saved_owner_select on public.client_saved_professionals for select to authenticated using(client_id=(select auth.uid()) or (select private.is_admin()));
create policy saved_owner_insert on public.client_saved_professionals for insert to authenticated with check(client_id=(select auth.uid()));
create policy saved_owner_delete on public.client_saved_professionals for delete to authenticated using(client_id=(select auth.uid()) or (select private.is_admin()));
create policy contact_owner_select on public.client_contact_events for select to authenticated using(client_id=(select auth.uid()) or (select private.is_admin()));
create policy contact_owner_insert on public.client_contact_events for insert to authenticated with check(client_id=(select auth.uid()));
create policy activity_safe_insert on public.activity_events for insert to anon,authenticated with check(user_id is null or user_id=(select auth.uid()));
create policy activity_owner_admin_select on public.activity_events for select to authenticated using(user_id=(select auth.uid()) or (select private.is_admin()));
create policy activity_public_read on public.activity_events_public for select to anon,authenticated using(true);
create policy analytics_safe_insert on public.analytics_events for insert to anon,authenticated with check(user_id is null or user_id=(select auth.uid()));
create policy analytics_admin_select on public.analytics_events for select to authenticated using((select private.is_admin()));
create policy reports_owner_insert on public.reports for insert to authenticated with check(user_id=(select auth.uid()) and status='pending');
create policy reports_parties_select on public.reports for select to authenticated using(user_id=(select auth.uid()) or professional_id=(select auth.uid()) or (select private.is_admin()));
create policy reports_professional_update on public.reports for update to authenticated using(professional_id=(select auth.uid()) or (select private.is_admin())) with check(professional_id=(select auth.uid()) or (select private.is_admin()));
create policy mediation_client_insert on public.mediation_cases for insert to authenticated with check(client_id=(select auth.uid()) and status='open' and admin_notes is null and closed_at is null);
create policy mediation_parties_select on public.mediation_cases for select to authenticated using(client_id=(select auth.uid()) or professional_id=(select auth.uid()) or (select private.is_admin()));
create policy mediation_professional_update on public.mediation_cases for update to authenticated using(professional_id=(select auth.uid()) or (select private.is_admin())) with check(professional_id=(select auth.uid()) or (select private.is_admin()));

-- Explicit Data API privileges; no table is writable by anon.
revoke all on all tables in schema public from anon,authenticated;
grant select on public.professionals_public,public.reviews,public.recent_works,public.job_posts_public,public.trade_requests,public.activity_events_public to anon,authenticated;
grant select,insert,update on public.profiles,public.professionals to authenticated;
grant select on public.professional_contacts to authenticated;
grant select,insert on public.trade_requests,public.client_contact_events,public.activity_events,public.analytics_events to authenticated;
grant select,insert,update on public.service_requests,public.job_posts,public.reports,public.mediation_cases to authenticated;
grant select on public.job_post_contacts to authenticated;
grant select,insert,update,delete on public.reviews,public.recent_works to authenticated;
grant select,insert,delete on public.client_saved_professionals to authenticated;
grant select on public.professional_reports_safe,public.professional_mediations_safe to authenticated;
grant insert on public.activity_events,public.analytics_events to anon;

create index professionals_trade_location_idx on public.professionals_public(trade,state,municipality);
create index service_requests_client_created_idx on public.service_requests(client_id,created_at desc);
create index service_requests_professional_created_idx on public.service_requests(professional_id,created_at desc);
create index reviews_professional_created_idx on public.reviews(professional_id,created_at desc);
create index recent_works_professional_created_idx on public.recent_works(professional_id,created_at desc);
create index job_posts_status_created_idx on public.job_posts(status,created_at desc);
create index activity_public_created_idx on public.activity_events_public(created_at desc);
create index reports_parties_idx on public.reports(professional_id,user_id,created_at desc);
create index mediation_parties_idx on public.mediation_cases(professional_id,client_id,created_at desc);
create index activity_events_user_idx on public.activity_events(user_id);
create index activity_events_professional_idx on public.activity_events(professional_id);
create index activity_events_public_professional_idx on public.activity_events_public(professional_id);
create index analytics_events_user_idx on public.analytics_events(user_id);
create index analytics_events_professional_idx on public.analytics_events(professional_id);
create index analytics_events_service_request_idx on public.analytics_events(service_request_id);
create index client_contact_events_client_idx on public.client_contact_events(client_id);
create index client_contact_events_professional_idx on public.client_contact_events(professional_id);
create index client_saved_professionals_professional_idx on public.client_saved_professionals(professional_id);
create index job_posts_client_idx on public.job_posts(client_id);
create index job_posts_public_status_created_idx on public.job_posts_public(status,created_at desc);
create index mediation_cases_client_idx on public.mediation_cases(client_id);
create index mediation_cases_report_idx on public.mediation_cases(report_id);
create index reports_user_idx on public.reports(user_id);
create index trade_requests_requester_idx on public.trade_requests(requester_id);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('professional-images','professional-images',true,5242880,array['image/jpeg','image/png','image/webp']),
 ('recent-works','recent-works',true,5242880,array['image/jpeg','image/png','image/webp']),
 ('report-evidence','report-evidence',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy storage_public_images_read on storage.objects for select to anon,authenticated using(bucket_id in ('professional-images','recent-works'));
create policy storage_professional_images_insert on storage.objects for insert to authenticated with check(bucket_id in ('professional-images','recent-works') and split_part(name,'/',1)=(select auth.uid())::text);
create policy storage_professional_images_update on storage.objects for update to authenticated using(bucket_id in ('professional-images','recent-works') and owner_id=(select auth.uid()::text)) with check(bucket_id in ('professional-images','recent-works') and split_part(name,'/',1)=(select auth.uid())::text);
create policy storage_professional_images_delete on storage.objects for delete to authenticated using(bucket_id in ('professional-images','recent-works') and owner_id=(select auth.uid()::text));
create policy storage_report_insert on storage.objects for insert to authenticated with check(bucket_id='report-evidence' and split_part(name,'/',2)=(select auth.uid())::text);
create policy storage_report_select on storage.objects for select to authenticated using(bucket_id='report-evidence' and (split_part(name,'/',2)=(select auth.uid())::text or split_part(name,'/',1)=(select auth.uid())::text or (select private.is_admin())));
