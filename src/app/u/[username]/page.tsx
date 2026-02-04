import {notFound} from 'next/navigation'
import {createClient} from '@/utils/supabase/server'
import {FollowButton} from '@/components/profile/FollowButton'
import {formatDate} from '@/utils/date'
import {DeemWithCafe, ProfileRow} from '@/types/profile'
import {calculateProfileStats, getProfileCafes} from '@/utils/profile-calculations'
import {DeemList} from '@/components/profile/DeemList'
import {ProfileHeader} from '@/components/profile/ProfileHeader'
import {ProfileInfo} from '@/components/profile/ProfileInfo'
import {TopCafesList} from '@/components/profile/TopCafesList'
import {ProfileStatsGrid} from '@/components/profile/ProfileStatsGrid'

interface PageProps {
	params: Promise<{ username: string }>
}

const PublicProfilePage = async ({params}: PageProps) => {
	const {username} = await params
	const supabase = await createClient()

	const {
		data: {user: currentUser},
	} = await supabase.auth.getUser()

	// 1. Fetch Profile by Username
	const {data: profileData, error: profileError} = await supabase
		.from('profiles')
		.select('id, full_name, username, avatar_url, website, favorite_cafe_ids, created_at')
		.eq('username', username)
		.maybeSingle()

	if (profileError) {
		console.error('Error fetching profile:', profileError)
	}

	if (!profileData) {
		notFound()
	}

	const profile: ProfileRow = profileData

	const isOwnProfile = currentUser?.id === profile.id

	// 2. Fetch Follow Status (if logged in and not own profile)
	let isFollowing = false
	if (currentUser && !isOwnProfile) {
		const {data: followData} = await supabase
			.from('follows')
			.select('created_at')
			.eq('follower_id', currentUser.id)
			.eq('following_id', profile.id)
			.maybeSingle()

		isFollowing = !!followData
	}

	// 3. Fetch Deems
	const {data: deemsData, error: deemsError} = await supabase
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
		.eq('user_id', profile.id)
		.order('visited_at', {ascending: false})
		.overrideTypes<DeemWithCafe[], { merge: false }>()

	if (deemsError) {
		console.error('Error fetching deems:', deemsError)
	}

	const deems = deemsData ?? []

	// --- Statistics Calculation (Same as ProfilePage) ---
	const displayName = profile.full_name || profile.username || 'Coffee fan'

	const websiteUrl = profile.website
		? profile.website.startsWith('http')
			? profile.website
			: `https://${profile.website}`
		: null

	const {averageRating, likedCount, uniqueCafeCount} = calculateProfileStats(deems)
	const {favoriteCafes} = await getProfileCafes(profile, deems, supabase)

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
						websiteUrl={websiteUrl}
					>
						{/* Follow Button Area */}
						{!isOwnProfile && currentUser && (
							<div className="mt-2">
								<FollowButton
									targetUserId={profile.id}
									initialIsFollowing={isFollowing}
								/>
							</div>
						)}
					</ProfileHeader>

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
								We couldn&#39;t load logs right now.
							</div>
						) : (
							<DeemList deems={pastDeems} emptyMessage="No logs yet."/>
						)}
					</div>

					<aside className="space-y-4">
						<ProfileInfo
							lastVisit={lastVisit}
							ratedDeemsCount={ratedDeemsCount}
						/>
						<TopCafesList cafes={favoriteCafes}/>
					</aside>
				</section>
			</div>
		</main>
	)
}

export default PublicProfilePage
