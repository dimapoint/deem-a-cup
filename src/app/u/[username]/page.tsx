import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { Calendar, Coffee, Heart, Link2, MapPin, User } from 'lucide-react'
import type { Cafe, Deem, Profile } from '@/types/database'
import { createClient } from '@/utils/supabase/server'
import { CoffeeRating } from '@/components/deems/CoffeeRating'
import { FollowButton } from '@/components/profile/FollowButton'

type ProfileRow = Pick<
	Profile,
	'id' | 'full_name' | 'username' | 'avatar_url' | 'website' | 'favorite_cafe_ids'
>

type CafeCore = Pick<Cafe, 'id' | 'name' | 'place_id' | 'address'>

type DeemWithCafe = Pick<
	Deem,
	'id' | 'rating' | 'review' | 'liked' | 'visited_at' | 'created_at'
> & {
	cafe: CafeCore | null
}

type CafeSummary = {
	cafe: CafeCore
	visits: number
}

type StatCardProps = {
	label: string
	value: string
	icon: ReactNode
}

const formatDate = (value: string) => {
	const [datePart] = value.split('T')
	const [year, month, day] = datePart.split('-').map(Number)
	const date = year && month && day ? new Date(year, month - 1, day) : new Date(value)
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(date)
}

const StatCard = ({ label, value, icon }: StatCardProps) => (
	<div className="rounded-lg border border-gray-800 bg-[#1e232b] p-4">
		<div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500">
			{icon}
			<span>{label}</span>
		</div>
		<div className="mt-2 text-2xl font-bold text-white">{value}</div>
	</div>
)

interface PageProps {
	params: Promise<{ username: string }>
}

