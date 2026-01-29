-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. Table: profiles (Public user data) - Must be first for FKs
create table if not exists profiles
(
    id                uuid references auth.users on delete cascade not null primary key,
    updated_at        timestamp with time zone,
    username          text unique,
    full_name         text,
    avatar_url        text,
    website           text,
    favorite_cafe_ids uuid[],

    constraint username_length check (char_length(username) >= 3),
    constraint favorite_cafe_ids_length check (coalesce(array_length(favorite_cafe_ids, 1), 0) <= 3)
);

alter table profiles
    enable row level security;

drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone."
    on profiles for select
    using (true);

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile."
    on profiles for insert
    with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on profiles;
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
create table if not exists cafes
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

drop policy if exists "Cafes are viewable by everyone" on cafes;
create policy "Cafes are viewable by everyone"
    on cafes for select
    using (true);

drop policy if exists "Cafes can be inserted by authenticated users" on cafes;
create policy "Cafes can be inserted by authenticated users"
    on cafes for insert
    with check (auth.role() = 'authenticated');

drop policy if exists "Cafes can be updated by authenticated users" on cafes;
create policy "Cafes can be updated by authenticated users"
    on cafes for update
    using (auth.role() = 'authenticated');


-- 3. Table: deems
create table if not exists deems
(
    id         uuid primary key         default gen_random_uuid(),
    user_id    uuid references profiles (id) not null, -- Changed to reference profiles
    cafe_id    uuid references cafes (id)    not null,
    rating     numeric(2, 1) check (rating >= 0 and rating <= 5),
    review     text,
    brew_method text,
    bean_origin text,
    roaster    text,
    tags       text[],
    price      numeric(10, 2),
    visited_at timestamp with time zone default now(),
    liked      boolean                  default false,
    created_at timestamp with time zone default now()
);

-- RLS for deems
alter table deems
    enable row level security;

drop policy if exists "Deems are viewable by everyone" on deems;
create policy "Deems are viewable by everyone"
    on deems for select
    using (true);

drop policy if exists "Users can insert their own deems" on deems;
create policy "Users can insert their own deems"
    on deems for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can update their own deems" on deems;
create policy "Users can update their own deems"
    on deems for update
    using (auth.uid() = user_id);

drop policy if exists "Users can delete their own deems" on deems;
create policy "Users can delete their own deems"
    on deems for delete
    using (auth.uid() = user_id);


-- 4. Table: watchlist
create table if not exists watchlist
(
    user_id    uuid references auth.users on delete cascade not null,
    cafe_id    uuid references cafes (id) on delete cascade not null,
    created_at timestamp with time zone default now(),
    primary key (user_id, cafe_id)
);

-- RLS for watchlist
alter table watchlist
    enable row level security;

drop policy if exists "Watchlists are viewable by everyone" on watchlist;
create policy "Watchlists are viewable by everyone"
    on watchlist for select
    using (true);

drop policy if exists "Users can insert into their own watchlist" on watchlist;
create policy "Users can insert into their own watchlist"
    on watchlist for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can delete from their own watchlist" on watchlist;
create policy "Users can delete from their own watchlist"
    on watchlist for delete
    using (auth.uid() = user_id);


-- 5. Location Support
alter table cafes
    add column if not exists latitude double precision;
alter table cafes
    add column if not exists longitude double precision;

create or replace function get_popular_nearby_cafes(
    user_lat double precision,
    user_lng double precision,
    radius_km double precision default 20
)
    returns table
            (
                id          uuid,
                name        text,
                address     text,
                place_id    text,
                cover_image text,
                latitude    double precision,
                longitude   double precision,
                visit_count bigint,
                avg_rating  numeric,
                distance_km double precision
            )
    language plpgsql
    security definer
as
$$
begin
    return query
        select c.id,
               c.name,
               c.address,
               c.place_id,
               c.cover_image,
               c.latitude,
               c.longitude,
               count(d.id)   as visit_count,
               avg(d.rating) as avg_rating,
               (
                   6371 * acos(
                           least(1.0, greatest(-1.0,
                                               cos(radians(user_lat)) * cos(radians(c.latitude)) *
                                               cos(radians(c.longitude) - radians(user_lng)) +
                                               sin(radians(user_lat)) * sin(radians(c.latitude))
                                      ))
                          )
                   )         as distance_km
        from cafes c
                 left join deems d on c.id = d.cafe_id
        where c.latitude is not null
          and c.longitude is not null
        group by c.id
        having (
                   6371 * acos(
                           least(1.0, greatest(-1.0,
                                               cos(radians(user_lat)) * cos(radians(c.latitude)) *
                                               cos(radians(c.longitude) - radians(user_lng)) +
                                               sin(radians(user_lat)) * sin(radians(c.latitude))
                                      ))
                          )
                   ) <= radius_km
        order by visit_count desc, avg_rating desc;
end;
$$;


