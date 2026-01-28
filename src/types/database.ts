export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[]

export interface Cafe {
	id: string
	name: string
	address: string | null
	place_id: string
	cover_image: string | null
	created_at: string
}

export interface Deem {
	id: string
	user_id: string
	cafe_id: string
	rating: number | null
	review: string | null
	visited_at: string
	liked: boolean | null
	created_at: string
}

export interface Watchlist {
	user_id: string
	cafe_id: string
	created_at: string
}

// Helper types for Insert operations (useful for Server Actions)
export interface CafeInsert {
	name: string
	address?: string | null
	place_id: string
	cover_image?: string | null
}

export interface DeemInsert {
	user_id: string
	cafe_id: string
	rating?: number | null
	review?: string | null
	visited_at?: string
	liked?: boolean
}

export interface WatchlistInsert {
	user_id: string
	cafe_id: string
	created_at?: string
}

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
