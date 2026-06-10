create type public.spot_state as enum (
  'draft',
  'submitted',
  'accepted',
  'duplicate'
);

create table public.spots (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  submitted_by uuid references public.app_users(id) on delete set null,
  state public.spot_state not null default 'submitted',
  duplicate_of_spot_id uuid references public.spots(id) on delete set null,
  landmark_id bigint references public.landmarks(id) on delete set null,
  zone text not null,
  x numeric(4, 1) not null,
  y numeric(4, 1) not null,
  z numeric(4, 1),
  title text not null,
  description text,
  tags text[] not null default '{}',
  access_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  accepted_at timestamptz,
  accepted_by uuid references public.app_users(id) on delete set null,

  constraint spots_x_range check (x >= 0 and x <= 100),
  constraint spots_y_range check (y >= 0 and y <= 100),
  constraint spots_z_range check (z is null or (z >= -100 and z <= 100)),
  constraint spots_duplicate_target_required check (
    state <> 'duplicate' or duplicate_of_spot_id is not null
  )
);

create table public.spot_images (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.spots(id) on delete cascade,
  storage_key text not null unique,
  url text not null,
  width integer not null,
  height integer not null,
  size integer not null,
  alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),

  constraint spot_images_dimensions_positive check (width > 0 and height > 0),
  constraint spot_images_size_positive check (size > 0)
);

create index spots_state_idx on public.spots (state);
create index spots_zone_idx on public.spots (zone);
create index spots_landmark_id_idx on public.spots (landmark_id);
create index spots_coordinates_idx on public.spots (zone, x, y);
create index spot_images_spot_id_idx on public.spot_images (spot_id, sort_order);

alter table public.spots enable row level security;
alter table public.spot_images enable row level security;

create policy "Accepted spots are publicly readable"
  on public.spots
  for select
  to anon, authenticated
  using (state = 'accepted');

create policy "Submitters can read their own spots"
  on public.spots
  for select
  to authenticated
  using (submitted_by = auth.uid());

create policy "Authenticated users can submit spots"
  on public.spots
  for insert
  to authenticated
  with check (submitted_by = auth.uid() and state in ('draft', 'submitted'));

create policy "Moderators can read all spots"
  on public.spots
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.app_users
      where id = auth.uid()
        and role in ('moderator', 'admin')
    )
  );

create policy "Moderators can update spots"
  on public.spots
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.app_users
      where id = auth.uid()
        and role in ('moderator', 'admin')
    )
  )
  with check (
    exists (
      select 1
      from public.app_users
      where id = auth.uid()
        and role in ('moderator', 'admin')
    )
  );

create policy "Images for accepted spots are publicly readable"
  on public.spot_images
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.spots
      where spots.id = spot_images.spot_id
        and spots.state = 'accepted'
    )
  );

create policy "Submitters can read images for their own spots"
  on public.spot_images
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.spots
      where spots.id = spot_images.spot_id
        and spots.submitted_by = auth.uid()
    )
  );

create policy "Submitters can add images for their own draft or submitted spots"
  on public.spot_images
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.spots
      where spots.id = spot_images.spot_id
        and spots.submitted_by = auth.uid()
        and spots.state in ('draft', 'submitted')
    )
  );

create trigger spots_set_updated_at
before update on public.spots
for each row
execute function public.set_updated_at();
