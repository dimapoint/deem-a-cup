# Deem a Cup ☕

Zero-friction logging for coffee lovers who want to capture every visit in seconds—and review only when inspiration
hits.

## Overview

- **Instant**: Logging a visit takes a tap; ratings, reviews, and likes are optional extras.
- **Social**: See what other enthusiasts deem worth a sip and build a trail of favorite cafes.
- **Focused stack**: Powered by Next.js 15, Bun, Supabase, Tailwind, and TypeScript strict mode.

## Philosophy

1. **Zero friction logging**: Prioritize the visit itself—keep the UI lean, mutations fast, and follow-ups optional.
2. **Server-first actions**: Keep mutations close to the monorepo, built with Supabase-backed Server Actions.
3. **Type safety & clarity**: Prefer explicit interfaces (`types/database.ts` or generated Supabase types) and avoid
   `any`.

## Tech Stack (strict)

- **Framework**: Next.js 15 (App Router)
- **Runtime & package manager**: Bun (`bun install`, `bun run`)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI primitives**: Radix UI (where needed) with `lucide-react` for icons
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Testing**: Vitest + React Testing Library

## Getting started

1. **Install Bun** (if you haven’t already): follow the instructions at https://bun.sh.
2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Populate environment variables** by copying `.env.local.example` (if available) or creating `.env.local` with:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Bootstrap Supabase schema**: run the SQL in `db_schema.sql` inside the Supabase SQL editor to create `cafes`,
   `deems`, and recommended RLS policies.

5. **Run the app**

   ```bash
   bun run dev
   ```

   Open http://localhost:3000 to explore the experience.

## Development workflow

- **Server Actions only**: Mutations live in Server Components under `src/app/**` or dedicated actions files (
  `'use server'` blocks). Avoid adding REST API routes unless handling external webhooks.
- **Supabase clients**
    - Use `utils/supabase/server.ts` inside Server Components or Actions.
    - Use `utils/supabase/client.ts` inside Client Components.
- **Data fetching**: Prefer direct fetches in Server Components; keep hydration minimal.
- **Types**: Define table interfaces inside `types/database.ts` or reuse Supabase-generated helpers. Keep `any` out of
  shared code.
- **Component conventions**: Functional arrow components, prop destructuring, early returns, Radix + Tailwind for
  styling, Lucide icons when needed.

## Project structure highlights

- `src/app`: App Router routes and Server Actions (e.g., `actions/deem.ts` for logging).
- `src/components`: Reusable UI (e.g., `CafeFeed`, `LogCafeForm`).
- `src/utils/supabase`: Shared Supabase clients.
- `types/database.ts`: Canonical interfaces for `cafes`, `deems`, etc.
- `db_schema.sql`: Source of truth for the Postgres schema and RLS configuration.

## Database schema (reference)

- `cafes`: public read (fields: `id`, `name`, `address`, `place_id`, `cover_image`)
- `deems`: public read, auth write (fields: `id`, `user_id`, `cafe_id`, `rating`, `review`, `visited_at`, `liked`)

## Scripts

- `bun run dev` — run in development mode
- `bun run build` — production build
- `bun run start` — production server
- `bun run lint` — lint the repo
- `bun run test` — Vitest unit + integration suites

## Diagnostics & tips

- Run `bun run lint` before pushing; the repo enforces strict linting.
- If you add new Supabase tables, update `types/database.ts` and the Schema SQL.
- Keep UI interactions lean to honor the zero-friction philosophy.

## TODO

- [ ] CI/CD pipeline

## License

Private / Proprietary.
