-- Run this in Supabase SQL Editor if publishing a review still fails with:
-- new row violates row-level security policy for table "reviews"

alter table public.reviews enable row level security;

alter table public.reviews
  add column if not exists images text[] not null default '{}';

-- Optional check before cleanup:
-- select author_id, professional_id, count(*)
-- from public.reviews
-- group by author_id, professional_id
-- having count(*) > 1;

-- Keep the newest review for each client/professional pair and remove older duplicates.
-- This is required before creating the unique index below.
with ranked_reviews as (
  select
    id,
    row_number() over (
      partition by author_id, professional_id
      order by created_at desc nulls last, id desc
    ) as review_rank
  from public.reviews
)
delete from public.reviews
where id in (
  select id
  from ranked_reviews
  where review_rank > 1
);

create unique index if not exists reviews_one_per_client_professional
on public.reviews (author_id, professional_id);

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

drop policy if exists "Authors or admins can delete reviews" on public.reviews;
create policy "Authors or admins can delete reviews"
on public.reviews
for delete
to authenticated
using (
  author_id = auth.uid()
  or coalesce(auth.jwt()->'app_metadata'->>'role', '') = 'admin'
);
