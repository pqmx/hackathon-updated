<h1 align="center">TrendLabs</h1>

The internal demo app for generating ad assets with Gemini and storing everything in Supabase (auth, storage, metadata). This doc focuses on running the project locally and deploying it with the right environment and database/storage setup.

## Features

- Next.js App Router with Supabase Auth (cookies via `@supabase/ssr`).
- Google Gemini for ad copy, product photo variations, jingle/music, and Veo video generation.
- Supabase Storage bucket `media-assets` plus `media_assets` table for asset metadata; signed URLs for secure delivery.
- Saved sets page that lists all assets per saveId, plus local caching for quick reloads.
- Tailwind + shadcn/ui components, light/dark theme switcher.

## Prerequisites

- Node 20+ and npm.
- Supabase project (can be free tier).
- Google AI Studio API key with access to Gemini and Veo (set `GEMINI_API_KEY`).

## Environment variables

Create `.env.local` at the repo root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_or_publishable_key
GEMINI_API_KEY=your_google_ai_studio_key
```

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` come from Supabase Project Settings > API.
- `GEMINI_API_KEY` is required for all AI routes; you can also expose it as `NEXT_PUBLIC_GEMINI_API_KEY` if needed, but keep it server-side when possible.

## Supabase setup

1) Create a private storage bucket named `media-assets` (Dashboard > Storage). Keep it private; the app uses signed URLs.

2) Create the `media_assets` table (SQL editor):

```sql
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  storage_path text not null,
  file_name text,
  media_type text check (media_type in ('image','video','audio')) not null,
  mime_type text,
  file_size_bytes bigint,
  created_at timestamptz default now()
);

alter table public.media_assets enable row level security;

create policy "Owners can insert" on public.media_assets
  for insert with check (auth.uid() = owner_id);

create policy "Owners can select" on public.media_assets
  for select using (auth.uid() = owner_id);
```

3) (Optional but recommended) Allow authenticated users to manage objects in the `media-assets` bucket:

```sql
create policy if not exists "Authenticated can manage media-assets" on storage.objects
  for all using (bucket_id = 'media-assets' and auth.role() = 'authenticated')
  with check (bucket_id = 'media-assets' and auth.role() = 'authenticated');
```

## Run locally

```bash
npm install
npm run dev
```

- App runs at http://localhost:3000.
- Sign up/login with Supabase Auth; all asset operations require an authenticated user.

## Useful scripts

- `npm run dev` — start Next.js in dev mode.
- `npm run lint` — run ESLint.
- `npm run build` / `npm run start` — production build and serve.

## Deploy

- Vercel works out of the box: set the env vars above and connect your Supabase project (or manually provision the bucket/table/policies).
- Other hosts: run `npm run build` and `npm run start` behind your preferred process manager; ensure env vars are present.

## Troubleshooting

- Missing bucket/table errors: create the `media-assets` bucket and `media_assets` table with the SQL above.
- 401s on save/list: confirm you are signed in and policies are applied.
- Gemini errors: verify `GEMINI_API_KEY` exists and has access to the requested model (Gemini, Veo, or Lyria).
