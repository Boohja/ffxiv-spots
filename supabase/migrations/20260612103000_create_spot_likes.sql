alter table public.spots
  add column if not exists like_count integer not null default 0 check (like_count >= 0);

create table if not exists public.spot_likes (
  spot_id uuid not null references public.spots(id) on delete cascade,
  user_id uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (spot_id, user_id)
);

create index if not exists spot_likes_user_id_idx
  on public.spot_likes (user_id, created_at desc);

alter table public.spot_likes enable row level security;

create policy "Users can read their own spot likes"
  on public.spot_likes
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can like spots as themselves"
  on public.spot_likes
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can unlike their own spot likes"
  on public.spot_likes
  for delete
  to authenticated
  using (user_id = auth.uid());

create or replace function public.update_spot_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.spots
      set like_count = like_count + 1
      where id = new.spot_id;

    return new;
  end if;

  update public.spots
    set like_count = greatest(like_count - 1, 0)
    where id = old.spot_id;

  return old;
end;
$$;

drop trigger if exists spot_likes_update_count_on_insert on public.spot_likes;
drop trigger if exists spot_likes_update_count_on_delete on public.spot_likes;

create trigger spot_likes_update_count_on_insert
after insert on public.spot_likes
for each row
execute function public.update_spot_like_count();

create trigger spot_likes_update_count_on_delete
after delete on public.spot_likes
for each row
execute function public.update_spot_like_count();

update public.spots
set like_count = like_totals.like_count
from (
  select spot_id, count(*)::integer as like_count
  from public.spot_likes
  group by spot_id
) as like_totals
where spots.id = like_totals.spot_id;
