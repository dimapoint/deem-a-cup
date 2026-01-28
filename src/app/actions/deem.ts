'use server'

import {createClient} from '@/utils/supabase/server'
import {revalidatePath} from 'next/cache'

export async function logCoffee(formData: FormData) {
	const supabase = await createClient()

	const {
		data: {user},
	} = await supabase.auth.getUser()

	if (!user) {
		throw new Error('You must be logged in to log a visit')
	}

	const cafe_id = formData.get('cafe_id') as string
	const ratingRaw = formData.get('rating')
	const review = formData.get('review') as string
	const likedRaw = formData.get('liked')
	const visitedAtRaw = formData.get('visited_at') as string

	const rating = ratingRaw ? Number(ratingRaw) : null
	const liked = likedRaw === 'on'

	const {error} = await supabase.from('deems').insert({
		user_id: user.id,
		cafe_id,
		rating,
		review,
		liked,
		visited_at: visitedAtRaw || undefined
	})

	if (error) {
		console.error('Error logging coffee:', error)
		throw new Error('Error saving visit')
	}

	revalidatePath('/')
}

export type DeemWithDetails = {
	id: string
	rating: number | null
	review: string | null
	liked: boolean | null
	visited_at: string
	created_at: string
	user_id: string
	cafe: {
		id: string
		name: string
		place_id: string
		address: string | null
		isSaved: boolean
	}
	profile: {
		full_name: string | null
		username: string | null
		avatar_url: string | null
	}
}

export async function getRecentDeems(): Promise<DeemWithDetails[]> {
	const supabase = await createClient()

	try {
		// 1. Fetch Deems first
		const {data: deems, error: deemsError} = await supabase
			.from('deems')
			.select('*')
			.order('created_at', {ascending: false})
			.limit(20)

		if (deemsError) {
			console.error('Error fetching deems table:', deemsError)
			return []
		}

		if (!deems || deems.length === 0) {
			return []
		}

		// 2. Extract IDs for batch fetching
		const cafeIds = Array.from(new Set(deems.map((d: any) => d.cafe_id)))
		const userIds = Array.from(new Set(deems.map((d: any) => d.user_id)))

		// 3. Fetch related data in parallel (including watchlist)
		const {data: {user}} = await supabase.auth.getUser()

		const promises: Promise<any>[] = [
			supabase.from('cafes').select('id, name, place_id, address').in('id', cafeIds),
			supabase.from('profiles').select('id, full_name, username, avatar_url').in('id', userIds)
		]

		if (user) {
			promises.push(
				supabase.from('watchlist')
					.select('cafe_id')
					.eq('user_id', user.id)
					.in('cafe_id', cafeIds)
			)
		}

		const results = await Promise.all(promises)
		const cafesResult = results[0]
		const profilesResult = results[1]
		const watchlistResult = user ? results[2] : {data: []}

		if (cafesResult.error) {
			console.error('Error fetching cafes:', cafesResult.error)
		}
		if (profilesResult.error) {
			console.error('Error fetching profiles:', profilesResult.error)
		}

		const cafes = cafesResult.data || []
		const profiles = profilesResult.data || []
		const watchlist = watchlistResult.data || []
		const watchlistSet = new Set(watchlist.map((w: any) => w.cafe_id))

		// 4. Map data back to deems
		const cafeMap = new Map(cafes.map((c: any) => [c.id, c]))
		const profileMap = new Map(profiles.map((p: any) => [p.id, p]))

		const deemsWithDetails = deems.map((deem: any) => {
			const cafe = cafeMap.get(deem.cafe_id)
			const profile = profileMap.get(deem.user_id)

			// If for some reason the relation is missing (shouldn't happen with FKs), provide
			// fallback
			return {
				...deem,
				cafe: cafe ? {
					...cafe,
					isSaved: watchlistSet.has(cafe.id)
				} : {
					id: deem.cafe_id,
					name: 'Unknown Cafe',
					place_id: '',
					address: null,
					isSaved: false
				},
				profile: profile || {
					full_name: 'Unknown User',
					username: 'unknown',
					avatar_url: null
				}
			}
		})

		return deemsWithDetails as DeemWithDetails[]

	} catch (e) {
		console.error('Unexpected error in getRecentDeems:', e)
		return []
	}
}
