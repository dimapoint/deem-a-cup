export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Represents a coffee shop entity in the 'cafes' table.
 * Stores the Google Places ID and basic location info.
 */
export interface Cafe {
  id: string
  name: string
  address: string | null
  place_id: string
  cover_image: string | null
  created_at: string
  latitude?: number | null
  longitude?: number | null
}

/**
 * Represents a 'Deem' - a user's log/review of a coffee visit.
 * Corresponds to the 'deems' table.
 */
export interface Deem {
  id: string
  user_id: string
  cafe_id: string
  rating: number | null
  review: string | null
  brew_method: string | null
  bean_origin: string | null
  roaster: string | null
  tags: string[] | null
  price: number | null
  visited_at: string
  liked: boolean | null
  created_at: string
}

/**
 * Join table for users tracking cafes they want to visit.
 */
export interface Watchlist {
  user_id: string
  cafe_id: string
  created_at: string
}

/**
 * Social connection between users.
 */
export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

/**
 * User-created collections of cafes.
 * Can be ordered (ranked) or unordered.
 */
export interface List {
  id: string
  user_id: string
  title: string
  description: string | null
  is_ranked: boolean
  created_at: string
  updated_at: string
}

/**
 * An individual entry in a user's List.
 */
export interface ListItem {
  id: string
  list_id: string
  cafe_id: string
  order: number | null
  note: string | null
  created_at: string
}

/**
 * User-uploaded photos associated with a specific cafe.
 */
export interface CafePhoto {
  id: string
  cafe_id: string
  user_id: string
  url: string
  caption: string | null
  created_at: string
}

/**
 * Likes on cafe photos.
 */
export interface PhotoLike {
  user_id: string
  photo_id: string
  created_at: string
}

/**
 * Helper type for inserting a new Cafe.
 */
// Helper types for Insert operations (useful for Server Actions)
export interface CafeInsert {
  name: string
  address?: string | null
  place_id: string
  cover_image?: string | null
  latitude?: number | null
  longitude?: number | null
}

/**
 * Helper type for inserting a new Deem (Log).
 */
export interface DeemInsert {
  user_id: string
  cafe_id: string
  rating?: number | null
  review?: string | null
  brew_method?: string | null
  bean_origin?: string | null
  roaster?: string | null
  tags?: string[] | null
  price?: number | null
  visited_at?: string
  liked?: boolean
}

export interface WatchlistInsert {
  user_id: string
  cafe_id: string
  created_at?: string
}

export interface FollowInsert {
  follower_id: string
  following_id: string
  created_at?: string
}

export interface ListInsert {
  user_id: string
  title: string
  description?: string | null
  is_ranked?: boolean
  created_at?: string
  updated_at?: string
}

export interface ListItemInsert {
  list_id: string
  cafe_id: string
  order?: number | null
  note?: string | null
  created_at?: string
}

export interface CafePhotoInsert {
  cafe_id: string
  user_id: string
  url: string
  caption?: string | null
  created_at?: string
}

export interface PhotoLikeInsert {
  user_id: string
  photo_id: string
  created_at?: string
}

/**
 * Public user profile information.
 * Mirrors the 'profiles' table which extends the auth.users table.
 */
export interface Profile {
  id: string
  updated_at: string | null
  username: string | null
  full_name: string | null
  avatar_url: string | null
  website: string | null
  favorite_cafe_ids: string[] | null
}

export interface ProfileInsert {
  id: string
  updated_at?: string
  username?: string
  full_name?: string
  avatar_url?: string
  website?: string
  favorite_cafe_ids?: string[] | null
}
