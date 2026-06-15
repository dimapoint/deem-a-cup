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
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Abrí tu proyecto en [supabase.com](https://supabase.com) → **Settings → API** y completá:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
     ```
   - Opcionalmente, agregá `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` para la búsqueda de cafés.

4. Aplicá el schema de base de datos:
   - Copiá el contenido de `db_schema.sql` y ejecutalo en el **SQL Editor** de tu proyecto Supabase.

### Development

Run the development server:
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features
- Log coffee visits ("Deems") with detailed ratings.
- Search and discover cafes nearby.
- Social feed: seguí a otros usuarios y vé sus deems, listas y fotos.
- Comentarios en deems con carga lazy.
- Notificaciones en tiempo real (campana con badge).
- Custom cafe lists and watchlists.
- Subida de fotos de cafés.

## Tech Stack
- **Framework:** Next.js 15
- **Runtime:** Bun
- **Database/Auth:** Supabase
- **Styling:** Tailwind CSS 4