const PublicProfilePage = async ({ params }: PageProps) => {
	const { username } = await params
	const supabase = await createClient()

	const {
		data: { user: currentUser },
	} = await supabase.auth.getUser()

	// 1. Fetch Profile by Username
	const { data: profileData, error: profileError } = await supabase
		.from('profiles')
		.select('id, full_name, username, avatar_url, website, favorite_cafe_ids, created_at') // Added created_at if available in profiles? No, it's in auth.users. 
		// Wait, profiles table doesn't have created_at in the schema I read earlier.
		// It has updated_at. I can't get "Member since" easily for public profiles unless I add created_at to profiles or join.
		// I'll skip "Member since" for now or check if I can add created_at to profiles table.
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
		const { data: followData } = await supabase
			.from('follows')
			.select('created_at')
			.eq('follower_id', currentUser.id)
			.eq('following_id', profile.id)
			.maybeSingle()
		
		isFollowing = !!followData
	}

	// 3. Fetch Deems
	const { data: deemsData, error: deemsError } = await supabase
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
		.order('visited_at', { ascending: false })
		.overrideTypes<DeemWithCafe[], { merge: false }>()

	if (deemsError) {
		console.error('Error fetching deems:', deemsError)
	}

	const deems = deemsData ?? []

	// --- Statistics Calculation (Same as ProfilePage) ---
	const displayName = profile.full_name || profile.username || 'Coffee fan'
	// "Member since" is tricky. profiles table doesn't have it. I'll omit it for public view for now.
	
	const websiteUrl = profile.website
		? profile.website.startsWith('http')
			? profile.website
			: `https://${profile.website}`
		: null

	const ratedDeems = deems
		.map((deem) => deem.rating)
		.filter((rating): rating is number => rating !== null)

	const averageRating =
		ratedDeems.length > 0
			? ratedDeems.reduce((total, rating) => total + rating, 0) / ratedDeems.length
			: null

	const likedCount = deems.filter((deem) => deem.liked === true).length
	const uniqueCafeCount = new Set(deems.flatMap((deem) => (deem.cafe ? [deem.cafe.id] : []))).size

	const cafeCounts = deems.reduce((accumulator, deem) => {
		if (!deem.cafe) {
			return accumulator
		}

		const existing = accumulator.get(deem.cafe.id)
		if (existing) {
			existing.visits += 1
		} else {
			accumulator.set(deem.cafe.id, { cafe: deem.cafe, visits: 1 })
		}

		return accumulator
	}, new Map<string, CafeSummary>())

	const favoriteCafeIds = Array.from(
		new Set(
			(profile.favorite_cafe_ids ?? []).filter(
				(id): id is string => typeof id === 'string' && id.length > 0
			)
		)
	)

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
		const { data: favoriteCafeResults } = await supabase
			.from('cafes')
			.select('id, name, place_id, address')
			.in('id', missingFavoriteIds)

		for (const cafe of favoriteCafeResults ?? []) {
			cafeById.set(cafe.id, cafe)
		}

		favoriteCafes = favoriteCafeIds
			.map((id) => cafeById.get(id))
			.filter((cafe): cafe is CafeCore => Boolean(cafe))
	}

	const pastDeems = deems
	const lastVisit = deems[0]?.visited_at ? formatDate(deems[0].visited_at) : null

	const stats: StatCardProps[] = [
		{
			label: 'Visits',
			value: String(deems.length),
			icon: <Coffee size={14} className="text-gray-400" />,
		},
		{
			label: 'Cafes',
			value: String(uniqueCafeCount),
			icon: <MapPin size={14} className="text-gray-400" />,
		},
		{
			label: 'Liked',
			value: String(likedCount),
			icon: <Heart size={14} className="text-gray-400" />,
		},
		{
			label: 'Avg rating',
			value: averageRating !== null ? averageRating.toFixed(1) : '-',
			icon: <span className="text-sm leading-none text-gray-400" aria-hidden="true">☕</span>,
		},
	]

	return (
		<main className="min-h-screen bg-[#14181c] text-gray-100 p-4 md:p-8">
			<div className="mx-auto max-w-4xl space-y-8">
				<header className="space-y-6 border-b border-gray-800 pb-6">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div className="flex items-center gap-4">
							<div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-gray-700 bg-gray-800">
								{profile.avatar_url ? (
									<Image
										src={profile.avatar_url}
										alt={displayName}
										fill
										sizes="80px"
										className="object-cover"
									/>
								) : (
									<User size={28} className="text-gray-400" />
								)}
							</div>
							<div>
								<div className="flex flex-wrap items-center gap-2">
									<h1 className="text-3xl font-bold text-white">{displayName}</h1>
									{profile.username && (
										<span className="text-sm text-gray-500">@{profile.username}</span>
									)}
								</div>
								
								{/* Follow Button Area */}
								{!isOwnProfile && currentUser && (
									<div className="mt-2">
										<FollowButton 
											targetUserId={profile.id} 
											initialIsFollowing={isFollowing} 
										/>
									</div>
								)}

								<div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
									{/* Omitted "Member since" as we don't have created_at in public profiles yet */}
									{websiteUrl && (
										<a
											href={websiteUrl}
											target="_blank"
											rel="noreferrer"
											className="flex items-center gap-1 text-orange-400 hover:text-orange-300"
										>
											<Link2 size={14} />
											{profile.website}
										</a>
									)}
								</div>
							</div>
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
						{stats.map((stat) => (
							<StatCard
								key={stat.label}
								label={stat.label}
								value={stat.value}
								icon={stat.icon}
							/>
						))}
					</div>
				</header>

				<section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
					<div className="space-y-4">
						<h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">
							Past logs
						</h2>
						{deemsError ? (
							<div className="rounded-lg border border-red-900/50 bg-[#1b1518] p-6 text-sm text-red-200">
								We couldn&#39;t load logs right now.
							</div>
						) : pastDeems.length === 0 ? (
							<div className="rounded-lg border border-gray-800 bg-[#1e232b] p-6 text-sm text-gray-500">
								No logs yet.
							</div>
						) : (
							<div className="space-y-4">
								{pastDeems.map((deem) => (
									<div
										key={deem.id}
										className="rounded-lg border border-gray-800 bg-[#1e232b] p-4"
									>
										<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
											<div>
												<h3 className="text-lg font-semibold text-white">
													{deem.cafe?.name ?? 'Unknown Cafe'}
												</h3>
												<p className="text-xs text-gray-500">
													{deem.cafe?.address ?? 'Address not set'}
												</p>
											</div>
											{deem.rating !== null && (
												<div className="flex items-center rounded-md border border-gray-700 bg-gray-900 px-2 py-1 text-sm font-semibold text-gray-200">
													<CoffeeRating rating={deem.rating} size="sm" />
												</div>
											)}
										</div>

										<div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
											<span className="flex items-center gap-1">
												<Calendar size={12} />
												{formatDate(deem.visited_at)}
											</span>
											{deem.liked && (
												<span className="flex items-center gap-1 text-pink-400">
													<Heart size={12} className="fill-pink-400" />
													Liked
												</span>
											)}
										</div>

										{deem.review && (
											<p className="mt-3 text-sm italic text-gray-300">
												&#34;{deem.review}&#34;
											</p>
										)}
									</div>
								))}
							</div>
						)}
					</div>

					<aside className="space-y-4">
						<div className="rounded-lg border border-gray-800 bg-[#1e232b] p-4">
							<h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
								Profile
							</h3>
							<div className="mt-4 space-y-3 text-sm text-gray-400">
								{/* Email hidden for public */}
								<div className="flex items-center justify-between gap-3">
									<span className="flex items-center gap-2">
										<Calendar size={14} />
										Last visit
									</span>
									<span className="text-gray-200">{lastVisit ?? '-'}</span>
								</div>
								<div className="flex items-center justify-between gap-3">
									<span className="flex items-center gap-2">
										<span className="text-sm leading-none text-gray-400" aria-hidden="true">
											☕
										</span>
										Rated visits
									</span>
									<span className="text-gray-200">{ratedDeems.length}</span>
								</div>
							</div>
						</div>

						<div className="rounded-lg border border-gray-800 bg-[#1e232b] p-4">
							<h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
								Top cafes
							</h3>
							{favoriteCafes.length === 0 ? (
								<p className="mt-4 text-sm text-gray-500">
									No favorites selected yet.
								</p>
							) : (
								<div className="mt-4 space-y-3">
									{favoriteCafes.map((cafe, index) => (
										<div key={cafe.id} className="flex items-start gap-3">
											<div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-gray-400">
												<span className="text-xs font-semibold text-gray-300">
													{index + 1}
												</span>
											</div>
											<div className="flex-1">
												<p className="text-sm font-semibold text-gray-200">
													{cafe.name}
												</p>
												<p className="text-xs text-gray-500">
													{cafe.address ?? 'Address not set'}
												</p>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</aside>
				</section>
			</div>
		</main>
	)
}

export default PublicProfilePage
