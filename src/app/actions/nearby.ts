'use server'

import {createClient} from '@/utils/supabase/server'
import {Cafe, Deem} from '@/types/database'

/**
 * Extended Cafe interface including calculated statistics and distance.
 */
export interface PopularCafe extends Cafe {
	/** Total number of visits/deems for this cafe */
	visit_count: number
	/** Average rating from all deems (null if no ratings) */
	avg_rating: number | null
	/** Distance from the user in kilometers */
	distance_km: number
}

type CafeRating = Pick<Deem, 'cafe_id' | 'rating'>

const EARTH_RADIUS_KM = 6371

/**
 * Converts degrees to radians.
 * @param value Value in degrees
 */
const toRadians = (value: number) => value * (Math.PI / 180)

/**
 * Calculates the distance between two coordinates using the Haversine formula.
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
	const dLat = toRadians(lat2 - lat1)
	const dLng = toRadians(lng2 - lng1)
	const lat1Rad = toRadians(lat1)
	const lat2Rad = toRadians(lat2)

	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLng / 2) ** 2

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	return EARTH_RADIUS_KM * c
}

/**
 * Calculates a bounding box for a given coordinate and radius.
 * Used to optimize database queries by pre-filtering coordinates.
 *
 * @param lat Center latitude
 * @param lng Center longitude
 * @param radiusKm Radius in kilometers
 */
const getBoundingBox = (lat: number, lng: number, radiusKm: number) => {
	// 1 degree of latitude is approximately 111.32 km
	const latDelta = radiusKm / 111.32
	// Adjust longitude delta based on latitude (converges at poles)
	const cosLat = Math.max(Math.cos(toRadians(lat)), 0.00001)
	const lngDelta = radiusKm / (111.32 * cosLat)

	return {
		minLat: lat - latDelta,
		maxLat: lat + latDelta,
		minLng: lng - lngDelta,
		maxLng: lng + lngDelta,
	}
}

/**
 * Fallback implementation to find nearby popular cafes using application-side logic.
 * This is used when the database RPC function is unavailable.
 *
 * 1. Fetches cafes within a rough bounding box.
 * 2. Filters precisely by radius.
 * 3. Fetches and aggregates ratings/visits.
 * 4. Sorts by popularity and distance.
 */
const getNearbyPopularCafesFallback = async (
	supabase: Awaited<ReturnType<typeof createClient>>,
	lat: number,
	lng: number,
	radiusKm: number
): Promise<PopularCafe[]> => {
	const bounds = getBoundingBox(lat, lng, radiusKm)

	// 1. Fetch cafes within bounding box
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

	// 2. Filter by exact radius and calculate distance
	const cafesWithinRadius = cafes
		.map((cafe) => {
			if (cafe.latitude == null || cafe.longitude == null) return null
			const distanceKm = getDistanceKm(lat, lng, cafe.latitude, cafe.longitude)
			return distanceKm <= radiusKm ? {cafe, distanceKm} : null
		})
		.filter((entry): entry is { cafe: Cafe; distanceKm: number } => entry !== null)

	if (cafesWithinRadius.length === 0) return []

	// 3. Fetch stats (deems) for these cafes
	const cafeIds = cafesWithinRadius.map(({cafe}) => cafe.id)
	const {data: deemsData, error: deemsError} = await supabase
		.from('deems')
		.select('cafe_id,rating')
		.in('cafe_id', cafeIds)

	if (deemsError) {
		console.error('Error fetching deems for nearby fallback:', deemsError)
	}

	// 4. Aggregate stats
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

	// 5. Combine and sort
	const results = cafesWithinRadius.map(({cafe, distanceKm}) => {
		const entry = stats.get(cafe.id)
		const avgRating = entry && entry.ratingCount > 0
			? entry.ratingTotal / entry.ratingCount
			: null

		return {
			...cafe,
			visit_count: entry?.count ?? 0,
			avg_rating: avgRating,
			distance_km: distanceKm,
		}
	})

	// Sort by: Visit Count (desc) -> Avg Rating (desc) -> Distance (asc)
	return results.sort((a, b) => {
		if (b.visit_count !== a.visit_count) return b.visit_count - a.visit_count

		const aRating = a.avg_rating ?? -1
		const bRating = b.avg_rating ?? -1
		if (bRating !== aRating) return bRating - aRating

		return a.distance_km - b.distance_km
	})
}

/**
 * Retrieves a list of popular cafes near a specific location.
 *
 * Attempts to use a database RPC function `get_popular_nearby_cafes` for performance.
 * Falls back to application-side calculation if the RPC is missing.
 *
 * @param lat User's latitude
 * @param lng User's longitude
 * @param radiusKm Search radius in kilometers (default: 20)
 * @returns List of cafes with stats, sorted by popularity
 */
export async function getNearbyPopularCafes(
	lat: number,
	lng: number,
	radiusKm: number = 20
): Promise<PopularCafe[]> {
	const supabase = await createClient()

	// Try RPC first
	const {data, error} = await supabase.rpc('get_popular_nearby_cafes', {
		user_lat: lat,
		user_lng: lng,
		radius_km: radiusKm
	})

	if (!error) {
		return data as PopularCafe[]
	}

	// Check if error is "function not found" (PGRST202)
	if (error.code !== 'PGRST202') {
		console.error('Error fetching nearby cafes via RPC:', error)
		return []
	}

	console.warn('RPC get_popular_nearby_cafes missing, using fallback query.')
	return getNearbyPopularCafesFallback(supabase, lat, lng, radiusKm)
}
