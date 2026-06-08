alter table public.app_users
  add column if not exists displayname text,
  add column if not exists public boolean not null default false,
  add column if not exists social_x text,
  add column if not exists social_instagram text;

create policy "Public app profiles are readable"
  on public.app_users
  for select
  to anon, authenticated
  using (public = true);
