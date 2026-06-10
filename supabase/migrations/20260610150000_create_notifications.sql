create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient uuid not null references public.app_users(id) on delete cascade,
  title text not null,
  message text,
  url text,
  sent_at timestamptz not null default now(),
  read_at timestamptz,
  delete_at timestamptz not null default (now() + interval '60 days'),

  constraint notifications_title_not_blank check (length(btrim(title)) > 0),
  constraint notifications_url_path_or_http check (
    url is null
    or url like '/%'
    or url like 'https://%'
    or url like 'http://%'
  )
);

create index notifications_recipient_sent_at_idx
  on public.notifications (recipient, sent_at desc);

create index notifications_recipient_unread_idx
  on public.notifications (recipient)
  where read_at is null;

create index notifications_delete_at_idx
  on public.notifications (delete_at);

alter table public.notifications enable row level security;

create policy "Users can read their own notifications"
  on public.notifications
  for select
  to authenticated
  using (recipient = auth.uid());

create policy "Users can mark their own notifications read"
  on public.notifications
  for update
  to authenticated
  using (recipient = auth.uid())
  with check (recipient = auth.uid());
