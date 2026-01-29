import Image from 'next/image'
import {redirect} from 'next/navigation'
import type {ReactNode} from 'react'
import {Calendar, Coffee, Heart, Link2, Mail, MapPin, User} from 'lucide-react'
import type {Cafe, Deem, Profile} from '@/types/database'
import {createClient} from '@/utils/supabase/server'
import {CoffeeRating} from '@/components/deems/CoffeeRating'
import {updateFavoriteCafes, updateProfile} from './actions'
import {CreateListForm} from '@/components/lists/CreateListForm'
import {UserLists} from '@/components/lists/UserLists'
import {getUserLists} from '@/app/actions/lists'
import {getUserStats} from '@/app/actions/stats'
import {StatsSection} from '@/components/stats/StatsSection'

type ProfileRow = Pick<Profile, 'id' | 'full_name' | 'username' | 'avatar_url' | 'website' | 'favorite_cafe_ids'>

type CafeCore = Pick<Cafe, 'id' | 'name' | 'place_id' | 'address'>

type DeemWithCafe =
	Pick<Deem, 'id' | 'rating' | 'review' | 'liked' | 'visited_at' | 'created_at'>
	& {
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
		year: 'numeric'
	}).format(date)
}

const formatMonthYear = (value: string) => new Intl.DateTimeFormat('en-US', {
	month: 'short',
	year: 'numeric'
}).format(new Date(value))

