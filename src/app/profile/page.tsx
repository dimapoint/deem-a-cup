import {redirect} from 'next/navigation'
import {createClient} from '@/utils/supabase/server'
import {CreateListForm} from '@/components/lists/CreateListForm'
import {UserLists} from '@/components/lists/UserLists'
import {getUserLists} from '@/app/actions/lists'
import {getUserStats} from '@/app/actions/stats'
import {StatsSection} from '@/components/stats/StatsSection'
import {formatDate, formatMonthYear} from '@/utils/date'
import {DeemWithCafe, ProfileRow} from '@/types/profile'
import {calculateProfileStats, getProfileCafes} from '@/utils/profile-calculations'
import {DeemList} from '@/components/profile/DeemList'
import {ProfileHeader} from '@/components/profile/ProfileHeader'
import {TopCafesList} from '@/components/profile/TopCafesList'
import {EditProfileForm} from '@/components/profile/EditProfileForm'
import {ManageFavoritesForm} from '@/components/profile/ManageFavoritesForm'
import {ProfileInfo} from '@/components/profile/ProfileInfo'
import {ProfileStatsGrid} from '@/components/profile/ProfileStatsGrid'

const ProfilePage = async () => {
	const supabase = await createClient()

	const {data: {user}} = await supabase.auth.getUser()
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
			.order('visited_at', {ascending: false})
			.overrideTypes<DeemWithCafe[], { merge: false }>()
	])

	// Fetch user lists and stats
	const [userLists, userStats] = await Promise.all([
		getUserLists(user.id),
		getUserStats(user.id)
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
		favorite_cafe_ids: []
	}

	const deemsError = deemsResult.error
	const deems = deemsResult.data ?? []

	const displayName = profile.full_name || profile.username || user.email || 'Coffee fan'
	const memberSince = user.created_at ? formatMonthYear(user.created_at) : 'Unknown'
	const websiteUrl = profile.website
		? (profile.website.startsWith('http') ? profile.website : `https://${profile.website}`)
		: null

	const {averageRating, likedCount, uniqueCafeCount} = calculateProfileStats(deems)
	const {favoriteCafes, selectableCafes, favoriteCafeIds} = await getProfileCafes(profile, deems, supabase)

	const favoriteSlots = [
		{id: 'favorite_cafe_1', label: 'Favorite #1', value: favoriteCafeIds[0] ?? ''},
		{id: 'favorite_cafe_2', label: 'Favorite #2', value: favoriteCafeIds[1] ?? ''},
		{id: 'favorite_cafe_3', label: 'Favorite #3', value: favoriteCafeIds[2] ?? ''},
	]

	const hasSelectableCafes = selectableCafes.length > 0

	const pastDeems = deems
	const lastVisit = deems[0]?.visited_at ? formatDate(deems[0].visited_at) : null

	const ratedDeemsCount = deems.filter((deem) => deem.rating !== null).length

	return (
		<main className="min-h-screen bg-[#14181c] text-gray-100 p-4 md:p-8">
			<div className="mx-auto max-w-4xl space-y-8">
				<header className="space-y-6 border-b border-gray-800 pb-6">
					<ProfileHeader
						profile={profile}
						displayName={displayName}
						memberSince={memberSince}
						websiteUrl={websiteUrl}
					/>

					<ProfileStatsGrid
						visitCount={deems.length}
						cafeCount={uniqueCafeCount}
						likedCount={likedCount}
						averageRating={averageRating}
					/>
				</header>

				<section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
					<div className="space-y-4">
						<h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">
							Past logs
						</h2>
						{deemsError ? (
							<div
								className="rounded-lg border border-red-900/50 bg-[#1b1518] p-6 text-sm text-red-200">
								We couldn&#39;t load your logs right now. Please try again.
							</div>
						) : (
							<DeemList
								deems={pastDeems}
								emptyMessage="No logs yet. Log your first cafe to kick things off."
							/>
						)}

						<div className="pt-4">
							<StatsSection stats={userStats}/>
						</div>

						<div className="space-y-4 pt-4">
							<div className="flex items-center justify-between">
								<h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
									Your Lists
								</h3>
							</div>
							<UserLists lists={userLists}/>
							<CreateListForm/>
						</div>
					</div>

					<aside className="space-y-4">
						<EditProfileForm profile={profile}/>

						<ProfileInfo
							email={user.email}
							lastVisit={lastVisit}
							ratedDeemsCount={ratedDeemsCount}
						/>

						<TopCafesList cafes={favoriteCafes}>
							<ManageFavoritesForm
								favoriteSlots={favoriteSlots}
								selectableCafes={selectableCafes}
								hasSelectableCafes={hasSelectableCafes}
							/>
						</TopCafesList>
					</aside>
				</section>
			</div>
		</main>
	)
}

export default ProfilePage
