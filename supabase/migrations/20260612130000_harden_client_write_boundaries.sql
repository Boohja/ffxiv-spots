create or replace view public.public_profiles
with (security_barrier = true)
as
select
  id,
  displayname,
  avatar_url,
  created_at,
  social_x,
  social_instagram
from public.app_users;

grant select on public.public_profiles to anon, authenticated;

drop policy if exists "App profiles are publicly readable" on public.app_users;

revoke insert, update, delete on public.app_users from anon, authenticated;
grant update (displayname, social_x, social_instagram)
  on public.app_users
  to authenticated;

revoke insert, update, delete on public.spots from anon, authenticated;
revoke insert, update, delete on public.spot_images from anon, authenticated;

drop policy if exists "Users can like spots as themselves" on public.spot_likes;
create policy "Users can like accepted spots as themselves"
  on public.spot_likes
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.spots
      where spots.id = spot_likes.spot_id
        and spots.state = 'accepted'
    )
  );

revoke update on public.notifications from anon, authenticated;
grant update (read_at, delete_at)
  on public.notifications
  to authenticated;
