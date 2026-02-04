import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getUserLists } from '@/app/actions/lists'
import { getUserStats } from '@/app/actions/stats'
import { calculateProfileStats, getProfileCafes } from '@/utils/profile-calculations'
import { formatDate, formatMonthYear } from '@/utils/date'
import { DeemWithCafe, ProfileRow } from '@/types/profile'

export async function getProfilePageData() {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) {
		redirect('/login')
	}

	const [profileResult, deemsResult] = await Promise.all([
		supabase
			.from('profiles')
			.select('id, full_name, username, avatar_url, website, favorite_cafe_ids')
			.eq('id', user.id)
			.maybeSingle(),
		supabase
			.from('deems')
			.select(`
				id,
				rating,
				review,
				liked,
				visited_at,
				created_at,
				cafe:cafe_id (
					id,
					name,
					place_id,
					address
				)
			`)
			.eq('user_id', user.id)
			.order('visited_at', { ascending: false })
			.overrideTypes<DeemWithCafe[], { merge: false }>(),
	])

	// Fetch user lists and stats
	const [userLists, userStats] = await Promise.all([
		getUserLists(user.id),
		getUserStats(user.id),
	])

	if (profileResult.error) {
		console.error('Error fetching profile:', profileResult.error)
	}

	if (deemsResult.error) {
		console.error('Error fetching deems:', deemsResult.error)
	}

	const profile: ProfileRow = profileResult.data ?? {
		id: user.id,
		full_name: null,
		username: null,
		avatar_url: null,
		website: null,
		favorite_cafe_ids: [],
	}

	const deemsError = deemsResult.error
	const deems = deemsResult.data ?? []

	const displayName = profile.full_name || profile.username || user.email || 'Coffee fan'
	const memberSince = user.created_at ? formatMonthYear(user.created_at) : 'Unknown'
	const websiteUrl = profile.website
		? profile.website.startsWith('http')
			? profile.website
			: `https://${profile.website}`
		: null

	const { averageRating, likedCount, uniqueCafeCount } = calculateProfileStats(deems)
	const { favoriteCafes, selectableCafes, favoriteCafeIds } = await getProfileCafes(
		profile,
		deems,
		supabase
	)

	const favoriteSlots = [
		{ id: 'favorite_cafe_1', label: 'Favorite #1', value: favoriteCafeIds[0] ?? '' },
		{ id: 'favorite_cafe_2', label: 'Favorite #2', value: favoriteCafeIds[1] ?? '' },
		{ id: 'favorite_cafe_3', label: 'Favorite #3', value: favoriteCafeIds[2] ?? '' },
	]

	const hasSelectableCafes = selectableCafes.length > 0
	const lastVisit = deems[0]?.visited_at ? formatDate(deems[0].visited_at) : null
	const ratedDeemsCount = deems.filter((deem) => deem.rating !== null).length

	return {
		user,
		profile,
		deems,
		deemsError,
		userLists,
		userStats,
		metrics: {
			averageRating,
			likedCount,
			uniqueCafeCount,
			ratedDeemsCount,
		},
		cafeData: {
			favoriteCafes,
			selectableCafes,
			hasSelectableCafes,
		},
		view: {
			displayName,
			memberSince,
			websiteUrl,
			lastVisit,
			favoriteSlots,
		},
	}
}
