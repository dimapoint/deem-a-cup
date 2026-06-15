import {Users} from 'lucide-react'
import Link from 'next/link'
import type {ActivityWithActor} from '@/app/actions/feed'
import {ActivityCard} from './ActivityCard'

/**
 * Renders the list of activities from people the user follows, with a staggered
 * reveal animation. Shows a friendly empty state when the feed is quiet (no
 * follows yet, or no recent activity from followed users).
 */
export function ActivityFeed({activities}: {activities: ActivityWithActor[]}) {
	if (activities.length === 0) {
		return (
			<div className="flex flex-col items-center text-center py-16 px-6 rounded-lg border border-dashed border-gray-800">
				<div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 text-gray-500 mb-4">
					<Users size={22} />
				</div>
				<p className="text-gray-300 font-semibold">Your feed is quiet</p>
				<p className="text-sm text-gray-500 mt-1 max-w-xs">
					Follow other coffee drinkers to see their deems, lists and photos here.
				</p>
				<Link
					href="/"
					className="mt-5 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors"
				>
					Discover people →
				</Link>
			</div>
		)
	}

	return (
		<div className="space-y-2.5">
			{activities.map((activity, i) => (
				<div
					key={activity.id}
					className="animate-fade-in-up"
					style={{animationDelay: `${Math.min(i * 40, 400)}ms`}}
				>
					<ActivityCard activity={activity} />
				</div>
			))}
		</div>
	)
}