-- 6. Table: follows
create table if not exists follows
(
    follower_id  uuid references profiles (id) on delete cascade not null,
    following_id uuid references profiles (id) on delete cascade not null,
    created_at   timestamp with time zone default now(),
    primary key (follower_id, following_id),
    constraint distinct_users check (follower_id <> following_id)
);

-- RLS for follows
alter table follows
    enable row level security;

drop policy if exists "Follows are viewable by everyone" on follows;
create policy "Follows are viewable by everyone"
    on follows for select
    using (true);

drop policy if exists "Users can follow others" on follows;
create policy "Users can follow others"
    on follows for insert
    with check (auth.uid() = follower_id);

drop policy if exists "Users can unfollow others" on follows;
create policy "Users can unfollow others"
    on follows for delete
    using (auth.uid() = follower_id);


-- 7. Table: lists (User created lists)
create table if not exists lists
(
    id          uuid primary key         default gen_random_uuid(),
    user_id     uuid references profiles (id) on delete cascade not null,
    title       text not null,
    description text,
    is_ranked   boolean                  default false,
    created_at  timestamp with time zone default now(),
    updated_at  timestamp with time zone default now()
);

-- RLS for lists
alter table lists
    enable row level security;

drop policy if exists "Lists are viewable by everyone" on lists;
create policy "Lists are viewable by everyone"
    on lists for select
    using (true);

drop policy if exists "Users can create their own lists" on lists;
create policy "Users can create their own lists"
    on lists for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can update their own lists" on lists;
create policy "Users can update their own lists"
    on lists for update
    using (auth.uid() = user_id);

drop policy if exists "Users can delete their own lists" on lists;
create policy "Users can delete their own lists"
    on lists for delete
    using (auth.uid() = user_id);


-- 8. Table: list_items (Items in a list)
create table if not exists list_items
(
    id         uuid primary key         default gen_random_uuid(),
    list_id    uuid references lists (id) on delete cascade not null,
    cafe_id    uuid references cafes (id) on delete cascade not null,
    "order"    integer, -- For ranked lists
    note       text,
    created_at timestamp with time zone default now(),
    
    unique(list_id, cafe_id) -- Prevent duplicate cafes in the same list
);

-- RLS for list_items
alter table list_items
    enable row level security;

drop policy if exists "List items are viewable by everyone" on list_items;
create policy "List items are viewable by everyone"
    on list_items for select
    using (true);

drop policy if exists "Users can manage items in their own lists" on list_items;
create policy "Users can manage items in their own lists"
    on list_items for all
    using (
        exists (
            select 1 from lists
            where lists.id = list_items.list_id
            and lists.user_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from lists
            where lists.id = list_items.list_id
            and lists.user_id = auth.uid()
        )
    );


-- 9. Table: cafe_photos (User uploaded photos for cafes)
create table if not exists cafe_photos
(
    id         uuid primary key         default gen_random_uuid(),
    cafe_id    uuid references cafes (id) on delete cascade not null,
    user_id    uuid references profiles (id) on delete cascade not null,
    url        text not null,
    caption    text,
    created_at timestamp with time zone default now()
);

-- RLS for cafe_photos
alter table cafe_photos
    enable row level security;

drop policy if exists "Cafe photos are viewable by everyone" on cafe_photos;
create policy "Cafe photos are viewable by everyone"
    on cafe_photos for select
    using (true);

drop policy if exists "Users can upload photos" on cafe_photos;
create policy "Users can upload photos"
    on cafe_photos for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own photos" on cafe_photos;
create policy "Users can delete their own photos"
    on cafe_photos for delete
    using (auth.uid() = user_id);


-- 10. Table: photo_likes (Likes on cafe photos)
create table if not exists photo_likes
(
    user_id    uuid references auth.users (id) on delete cascade not null,
    photo_id   uuid references cafe_photos (id) on delete cascade not null,
    created_at timestamp with time zone default now(),
    primary key (user_id, photo_id)
);

-- RLS for photo_likes
alter table photo_likes
    enable row level security;

drop policy if exists "Photo likes are viewable by everyone" on photo_likes;
create policy "Photo likes are viewable by everyone"
    on photo_likes for select
    using (true);

drop policy if exists "Users can like photos" on photo_likes;
create policy "Users can like photos"
    on photo_likes for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can unlike photos" on photo_likes;
create policy "Users can unlike photos"
    on photo_likes for delete
    using (auth.uid() = user_id);


-- 11. Function: get_cafe_cover_photo
-- Returns the URL of the most liked photo for a given cafe_id
create or replace function get_cafe_cover_photo(target_cafe_id uuid)
    returns text
    language plpgsql
    security definer
as
$$
declare
    cover_url text;
begin
    select cp.url
    into cover_url
    from cafe_photos cp
             left join photo_likes pl on cp.id = pl.photo_id
    where cp.cafe_id = target_cafe_id
    group by cp.id
    order by count(pl.user_id) desc, cp.created_at desc
    limit 1;

    return cover_url;
end;
$$;
