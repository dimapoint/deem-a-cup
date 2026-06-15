import {User} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type {ActivityWithActor} from '@/app/actions/feed'
import {formatRelativeTime} from '@/utils/date'
import {getVerbPresentation} from './activityPresentation'

/**
 * A single row in the social activity feed. Renders the actor's avatar, a
 * verb-specific icon chip, a human phrase ("logged a coffee") and a compact
 * relative timestamp. Purely presentational.
 */
export function ActivityCard({activity}: {activity: ActivityWithActor}) {
	const {actor} = activity
	const {icon, accent, chip, phrase} = getVerbPresentation(activity.verb)
	const profileUrl = actor?.username ? `/u/${actor.username}` : null
	const name = actor?.full_name || actor?.username || 'Someone'

	const avatar = (
		<div className="relative w-10 h-10 shrink-0">
			<div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600">
				{actor?.avatar_url ? (
					<Image
						src={actor.avatar_url}
						alt={name}
						width={40}
						height={40}
						className="w-full h-full object-cover"
					/>
				) : (
					<User size={18} className="text-gray-400" />
				)}
			</div>
			{/* Verb icon chip overlapping the avatar */}
			<span
				className={`absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full border ${chip} ${accent}`}
			>
				{icon}
			</span>
		</div>
	)

	return (
		<div className="group flex items-center gap-3 bg-[#1e232b] px-4 py-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
			{profileUrl ? <Link href={profileUrl}>{avatar}</Link> : avatar}

			<div className="min-w-0 flex-1">
				<p className="text-sm text-gray-300 truncate">
					{profileUrl ? (
						<Link
							href={profileUrl}
							className="font-bold text-gray-100 hover:text-orange-400 transition-colors"
						>
							{name}
						</Link>
					) : (
						<span className="font-bold text-gray-100">{name}</span>
					)}{' '}
					<span className="text-gray-500">{phrase}</span>
				</p>
			</div>

			<time
				className="shrink-0 text-xs text-gray-600 tabular-nums"
				dateTime={activity.created_at}
			>
				{formatRelativeTime(activity.created_at)}
			</time>
		</div>
	)
}
