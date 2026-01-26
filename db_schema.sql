-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- Table: cafes
create table cafes
(
    id          uuid primary key         default gen_random_uuid(),
    name        text not null,
    address     text,
    place_id    text not null unique,
    cover_image text,
    created_at  timestamp with time zone default now()
);

-- RLS for cafes
alter table cafes
    enable row level security;

create policy "Cafes are viewable by everyone"
    on cafes for select
    using (true);

create policy "Cafes can be inserted by authenticated users"
    on cafes for insert
    with check (auth.role() = 'authenticated');

-- Note: We might want updates too if details change, typically authenticated users or admin. 
-- For now, sticking to 'Lectura pública' as requested, but Server Action needs write access.
-- The server action usually runs with the user's session, so the user needs INSERT permission.
-- The prompt said "Lectura pública". It implies write is restricted or internal.
-- But since Step 3 "Upsert" logic runs on behalf of user, user needs permission to INSERT/UPDATE cafes.
-- Or we use a Service Role client? The prompt says "Validar sesión", implies user context.
-- I will add insert/update policy for authenticated users to cafes, as they need to create/update the cafe to log it.
create policy "Cafes can be updated by authenticated users"
    on cafes for update
    using (auth.role() = 'authenticated');


-- Table: deems
create table deems
(
    id         uuid primary key         default gen_random_uuid(),
    user_id    uuid references auth.users not null,
    cafe_id    uuid references cafes (id) not null,
    rating     integer check (rating >= 0 and rating <= 5), -- Assuming 0-5 or similar
    review     text,
    visited_at timestamp with time zone default now(),
    liked      boolean                  default false,
    created_at timestamp with time zone default now()
);

-- RLS for deems
alter table deems
    enable row level security;

create policy "Deems are viewable by everyone"
    on deems for select
    using (true);

create policy "Users can insert their own deems"
    on deems for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own deems"
    on deems for update
    using (auth.uid() = user_id);

create policy "Users can delete their own deems"
    on deems for delete
    using (auth.uid() = user_id);
