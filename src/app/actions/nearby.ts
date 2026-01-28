'use server'

import {createClient} from '@/utils/supabase/server'
import {Cafe} from '@/types/database'

export interface PopularCafe extends Cafe {
	visit_count: number
	avg_rating: number | null
	distance_km: number
}

export async function getNearbyPopularCafes(lat: number, lng: number, radiusKm: number = 20): Promise<PopularCafe[]> {
	const supabase = await createClient()

	const {data, error} = await supabase.rpc('get_popular_nearby_cafes', {
		user_lat: lat,
		user_lng: lng,
		radius_km: radiusKm
	})

	if (error) {
		console.error('Error fetching nearby cafes:', error)
		return []
	}

	return data as PopularCafe[]
}
