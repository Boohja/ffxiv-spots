alter type public.spot_state add value if not exists 'draft';

drop policy if exists "Authenticated users can submit spots" on public.spots;
create policy "Authenticated users can submit spots"
  on public.spots
  for insert
  to authenticated
  with check (submitted_by = auth.uid() and state in ('draft', 'submitted'));

drop policy if exists "Submitters can add images for their own submitted spots" on public.spot_images;
drop policy if exists "Submitters can add images for their own draft or submitted spots" on public.spot_images;
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
