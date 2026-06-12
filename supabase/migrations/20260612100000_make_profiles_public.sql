drop policy if exists "Public app profiles are readable" on public.app_users;
drop policy if exists "Moderators can read all app profiles" on public.app_users;

create policy "App profiles are publicly readable"
  on public.app_users
  for select
  to anon, authenticated
  using (true);

alter table public.app_users
  drop column if exists "public";
