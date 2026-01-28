# Deem a Cup ☕

A Next.js application for tracking and rating coffee visits.

## Overview

Deem a Cup allows users to:

- Authenticate via Supabase Auth.
- View a list of available cafes.
- Log visits to cafes with ratings (1-5 stars), reviews, and "liked" status.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Testing:** [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)
- **Package Manager:** [Bun](https://bun.sh/)

## Requirements

- Node.js / Bun
- A Supabase project

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd deem-a-cup
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Setup Database:**
    - Run the SQL commands from `db_schema.sql` in your Supabase SQL Editor to create tables (`cafes`, `deems`) and
      setup Row Level Security (RLS) policies.

4. **Configure Environment:**
    - Create `.env.local` and fill in your Supabase credentials.

## Running the App

Start the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Scripts

- `dev`: Runs `next dev` (Development mode).
- `build`: Runs `next build` (Production build).
- `start`: Runs `next start` (Production server).
- `lint`: Runs `eslint` (Linting).
- `test`: Runs `vitest` (Unit & Integration tests).

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
    - `actions`: Server Actions (e.g., `deem.ts` for logging visits).
    - `auth`: Authentication routes (callback).
    - `login`: Login page.
- `src/components`: React components (e.g., `CafeFeed`, `LogCafeForm`).
- `src/utils/supabase`: Supabase client configuration.
- `db_schema.sql`: Database schema definition.

## TODOs

- [x] **Tests:** Add unit and integration tests.
- [x] **Cafe Management:** Add UI/feature to create/add new cafes (currently relies on pre-populated DB or direct DB
  inserts).
- [x] **Google Places:** Integrate Google Places API for cafe search and details (implied by `place_id` in schema).
- [ ] **CI/CD:** Setup deployment pipeline.

## License

Private / Proprietary.
