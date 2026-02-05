import {UserStats} from '@/app/actions/stats'
import {BarChart3, Calendar, Star} from 'lucide-react'

interface StatsSectionProps {
	/** The user statistics data to display. */
	stats: UserStats
}

/**
 * Displays a summary of user statistics including year progress, rating distribution, and weekly
 * activity.
 *
 * @param props - The component props.
 * @param props.stats - The user statistics object containing counts and distributions.
 */
export function StatsSection({stats}: StatsSectionProps) {
	return (
		<div className="space-y-6">
			<YearProgress stats={stats}/>
			<RatingDistribution stats={stats}/>
			<WeeklyActivity stats={stats}/>
		</div>
	)
}

/**
 * Displays the user's progress towards a yearly goal of cafe visits.
 */
function YearProgress({stats}: { stats: UserStats }) {
	// Goal for the year (Arbitrary for now, maybe user setting later)
	const yearGoal = 52 // 1 per week
	const yearProgress = Math.min((stats.thisYearCount / yearGoal) * 100, 100)
	const remaining = yearGoal - stats.thisYearCount

	return (
		<div className="rounded-lg border border-gray-800 bg-[#1e232b] p-4">
			<div
				className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500 mb-3">
				<Calendar size={14}/>
				<span>Cafes this year</span>
			</div>
			<div className="flex items-end gap-2 mb-2">
				<span className="text-2xl font-bold text-white">{stats.thisYearCount}</span>
				<span className="text-xs text-gray-500 mb-1">/ {yearGoal} goal</span>
			</div>
			<div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
				<div
					className="h-full rounded-full bg-orange-500 transition-all duration-500"
					style={{width: `${yearProgress}%`}}
				/>
			</div>
			<p className="mt-2 text-xs text-gray-500">
				{stats.thisYearCount === 0
					? 'Start your coffee journey this year!'
					: yearProgress >= 100
						? 'Goal crushed! ☕🚀'
						: `${remaining} more to reach your goal.`}
			</p>
		</div>
	)
}

/**
 * Displays a bar chart of the user's rating distribution.
 * Aggregates half-star ratings into integer buckets (e.g., 4.5 becomes part of the 4-star bucket).
 */
function RatingDistribution({stats}: { stats: UserStats }) {
	// Pre-calculate buckets to determine the correct max value for scaling
	const buckets = [1, 2, 3, 4, 5].map((rating) => {
		const count =
			(stats.ratingDistribution[rating.toString()] || 0) +
			(stats.ratingDistribution[(rating + 0.5).toString()] || 0)
		return {rating, count}
	})

	const maxBucketCount = Math.max(...buckets.map((b) => b.count), 1)

	return (
		<div className="rounded-lg border border-gray-800 bg-[#1e232b] p-4">
			<div
				className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500 mb-4">
				<Star size={14}/>
				<span>Rating Distribution</span>
			</div>

			<div className="flex items-end justify-between h-32 gap-1">
				{buckets.map(({rating, count}) => {
					const heightPct = (count / (stats.totalDeems || 1)) * 100
					// Visual scaling relative to max to fill height
					const visualHeight = (count / maxBucketCount) * 100

					return (
						<div
							key={rating}
							className="flex flex-col items-center gap-1 w-full group relative"
						>
							{/* Tooltip */}
							<div
								className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-xs text-white px-2 py-1 rounded border border-gray-700 pointer-events-none whitespace-nowrap z-10">
								{count} logs ({heightPct.toFixed(0)}%)
							</div>
							<div className="flex-1 w-full flex items-end justify-center">
								<div
									className="w-full max-w-[20px] bg-gray-700 rounded-t-sm hover:bg-orange-400 transition-colors"
									style={{height: `${visualHeight || 2}%`}} // Min 2% for
									// visibility
								/>
							</div>
							<span className="text-xs text-gray-500 font-medium">{rating}</span>
						</div>
					)
				})}
			</div>
		</div>
	)
}

/**
 * Displays a bar chart of the user's activity by day of the week.
 */
function WeeklyActivity({stats}: { stats: UserStats }) {
	const days = [
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
		'Sunday',
	]
	const maxDayCount = Math.max(...Object.values(stats.dayDistribution), 1)

	return (
		<div className="rounded-lg border border-gray-800 bg-[#1e232b] p-4">
			<div
				className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500 mb-4">
				<BarChart3 size={14}/>
				<span>Weekly Activity</span>
			</div>

			<div className="flex flex-col gap-3">
				{days.map((day) => {
					const count = stats.dayDistribution[day] || 0
					const widthPct = (count / maxDayCount) * 100
					const isMostActive = day === stats.mostActiveDay && count > 0

					return (
						<div key={day} className="flex items-center gap-3 text-xs">
              <span
	              className={`w-16 ${
		              isMostActive ? 'text-orange-400 font-bold' : 'text-gray-500'
	              }`}
              >
                {day.substring(0, 3)}
              </span>
							<div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
								<div
									className={`h-full rounded-full ${
										isMostActive ? 'bg-orange-500' : 'bg-gray-600'
									}`}
									style={{width: `${widthPct}%`}}
								/>
							</div>
							<span className="w-6 text-right text-gray-500">{count}</span>
						</div>
					)
				})}
			</div>
		</div>
	)
}
