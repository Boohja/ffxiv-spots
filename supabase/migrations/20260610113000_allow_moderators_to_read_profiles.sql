create or replace function public.current_app_user_has_role(required_roles public.app_user_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_users
    where id = auth.uid()
      and role = any(required_roles)
  );
$$;

drop policy if exists "Moderators can read all app profiles" on public.app_users;
drop policy if exists "Submitters can update their own spots" on public.spots;
drop policy if exists "Moderators can delete spots" on public.spots;
drop policy if exists "Submitters can manage their own spot images" on public.spot_images;
drop policy if exists "Moderators can manage all spot images" on public.spot_images;

create policy "Moderators can read all app profiles"
  on public.app_users
  for select
  to authenticated
  using (public.current_app_user_has_role(array['moderator', 'admin']::public.app_user_role[]));

create policy "Submitters can update their own spots"
  on public.spots
  for update
  to authenticated
  using (submitted_by = auth.uid())
  with check (submitted_by = auth.uid());

create policy "Moderators can delete spots"
  on public.spots
  for delete
  to authenticated
  using (public.current_app_user_has_role(array['moderator', 'admin']::public.app_user_role[]));

create policy "Submitters can manage their own spot images"
  on public.spot_images
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.spots
      where spots.id = spot_images.spot_id
        and spots.submitted_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.spots
      where spots.id = spot_images.spot_id
        and spots.submitted_by = auth.uid()
    )
  );

create policy "Moderators can manage all spot images"
  on public.spot_images
  for all
  to authenticated
  using (public.current_app_user_has_role(array['moderator', 'admin']::public.app_user_role[]))
  with check (public.current_app_user_has_role(array['moderator', 'admin']::public.app_user_role[]));
