import {SupabaseClient} from '@supabase/supabase-js'
import {CafeCore, CafeSummary, DeemWithCafe, ProfileRow} from '@/types/profile'

/**
 * Calculates statistical metrics for a user's profile based on their logged deems.
 *
 * @param deems - Array of deems (logs) associated with the user, including cafe details.
 * @returns An object containing:
 *  - `averageRating`: The mean rating of all rated deems, or null if no ratings exist.
 *  - `likedCount`: The total number of deems marked as liked.
 *  - `uniqueCafeCount`: The count of distinct cafes visited.
 */
export function calculateProfileStats(deems: DeemWithCafe[]) {
	const ratedDeems = deems
		.map((deem) => deem.rating)
		.filter((rating): rating is number => rating !== null)

	const averageRating = ratedDeems.length > 0
		? (ratedDeems.reduce((total, rating) => total + rating, 0) / ratedDeems.length)
		: null

	const likedCount = deems.filter((deem) => deem.liked === true).length
	const uniqueCafeCount = new Set(
		deems.flatMap((deem) => (deem.cafe ? [deem.cafe.id] : []))
	).size

	return {
		averageRating,
		likedCount,
		uniqueCafeCount
	}
}

/**
 * Aggregates and retrieves cafe data for a user profile, including visited cafes and favorites.
 * Fetches missing favorite cafe details from the database if they haven't been visited (and thus aren't in the deems list).
 *
 * @param profile - The user's profile data containing favorite cafe IDs.
 * @param deems - Array of deems (logs) associated with the user.
 * @param supabase - Supabase client instance for fetching additional cafe data.
 * @returns A promise resolving to an object containing:
 *  - `favoriteCafes`: List of CafeCore objects for the user's favorite cafes.
 *  - `visitedCafes`: List of CafeCore objects for all cafes the user has deemed, sorted by name.
 *  - `selectableCafes`: Combined list of favorites and visited cafes, unique and sorted by name.
 *  - `favoriteCafeIds`: Array of IDs for the user's favorite cafes.
 */
export async function getProfileCafes(
	profile: ProfileRow,
	deems: DeemWithCafe[],
	supabase: SupabaseClient
) {
	const cafeCounts = deems.reduce((accumulator, deem) => {
		if (!deem.cafe) {
			return accumulator
		}

		const existing = accumulator.get(deem.cafe.id)
		if (existing) {
			existing.visits += 1
		} else {
			accumulator.set(deem.cafe.id, {cafe: deem.cafe, visits: 1})
		}

		return accumulator
	}, new Map<string, CafeSummary>())

	const favoriteCafeIds = Array.from(new Set(
		(profile.favorite_cafe_ids ?? [])
			.filter((id): id is string => id.length > 0)
	))

	const visitedCafeMap = new Map<string, CafeCore>()
	for (const entry of cafeCounts.values()) {
		visitedCafeMap.set(entry.cafe.id, entry.cafe)
	}

	const cafeById = new Map(visitedCafeMap)

	let favoriteCafes = favoriteCafeIds
		.map((id) => cafeById.get(id))
		.filter((cafe): cafe is CafeCore => Boolean(cafe))

	const missingFavoriteIds = favoriteCafeIds.filter((id) => !cafeById.has(id))
	if (missingFavoriteIds.length > 0) {
		const {data: favoriteCafeResults, error: favoriteCafeError} = await supabase
			.from('cafes')
			.select('id, name, place_id, address')
			.in('id', missingFavoriteIds)

		if (favoriteCafeError) {
			console.error('Error fetching favorite cafes:', favoriteCafeError)
		}

		for (const cafe of favoriteCafeResults ?? []) {
			cafeById.set(cafe.id, cafe)
		}

		favoriteCafes = favoriteCafeIds
			.map((id) => cafeById.get(id))
			.filter((cafe): cafe is CafeCore => Boolean(cafe))
	}

	const visitedCafes = Array.from(visitedCafeMap.values())
		.sort((a, b) => a.name.localeCompare(b.name))

	const selectableCafeMap = new Map<string, CafeCore>()
	for (const cafe of [...favoriteCafes, ...visitedCafes]) {
		if (!selectableCafeMap.has(cafe.id)) {
			selectableCafeMap.set(cafe.id, cafe)
		}
	}
	const selectableCafes = Array.from(selectableCafeMap.values())
		.sort((a, b) => a.name.localeCompare(b.name))

	return {
		favoriteCafes,
		visitedCafes,
		selectableCafes,
		favoriteCafeIds
	}
}
