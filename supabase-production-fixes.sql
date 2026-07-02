-- EsMiOficio production fixes for auth/profile/storage/listing/client dashboard.
-- Run in Supabase SQL Editor after backing up the project.
-- Auth email redirects are configured in Supabase Dashboard, not SQL:
-- Site URL: https://esmioficio.com
-- Additional Redirect URLs: https://esmioficio.com/** and local dev URL/update-password.

create extension if not exists pgcrypto;

-- Client/professional profile fields used by the app.
alter table if exists public.profiles
  add column if not exists name text,
  add column if not exists role text,
  add column if not exists city text,
  add column if not exists municipality text,
  add column if not exists phone text;

alter table if exists public.profiles enable row level security;
grant select, insert, update on public.profiles to authenticated;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Professional public listing and own-profile editing fields.
alter table if exists public.professionals
  add column if not exists response_time_minutes integer,
  add column if not exists coverage_zones text[] not null default '{}',
  add column if not exists services text[] not null default '{}',
  add column if not exists starting_price numeric(12,2),
  add column if not exists last_active_at timestamptz,
  add column if not exists jobs_count integer not null default 0,
  add column if not exists recommendations_count integer not null default 0,
  add column if not exists trust_status text not null default 'green',
  add column if not exists verification_level text not null default 'none';

alter table if exists public.professionals enable row level security;
grant select, insert, update on public.professionals to authenticated;

drop policy if exists "Professionals can read own full profile" on public.professionals;
create policy "Professionals can read own full profile"
on public.professionals
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Professionals can insert own profile" on public.professionals;
create policy "Professionals can insert own profile"
on public.professionals
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Professionals can update own profile" on public.professionals;
create policy "Professionals can update own profile"
on public.professionals
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

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
from public.professionals
where coalesce(nullif(name, ''), null) is not null
  and coalesce(nullif(trade, ''), null) is not null;

grant select on public.professionals_public to anon, authenticated;

-- Recent works table.
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
using (professional_id = auth.uid())
with check (professional_id = auth.uid());

create index if not exists recent_works_professional_id_created_at_idx
on public.recent_works (professional_id, created_at desc);

-- Storage buckets.
insert into storage.buckets (id, name, public)
values ('professional-images', 'professional-images', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('recent-works', 'recent-works', true)
on conflict (id) do update set public = true;

drop policy if exists "Professional images are public" on storage.objects;
create policy "Professional images are public"
on storage.objects
for select
using (bucket_id = 'professional-images');

drop policy if exists "Professionals upload own profile images" on storage.objects;
create policy "Professionals upload own profile images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'professional-images'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Professionals update own profile images" on storage.objects;
create policy "Professionals update own profile images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'professional-images'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'professional-images'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Professionals delete own profile images" on storage.objects;
create policy "Professionals delete own profile images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'professional-images'
  and split_part(name, '/', 1) = auth.uid()::text
);

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

drop policy if exists "Professionals update own recent work images" on storage.objects;
create policy "Professionals update own recent work images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'recent-works'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'recent-works'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Professionals delete own recent work images" on storage.objects;
create policy "Professionals delete own recent work images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'recent-works'
  and split_part(name, '/', 1) = auth.uid()::text
);
