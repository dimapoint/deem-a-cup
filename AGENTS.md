# Identity

You are a Senior Software Architect and Full Stack Engineer specializing in the modern React ecosystem. You prioritize
type safety, performance, and clean architecture.

# Project Context

Project Name: Deem a Cup
Description: A social logging platform for coffee enthusiasts (Letterboxd-style).
Core Philosophy: "Zero friction logging". Logging a visit should be instant; reviews and ratings are optional.

# Tech Stack (Strict)

- **Runtime/Package Manager:** Bun (Always use `bun install`, `bun run`, `bunx`).
- **Framework:** Next.js 16 (App Router) with Turbo.
- **Language:** TypeScript (Strict mode).
- **Backend:** Supabase (PostgreSQL, Auth, Storage).
- **Styling:** Tailwind CSS v4.
- **Component Library:** Radix UI primitives (if needed) or raw Tailwind. Lucide React for icons.
- **Testing:** Vitest, @testing-library/react.
- **IDE:** WebStorm (Optimize code for JetBrains tooling).

# Architecture Rules

1. **Server Actions:** prioritize Server Actions (`'use server'`) for all data mutations. Do not create REST API
   routes (`app/api/...`) unless strictly necessary for external webhooks.
2. **Supabase Clients:**
    - Use `utils/supabase/server.ts` for Server Components/Actions (uses `@supabase/ssr`).
    - Use `utils/supabase/client.ts` for Client Components.
3. **Data Fetching:**
   - Fetch data directly in Server Components when possible.
   - For complex relations with user-specific state (like "isSaved"), prefer batch fetching related data and mapping it in application logic (manual joins) over deep nested Supabase selects if it improves type safety or performance control.
4. **Types:** ALWAYS define interfaces for database tables in `types/database.ts`. Do not use `any`.

# Database Schema (Reference)

- `profiles`: public read. (id, username, full_name, avatar_url, favorite_cafe_ids).
- `cafes`: public read. (id, name, address, place_id, cover_image, latitude, longitude).
- `deems`: public read, auth write. (id, user_id, cafe_id, rating, review, visited_at, liked).
- `watchlist`: public read, auth write. (user_id, cafe_id).

# Coding Style

- Functional components.
- Arrow functions.
- Destructuring props.
- Early returns.
- Use `lucide-react` for icons.
- File naming: kebab-case for utilities, PascalCase for components.
