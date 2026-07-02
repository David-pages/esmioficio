create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 5 and 180),
  excerpt text not null check (char_length(excerpt) between 20 and 320),
  content text not null check (char_length(content) between 50 and 30000),
  category text not null default 'Consejos' check (char_length(category) between 2 and 60),
  author text not null default 'Redaccion EsMiOficio' check (char_length(author) between 2 and 100),
  image_url text not null,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_posts_have_date check (status = 'draft' or published_at is not null)
);

create or replace function private.touch_blog_post()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at := now();
  if new.status = 'published' and new.published_at is null then new.published_at := now(); end if;
  if new.status = 'draft' then new.published_at := null; end if;
  return new;
end $$;
revoke all on function private.touch_blog_post() from public, anon, authenticated;

create trigger touch_blog_post before insert or update on public.blog_posts
for each row execute function private.touch_blog_post();

alter table public.blog_posts enable row level security;
create policy blog_public_read on public.blog_posts for select to anon, authenticated
using (status = 'published' or (select private.is_admin()));
create policy blog_admin_insert on public.blog_posts for insert to authenticated
with check ((select private.is_admin()) and created_by = (select auth.uid()));
create policy blog_admin_update on public.blog_posts for update to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy blog_admin_delete on public.blog_posts for delete to authenticated
using ((select private.is_admin()));

revoke all on public.blog_posts from anon, authenticated;
grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values('blog-images', 'blog-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict(id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy blog_images_admin_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'blog-images'
  and (select private.is_admin())
  and lower(storage.extension(name)) in ('jpg','jpeg','png','webp','gif')
);
create policy blog_images_admin_update on storage.objects for update to authenticated
using (bucket_id = 'blog-images' and (select private.is_admin()))
with check (bucket_id = 'blog-images' and (select private.is_admin()));
create policy blog_images_admin_delete on storage.objects for delete to authenticated
using (bucket_id = 'blog-images' and (select private.is_admin()));
