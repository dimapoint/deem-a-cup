'use server'

import {createClient} from '@/utils/supabase/server'
import {Cafe, Deem} from '@/types/database'

export interface PopularCafe extends Cafe {
	visit_count: number
	avg_rating: number | null
	distance_km: number
}

type CafeRating = Pick<Deem, 'cafe_id' | 'rating'>

const EARTH_RADIUS_KM = 6371

const toRadians = (value: number) => value * (Math.PI / 180)

const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
	const dLat = toRadians(lat2 - lat1)
	const dLng = toRadians(lng2 - lng1)
	const lat1Rad = toRadians(lat1)
	const lat2Rad = toRadians(lat2)
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLng / 2) ** 2
	return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const getBoundingBox = (lat: number, lng: number, radiusKm: number) => {
	const latDelta = radiusKm / 111.32
	const cosLat = Math.max(Math.cos(toRadians(lat)), 0.00001)
	const lngDelta = radiusKm / (111.32 * cosLat)
	return {
		minLat: lat - latDelta,
		maxLat: lat + latDelta,
		minLng: lng - lngDelta,
		maxLng: lng + lngDelta,
	}
}

const getNearbyPopularCafesFallback = async (
	supabase: Awaited<ReturnType<typeof createClient>>,
	lat: number,
	lng: number,
	radiusKm: number
): Promise<PopularCafe[]> => {
	const bounds = getBoundingBox(lat, lng, radiusKm)
	const {data: cafesData, error: cafesError} = await supabase
		.from('cafes')
		.select('id,name,address,place_id,cover_image,created_at,latitude,longitude')
		.not('latitude', 'is', null)
		.not('longitude', 'is', null)
		.gte('latitude', bounds.minLat)
		.lte('latitude', bounds.maxLat)
		.gte('longitude', bounds.minLng)
		.lte('longitude', bounds.maxLng)

	if (cafesError) {
		console.error('Error fetching cafes for nearby fallback:', cafesError)
		return []
	}

	const cafes = (cafesData ?? []) as Cafe[]
	const cafesWithinRadius = cafes
		.map((cafe) => {
			if (cafe.latitude == null || cafe.longitude == null) return null
			const distanceKm = getDistanceKm(lat, lng, cafe.latitude, cafe.longitude)
			if (distanceKm > radiusKm) return null
			return {cafe, distanceKm}
		})
		.filter((entry): entry is { cafe: Cafe; distanceKm: number } => entry !== null)

	if (cafesWithinRadius.length === 0) return []

	const cafeIds = cafesWithinRadius.map(({cafe}) => cafe.id)
	const {data: deemsData, error: deemsError} = await supabase
		.from('deems')
		.select('cafe_id,rating')
		.in('cafe_id', cafeIds)

	if (deemsError) {
		console.error('Error fetching deems for nearby fallback:', deemsError)
	}

	const stats = new Map<string, { count: number; ratingTotal: number; ratingCount: number }>()
	for (const deem of (deemsData ?? []) as CafeRating[]) {
		const entry = stats.get(deem.cafe_id) ?? {count: 0, ratingTotal: 0, ratingCount: 0}
		entry.count += 1
		if (deem.rating != null) {
			entry.ratingTotal += Number(deem.rating)
			entry.ratingCount += 1
		}
		stats.set(deem.cafe_id, entry)
	}

	const results = cafesWithinRadius.map(({cafe, distanceKm}) => {
		const entry = stats.get(cafe.id)
		const avgRating = entry && entry.ratingCount > 0 ? entry.ratingTotal / entry.ratingCount : null
		return {
			...cafe,
			visit_count: entry?.count ?? 0,
			avg_rating: avgRating,
			distance_km: distanceKm,
		}
	})

	results.sort((a, b) => {
		if (b.visit_count !== a.visit_count) return b.visit_count - a.visit_count
		const aRating = a.avg_rating ?? -1
		const bRating = b.avg_rating ?? -1
		if (bRating !== aRating) return bRating - aRating
		return a.distance_km - b.distance_km
	})

	return results
}

export async function getNearbyPopularCafes(lat: number, lng: number, radiusKm: number = 20): Promise<PopularCafe[]> {
	const supabase = await createClient()

	const {data, error} = await supabase.rpc('get_popular_nearby_cafes', {
		user_lat: lat,
		user_lng: lng,
		radius_km: radiusKm
	})

	if (!error) {
		return data as PopularCafe[]
	}

	if (error.code !== 'PGRST202') {
		console.error('Error fetching nearby cafes:', error)
		return []
	}

	console.warn('RPC get_popular_nearby_cafes missing, using fallback query.')
	return getNearbyPopularCafesFallback(supabase, lat, lng, radiusKm)
}
