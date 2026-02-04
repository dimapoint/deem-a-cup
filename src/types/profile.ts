import {Cafe, Deem, Profile} from './database'

export type ProfileRow = Pick<Profile, 'id' | 'full_name' | 'username' | 'avatar_url' | 'website' | 'favorite_cafe_ids'>

export type CafeCore = Pick<Cafe, 'id' | 'name' | 'place_id' | 'address'>

export type DeemWithCafe =
	Pick<Deem, 'id' | 'rating' | 'review' | 'liked' | 'visited_at' | 'created_at'>
	& {
	cafe: CafeCore | null
}

export type CafeSummary = {
	cafe: CafeCore
	visits: number
}
