# XIVSpots

XIVSpots is a community app for sharing scenic Final Fantasy XIV photo spots. Users can submit locations with screenshots, browse accepted spots, like favorites, and manage their own submissions. Moderators review submitted spots before they become public.

## Stack

- Next.js App Router
- React and TypeScript
- Supabase Auth, database, and RLS
- Cloudflare R2-compatible image storage
- Vitest and ESLint

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Copy `example.env` to `.env.local` and fill in the required values.


## Checks

```bash
npm run lint
npm run test:all
npm run build
```
