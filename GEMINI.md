# Deem a Cup - Project Context

## Overview
Deem a Cup is a coffee-centric social application designed for coffee enthusiasts to log, rate, and share their coffee experiences. Inspired by social tracking platforms, it allows users to keep a personal history of "Deems" (coffee logs), discover new cafes, and connect with other coffee lovers.

## Core Features
- **Deems (Logs):** Record coffee visits with ratings, reviews, brew methods, bean origins, and roasters.
- **Cafe Discovery:** Search and find cafes (likely utilizing Google Places API).
- **Social:** Follow other users and see a feed of their recent activity.
- **Lists & Watchlists:** Create custom collections of cafes and track places to visit.
- **User Profiles:** Showcase coffee statistics, favorite cafes, and activity history.
- **Statistics:** Visualize coffee consumption habits and ratings over time.

## Technical Stack
- **Frontend Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Backend/Database:** Supabase (Auth, PostgreSQL, Storage)
- **Styling:** Tailwind CSS (configured in `globals.css` and used via utility classes)
- **Client/Server Interaction:** Next.js Server Actions for mutations, React Server Components for data fetching.

## Project Structure
- `src/app/`: Next.js App Router routes and Server Actions (`src/app/actions`).
- `src/components/`: Modular UI components organized by feature:
  - `cafes/`: Cafe search and display components.
  - `dashboard/`: Main activity feed and dashboard layout.
  - `deems/`: Components for creating and displaying coffee logs.
  - `profile/`: User profile sections and statistics.
  - `stats/`: Data visualization components.
  - `ui/`: Common reusable components (Modals, etc.).
- `src/utils/`: Helper functions and Supabase client configurations (`src/utils/supabase`).
- `src/types/`: Centralized TypeScript definitions for database entities and application state.

## Development Conventions
- **Data Fetching:** Prefer Server Components for fetching data from Supabase.
- **Mutations:** Use Server Actions located in `src/app/actions` for handling form submissions and state changes.
- **Components:** Organize components into feature-based folders. Use sub-folders for complex component parts.
- **Styling:** Use Tailwind CSS for component styling. Maintain a consistent dark theme (`bg-[#14181c]`).
- **Database Safety:** Use the types defined in `src/types/database.ts` to ensure type safety when interacting with Supabase.

## Building and Running
> [!IMPORTANT]
> `package.json` and `tsconfig.json` are currently missing from the root directory. These should be recreated to enable standard development workflows.

- **Development:** `npm run dev` (TODO: Confirm once `package.json` is restored)
- **Build:** `npm run build`
- **Lint:** `npm run lint`

## Supabase Schema
The application expects the following tables in Supabase:
- `profiles`: User profile data (id, username, full_name, avatar_url, etc.)
- `cafes`: Coffee shop information (place_id, name, address, etc.)
- `deems`: User coffee logs and ratings.
- `watchlist`: Join table for users tracking cafes.
- `follows`: Social connections between users.
- `lists` & `list_items`: User-created cafe collections.
- `cafe_photos` & `photo_likes`: User-uploaded cafe imagery.
