create type public.app_user_role as enum (
  'submitter',
  'trusted_submitter',
  'moderator',
  'admin'
);

create table public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  discord_id text not null unique,
  username text,
  global_name text,
  avatar_url text,
  role public.app_user_role not null default 'submitter',
  raw_discord jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.app_users enable row level security;

create policy "Users can read their own app profile"
  on public.app_users
  for select
  to authenticated
  using (id = auth.uid());

create policy "Users can create their own app profile"
  on public.app_users
  for insert
  to authenticated
  with check (id = auth.uid());

create policy "Users can update their own app profile"
  on public.app_users
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger app_users_set_updated_at
before update on public.app_users
for each row
execute function public.set_updated_at();