const StatCard = ({label, value, icon}: StatCardProps) => (
	<div className="rounded-lg border border-gray-800 bg-[#1e232b] p-4">
		<div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500">
			{icon}
			<span>{label}</span>
		</div>
		<div className="mt-2 text-2xl font-bold text-white">{value}</div>
	</div>
)

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
			.filter((id): id is string => typeof id === 'string' && id.length > 0)
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

	const favoriteSlots = [
		{id: 'favorite_cafe_1', label: 'Favorite #1', value: favoriteCafeIds[0] ?? ''},
		{id: 'favorite_cafe_2', label: 'Favorite #2', value: favoriteCafeIds[1] ?? ''},
		{id: 'favorite_cafe_3', label: 'Favorite #3', value: favoriteCafeIds[2] ?? ''},
	]

	const hasSelectableCafes = selectableCafes.length > 0

	const pastDeems = deems
	const lastVisit = deems[0]?.visited_at ? formatDate(deems[0].visited_at) : null

	const stats: StatCardProps[] = [
		{
			label: 'Visits',
			value: String(deems.length),
			icon: <Coffee size={14} className="text-gray-400"/>
		},
		{
			label: 'Cafes',
			value: String(uniqueCafeCount),
			icon: <MapPin size={14} className="text-gray-400"/>
		},
		{
			label: 'Liked',
			value: String(likedCount),
			icon: <Heart size={14} className="text-gray-400"/>
		},
		{
			label: 'Avg rating',
			value: averageRating !== null ? averageRating.toFixed(1) : '-',
			icon: <span className="text-sm leading-none text-gray-400" aria-hidden="true">☕</span>
		},
	]

	return (
		<main className="min-h-screen bg-[#14181c] text-gray-100 p-4 md:p-8">
			<div className="mx-auto max-w-4xl space-y-8">
				<header className="space-y-6 border-b border-gray-800 pb-6">
					<div
						className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div className="flex items-center gap-4">
							<div
								className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-gray-700 bg-gray-800">
								{profile.avatar_url ? (
									<Image
										src={profile.avatar_url}
										alt={displayName}
										fill
										sizes="80px"
										className="object-cover"
									/>
								) : (
									<User size={28} className="text-gray-400"/>
								)}
							</div>
							<div>
								<div className="flex flex-wrap items-center gap-2">
									<h1 className="text-3xl font-bold text-white">{displayName}</h1>
									{profile.username && (
										<span
											className="text-sm text-gray-500">@{profile.username}</span>
									)}
								</div>
								<div
									className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
									<span className="flex items-center gap-1">
										<Calendar size={14}/>
										Member since {memberSince}
									</span>
									{websiteUrl && (
										<a
											href={websiteUrl}
											target="_blank"
											rel="noreferrer"
											className="flex items-center gap-1 text-orange-400 hover:text-orange-300"
										>
											<Link2 size={14}/>
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
							<div
								className="rounded-lg border border-red-900/50 bg-[#1b1518] p-6 text-sm text-red-200">
								We couldn&#39;t load your logs right now. Please try again.
							</div>
						) : pastDeems.length === 0 ? (
							<div
								className="rounded-lg border border-gray-800 bg-[#1e232b] p-6 text-sm text-gray-500">
								No logs yet. Log your first cafe to kick things off.
							</div>
						) : (
							<div className="space-y-4">
								{pastDeems.map((deem) => (
									<div
										key={deem.id}
										className="rounded-lg border border-gray-800 bg-[#1e232b] p-4"
									>
										<div
											className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
											<div>
												<h3 className="text-lg font-semibold text-white">
													{deem.cafe?.name ?? 'Unknown Cafe'}
												</h3>
												<p className="text-xs text-gray-500">
													{deem.cafe?.address ?? 'Address not set'}
												</p>
											</div>
											{deem.rating !== null && (
												<div
													className="flex items-center rounded-md border border-gray-700 bg-gray-900 px-2 py-1 text-sm font-semibold text-gray-200"
												>
													<CoffeeRating rating={deem.rating} size="sm"/>
												</div>
											)}
										</div>

										<div
											className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
											<span className="flex items-center gap-1">
												<Calendar size={12}/>
												{formatDate(deem.visited_at)}
											</span>
											{deem.liked && (
												<span
													className="flex items-center gap-1 text-pink-400">
													<Heart size={12} className="fill-pink-400"/>
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
						<div className="rounded-lg border border-gray-800 bg-[#1e232b] p-4">
							<h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
								Edit Details
							</h3>
							<form action={updateProfile} className="space-y-3">
								<div className="space-y-1">
									<label htmlFor="full_name"
									       className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
										Full Name
									</label>
									<input
										type="text"
										id="full_name"
										name="full_name"
										defaultValue={profile.full_name || ''}
										className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
										placeholder="Jane Doe"
									/>
								</div>
								<div className="space-y-1">
									<label htmlFor="username"
									       className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
										Username
									</label>
									<input
										type="text"
										id="username"
										name="username"
										defaultValue={profile.username || ''}
										className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
										placeholder="coffee_lover"
									/>
								</div>
								<div className="space-y-1">
									<label htmlFor="website"
									       className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
										Website
									</label>
									<input
										type="url"
										id="website"
										name="website"
										defaultValue={profile.website || ''}
										className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
										placeholder="https://example.com"
									/>
								</div>
								<button
									type="submit"
									className="w-full rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-600"
								>
									Update Profile
								</button>
							</form>
						</div>

						<div className="rounded-lg border border-gray-800 bg-[#1e232b] p-4">
							<h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
								Profile
							</h3>
							<div className="mt-4 space-y-3 text-sm text-gray-400">
								<div className="flex items-center justify-between gap-3">
									<span className="flex items-center gap-2">
										<Mail size={14}/>
										Email
									</span>
									<span className="text-gray-200">{user.email ?? 'Not set'}</span>
								</div>
								<div className="flex items-center justify-between gap-3">
									<span className="flex items-center gap-2">
										<Calendar size={14}/>
										Last visit
									</span>
									<span className="text-gray-200">{lastVisit ?? '-'}</span>
								</div>
								<div className="flex items-center justify-between gap-3">
									<span className="flex items-center gap-2">
										<span className="text-sm leading-none text-gray-400"
										      aria-hidden="true">☕</span>
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
									Pick up to three favorites to feature on your profile.
								</p>
							) : (
								<div className="mt-4 space-y-3">
									{favoriteCafes.map((cafe, index) => (
										<div key={cafe.id} className="flex items-start gap-3">
											<div
												className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-gray-400">
															<span
																className="text-xs font-semibold text-gray-300">
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

							<div className="mt-4 border-t border-gray-800 pt-4">
								<form action={updateFavoriteCafes} className="space-y-3">
									{favoriteSlots.map((slot) => (
										<div key={slot.id} className="space-y-1">
											<label
												htmlFor={slot.id}
												className="text-[11px] font-semibold uppercase tracking-widest text-gray-500"
											>
												{slot.label}
											</label>
											<select
												id={slot.id}
												name={slot.id}
												defaultValue={slot.value}
												disabled={!hasSelectableCafes}
												className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
											>
												<option value="">None</option>
												{selectableCafes.map((cafe) => (
													<option key={cafe.id} value={cafe.id}>
														{cafe.name}
													</option>
												))}
											</select>
										</div>
									))}

									<div className="space-y-2">
										{!hasSelectableCafes && (
											<p className="text-xs text-gray-500">
												Log a cafe to start choosing favorites.
											</p>
										)}
										<button
											type="submit"
											disabled={!hasSelectableCafes}
											className="w-full rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
										>
											Save favorites
										</button>
									</div>
								</form>
							</div>
						</div>
					</aside>
				</section>
			</div>
		</main>
	)
}

export default ProfilePage
