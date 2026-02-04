import { StatsSection } from '@/components/stats/StatsSection'
import { DeemList } from '@/components/profile/DeemList'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { TopCafesList } from '@/components/profile/TopCafesList'
import { EditProfileForm } from '@/components/profile/EditProfileForm'
import { ManageFavoritesForm } from '@/components/profile/ManageFavoritesForm'
import { ProfileInfo } from '@/components/profile/ProfileInfo'
import { ProfileStatsGrid } from '@/components/profile/ProfileStatsGrid'
import { UserLists } from '@/components/lists/UserLists'
import { CreateListForm } from '@/components/lists/CreateListForm'
import { getProfilePageData } from './data'

const ProfilePage = async () => {
	const {
		user,
		profile,
		deems,
		deemsError,
		userLists,
		userStats,
		metrics,
		cafeData,
		view,
	} = await getProfilePageData()

	return (
		<main className="min-h-screen bg-[#14181c] text-gray-100 p-4 md:p-8">
			<div className="mx-auto max-w-4xl space-y-8">
				<header className="space-y-6 border-b border-gray-800 pb-6">
					<ProfileHeader
						profile={profile}
						displayName={view.displayName}
						memberSince={view.memberSince}
						websiteUrl={view.websiteUrl}
					/>

					<ProfileStatsGrid
						visitCount={deems.length}
						cafeCount={metrics.uniqueCafeCount}
						likedCount={metrics.likedCount}
						averageRating={metrics.averageRating}
					/>
				</header>

				<section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
					<div className="space-y-4">
						<h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">
							Past logs
						</h2>
						{deemsError ? (
							<div className="rounded-lg border border-red-900/50 bg-[#1b1518] p-6 text-sm text-red-200">
								We couldn&#39;t load your logs right now. Please try again.
							</div>
						) : (
							<DeemList
								deems={deems}
								emptyMessage="No logs yet. Log your first cafe to kick things off."
							/>
						)}

						<div className="pt-4">
							<StatsSection stats={userStats} />
						</div>

						<div className="space-y-4 pt-4">
							<div className="flex items-center justify-between">
								<h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
									Your Lists
								</h3>
							</div>
							<UserLists lists={userLists} />
							<CreateListForm />
						</div>
					</div>

					<aside className="space-y-4">
						<EditProfileForm profile={profile} />

						<ProfileInfo
							email={user.email}
							lastVisit={view.lastVisit}
							ratedDeemsCount={metrics.ratedDeemsCount}
						/>

						<TopCafesList cafes={cafeData.favoriteCafes}>
							<ManageFavoritesForm
								favoriteSlots={view.favoriteSlots}
								selectableCafes={cafeData.selectableCafes}
								hasSelectableCafes={cafeData.hasSelectableCafes}
							/>
						</TopCafesList>
					</aside>
				</section>
			</div>
		</main>
	)
}

export default ProfilePage
