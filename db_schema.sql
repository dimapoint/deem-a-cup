-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. Table: profiles (Public user data) - Must be first for FKs
create table profiles
(
    id         uuid references auth.users on delete cascade not null primary key,
    updated_at timestamp with time zone,
    username   text unique,
    full_name  text,
    avatar_url text,
    website    text,

    constraint username_length check (char_length(username) >= 3)
);

alter table profiles
    enable row level security;

create policy "Public profiles are viewable by everyone."
    on profiles for select
    using (true);

create policy "Users can insert their own profile."
    on profiles for insert
    with check (auth.uid() = id);

create policy "Users can update own profile."
    on profiles for update
    using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
    returns trigger as
$$
begin
    insert into public.profiles (id, full_name, avatar_url)
    values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');
    return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert
    on auth.users
    for each row
execute procedure public.handle_new_user();

-- Backfill profiles for existing users (Run this if you have existing users)
insert into public.profiles (id, full_name, avatar_url)
select id, raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'avatar_url'
from auth.users
on conflict (id) do nothing;


-- 2. Table: cafes
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

create policy "Cafes can be updated by authenticated users"
    on cafes for update
    using (auth.role() = 'authenticated');


-- 3. Table: deems
create table deems
(
    id         uuid primary key         default gen_random_uuid(),
    user_id    uuid references profiles (id) not null, -- Changed to reference profiles
    cafe_id    uuid references cafes (id)    not null,
    rating     numeric(2, 1) check (rating >= 0 and rating <= 5),
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