'use server'

import {createClient} from '@/utils/supabase/server'
import type {Cafe, Deem, DeemInsert, Profile, Watchlist} from '@/types/database'
import {revalidatePath} from 'next/cache'
import {SupabaseClient} from '@supabase/supabase-js'
import {parseCurrency, parseNumber, parseString, parseTags} from '@/utils/parsers'

// --- Types ---

export type DeemWithDetails = Deem & {
	cafe: Pick<Cafe, 'id' | 'name' | 'place_id' | 'address'> & {
		isSaved: boolean
	}
	profile: Pick<Profile, 'full_name' | 'username' | 'avatar_url'>
}

type CafeSummary = Pick<Cafe, 'id' | 'name' | 'place_id' | 'address'>
type ProfileSummary = Pick<Profile, 'id' | 'full_name' | 'username' | 'avatar_url'>
type WatchlistCafe = Pick<Watchlist, 'cafe_id'>

// --- Helpers: Logic ---

/**
 * Retrieves the current authenticated user or throws an error if not logged in.
 *
 * @param supabase - The Supabase client instance.
 * @returns The authenticated user.
 * @throws Error if the user is not authenticated.
 */
async function getUserOrThrow(supabase: SupabaseClient) {
	const {
		data: {user},
	} = await supabase.auth.getUser()

	if (!user) {
		throw new Error('You must be logged in to log a visit')
	}
	return user
}

/**
 * Extracts and parses Deem data from a FormData object.
 *
 * @param formData - The form data containing visit details.
 * @param userId - The ID of the user logging the visit.
 * @returns A DeemInsert object ready for database insertion.
 * @throws Error if the cafe_id is missing.
 */
function extractDeemData(formData: FormData, userId: string): DeemInsert {
	const cafeId = parseString(formData.get('cafe_id'))
	if (!cafeId) {
		throw new Error('Missing cafe id')
	}

	return {
		user_id: userId,
		cafe_id: cafeId,
		rating: parseNumber(formData.get('rating')),
		review: parseString(formData.get('review')),
		brew_method: parseString(formData.get('brew_method')),
		bean_origin: parseString(formData.get('bean_origin')),
		roaster: parseString(formData.get('roaster')),
		tags: parseTags(formData.get('tags')),
		price: parseCurrency(formData.get('price')),
		liked: formData.get('liked') === 'on',
		visited_at: parseString(formData.get('visited_at')) || new Date().toISOString(),
	}
}

/**
 * Persists a new Deem record to the database.
 *
 * @param supabase - The Supabase client instance.
 * @param deemData - The Deem data to insert.
 * @throws Error if the insertion fails.
 */
async function saveDeem(supabase: SupabaseClient, deemData: DeemInsert) {
	const {error} = await supabase.from('deems').insert(deemData)

	if (error) {
		console.error('Error logging coffee:', error)
		throw new Error(error.message || 'Error saving visit')
	}
}

/**
 * Fetches the most recent raw Deem records from the database.
 *
 * @param supabase - The Supabase client instance.
 * @returns An array of Deem records.
 */
async function fetchRawDeems(supabase: SupabaseClient) {
	const {data, error} = await supabase
		.from('deems')
		.select('*')
		.order('created_at', {ascending: false})
		.limit(20)

	if (error) {
		console.error('Error fetching deems table:', error)
		return []
	}
	return (data ?? []) as Deem[]
}

/**
 * Fetches related entities (Cafes, Profiles, Watchlist) for a given set of Deems.
 *
 * @param supabase - The Supabase client instance.
 * @param deems - The list of Deems to fetch relations for.
 * @returns An object containing arrays of related entities.
 */
async function fetchRelatedEntities(supabase: SupabaseClient, deems: Deem[]) {
	const cafeIds = Array.from(new Set(deems.map((d) => d.cafe_id)))
	const userIds = Array.from(new Set(deems.map((d) => d.user_id)))

	const {
		data: {user},
	} = await supabase.auth.getUser()

	const [cafesResult, profilesResult, watchlistResult] = await Promise.all([
		supabase.from('cafes').select('id, name, place_id, address').in('id', cafeIds),
		supabase.from('profiles').select('id, full_name, username, avatar_url').in('id', userIds),
		user
			? supabase.from('watchlist').select('cafe_id').eq('user_id', user.id).in('cafe_id', cafeIds)
			: Promise.resolve({data: [], error: null}),
	])

	if (cafesResult.error) console.error('Error fetching cafes:', cafesResult.error)
	if (profilesResult.error) console.error('Error fetching profiles:', profilesResult.error)

	return {
		cafes: (cafesResult.data as CafeSummary[]) ?? [],
		profiles: (profilesResult.data as ProfileSummary[]) ?? [],
		watchlist: (watchlistResult.data as WatchlistCafe[]) ?? [],
	}
}

/**
 * Maps raw Deem records to a detailed structure including related Cafe and Profile information.
 *
 * @param deems - The raw Deem records.
 * @param cafes - The related Cafe summaries.
 * @param profiles - The related Profile summaries.
 * @param watchlist - The user's watchlist entries for these cafes.
 * @returns An array of Deems with full details.
 */
function mapDeemsToDetails(
	deems: Deem[],
	cafes: CafeSummary[],
	profiles: ProfileSummary[],
	watchlist: WatchlistCafe[]
): DeemWithDetails[] {
	const cafeMap = new Map(cafes.map((c) => [c.id, c]))
	const profileMap = new Map(profiles.map((p) => [p.id, p]))
	const watchlistSet = new Set(watchlist.map((w) => w.cafe_id))

	return deems.map((deem) => {
		const cafe = cafeMap.get(deem.cafe_id)
		const profile = profileMap.get(deem.user_id)

		return {
			...deem,
			cafe: cafe
				? {...cafe, isSaved: watchlistSet.has(cafe.id)}
				: {
					id: deem.cafe_id,
					name: 'Unknown Cafe',
					place_id: '',
					address: null,
					isSaved: false
				},
			profile: profile ?? {full_name: 'Unknown User', username: 'unknown', avatar_url: null},
		}
	})
}

// --- Actions ---

/**
 * Logs a new coffee visit (Deem).
 *
 * @param formData - The form data containing visit details.
 */
export async function logCoffee(formData: FormData) {
	const supabase = await createClient()
	const user = await getUserOrThrow(supabase)
	const deemData = extractDeemData(formData, user.id)
	await saveDeem(supabase, deemData)
	revalidatePath('/')
}

/**
 * Fetches the most recent Deems (visits) with related Café and Profile details.
 *
 * @returns A promise resolving to an array of DeemWithDetails.
 */
export async function getRecentDeems(): Promise<DeemWithDetails[]> {
	const supabase = await createClient()

	try {
		const deems = await fetchRawDeems(supabase)
		if (deems.length === 0) return []

		const {cafes, profiles, watchlist} = await fetchRelatedEntities(supabase, deems)

		return mapDeemsToDetails(deems, cafes, profiles, watchlist)
	} catch (e) {
		console.error('Unexpected error in getRecentDeems:', e)
		return []
	}
}
