# Deem a Cup

A social coffee tracking application built with Next.js, Supabase, and Bun.

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) installed on your machine.
- A [Supabase](https://supabase.com) project.

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   bun install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env.local`.
   - Fill in your Supabase URL and Anon Key.

### Development

Run the development server:
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features
- Log coffee visits ("Deems") with detailed ratings.
- Search and discover cafes.
- Social feed and user following.
- Custom cafe lists and watchlists.

## Tech Stack
- **Framework:** Next.js 15
- **Runtime:** Bun
- **Database/Auth:** Supabase
- **Styling:** Tailwind CSS 4
