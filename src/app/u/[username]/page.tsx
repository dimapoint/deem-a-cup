import {notFound} from 'next/navigation'
import {FollowButton} from '@/components/profile/FollowButton'
import {formatDate} from '@/utils/date'
import {DeemList} from '@/components/profile/DeemList'
import {ProfileHeader} from '@/components/profile/ProfileHeader'
import {ProfileInfo} from '@/components/profile/ProfileInfo'
import {TopCafesList} from '@/components/profile/TopCafesList'
import {ProfileStatsGrid} from '@/components/profile/ProfileStatsGrid'
import {fetchProfilePageData} from './profile.data'

interface PageProps {
	params: Promise<{ username: string }>
}

const PublicProfilePage = async ({params}: PageProps) => {
	const {username} = await params
	const data = await fetchProfilePageData(username)

	if (!data) {
		notFound()
	}

	const {
		currentUser,
		profile,
		isOwnProfile,
		isFollowing,
		deems,
		deemsError,
		stats,
		favoriteCafes
	} = data

	const displayName = profile.full_name || profile.username || 'Coffee fan'
	const websiteUrl = profile.website
		? profile.website.startsWith('http')
			? profile.website
			: `https://${profile.website}`
		: null

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
						cafeCount={stats.uniqueCafeCount}
						likedCount={stats.likedCount}
						averageRating={stats.averageRating}
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
							<DeemList deems={deems} emptyMessage="No logs yet."/>
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
