# XIVSpots Project Notes

These notes capture working context that is easy to rediscover but annoying to re-scan every time.

## Framework

- This project uses Next.js `16.2.7` with the App Router.
- Follow `AGENTS.md`: read the relevant local docs in `node_modules/next/dist/docs/` before changing Next-specific routing, data loading, server/client component, image, or mutation behavior.
- Pages and layouts use async route props such as `params: Promise<...>` and `searchParams: Promise<...>`.
- Server Components are the default. Keep Supabase reads and auth checks server-side unless a UI truly needs client interaction.

## Core Data Model

- Public spot listings are backed by accepted database rows.
- Database-backed user submissions live in Supabase tables from `supabase/migrations/20260609130000_create_spots.sql`.
- `spots.state` is `draft`, `submitted`, `accepted`, or `duplicate`.
- Spot images are in `spot_images` and are ordered by `sort_order`.
- `submitted_by` references `app_users(id)`.
- `app_users.role` is `submitter`, `trusted_submitter`, `moderator`, or `admin`.

## Current Spot Routes

- `/spots`: browse page using accepted database rows and filters.
- `/spots/[slug]`: database-backed spot detail view.
- `/spots/submit`: signed-in form that saves drafts or submitted spots through `POST /api/spots`.
- `/spots/mine`: signed-in user's compact list of their own database-backed entries, all states.
- `/moderation/spots`: moderator/admin review queue for `submitted` entries, oldest first.
- `/spots/[slug]/edit`: shared edit/review page for draft owners, submitted owners, and reviewers.

## Spot Entry Lists

- `src/lib/spots/entry-list.ts` fetches compact database spot rows for list views.
- `src/components/spots/SpotEntryList.tsx` renders the shared image-first compact card list.
- The list intentionally favors a thumbnail over a classic table. It still exposes zone, X/Y/Z, creation date, state chip, and optional submitter profile link.
- Missing spot images use `/spots/placeholder.webp` with a grayscale treatment.
- State chip colors are local to `SpotEntryList.tsx`.
- Owner lists link draft entries to `/spots/[slug]/edit`; non-draft owner entries link to the spot detail. Review lists link every entry to the edit/review page.

## Spot Edit Workflow

- `src/components/spots/SubmitSpotForm.tsx` supports create, owner draft edit, owner submitted revoke-only, and reviewer edit modes.
- Draft owners can save as draft or submit. Submitting changes state to `submitted`.
- Owners cannot edit an already submitted spot unless they revoke it back to `draft`.
- Moderators/admins can edit submitted and accepted spots, save and return, save and accept, or delete.
- Deleting removes the spot and its images. Removing existing images in review mode prompts for confirmation before the image is marked for deletion.
- `PATCH /api/spots/[id]` owns the edit workflow and validates auth, role, state, images, and transitions server-side.
- R2 object deletion is exposed through `deleteStoredImage` in `src/lib/uploads/storage.ts`.

## Auth And Visibility

- `src/lib/supabase/server.ts` creates the request-scoped Supabase server client.
- `src/components/layout/AuthMenu.tsx` reads `app_users` to seed the user menu.
- Signed-in users see `My spots`.
- Moderators/admins additionally see `Review queue`.
- User profile visibility is centralized in `src/lib/users/profile-visibility.ts`.
- Moderators/admins can view private profiles in app code and via the migration `20260610113000_allow_moderators_to_read_profiles.sql`.

## Supabase RLS Intent

- Keep RLS as broad safety boundaries, not as the main business workflow engine. Do not mirror application state machines in policies.
- Ownership, accepted-public-read, and moderator/admin broad reads belong in RLS.
- Workflow rules such as quotas, moderation transitions, and duplicate handling should stay in version-controlled server/application code.
- Current review queue needs moderator/admin read access to all pending spots, submitter profiles, and spot images.
- Prefer broad capability policies over state-specific workflow policies. For example, owners may update their own spot rows/images, while `PATCH /api/spots/[id]` decides whether the current state/action is allowed.
- Before adding or changing an RLS policy, check whether the rule is already enforced in server code. If it is not a simple ownership/public-read/moderator boundary, keep it out of RLS.

## Testing And Verification

- Common checks:
  - `npm run lint`
  - `npm run build`
  - `npm run test:unit`
- Browser verification is useful after frontend changes. The Browser plugin can inspect the running local app if the user has the dev server open.
