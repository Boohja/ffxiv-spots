# xivspots - Next.js Learning Skeleton

This is a TypeScript Next.js App Router project meant to teach by example.
Core integrations are intentionally left as TODO placeholders.

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project Map

- `src/components/layout/MainNavbar.tsx`: main site navigation example.
- `src/components/ui/Button.tsx`: reusable button component.
- `src/components/ui/Input.tsx`: reusable input component.
- `src/app/page.tsx`: index route example.
- `src/app/favorites/page.tsx`: favorites route example.
- `src/app/api/auth/discord/route.ts`: Discord callback placeholder.
- `src/app/api/upload/route.ts`: upload endpoint placeholder.
- `src/lib/auth/discord.ts`: OAuth helper stubs.
- `src/lib/db/client.ts`: database client stub.
- `src/lib/uploads/storage.ts`: file upload abstraction stub.
- `.env.example`: environment variable template.

## What You Should Implement Next

1. Discord auth flow
2. Database client and schema
3. File upload provider integration
4. Protected favorites data loading

Each placeholder file contains TODO hints and throws a clear "Not implemented" error until you complete it.

## Vercel Deployment Notes

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Add environment variables from `.env.example` in Vercel Project Settings.
4. Deploy.
