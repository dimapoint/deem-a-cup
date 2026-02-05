import {UserStats} from '@/app/actions/stats'
import {YearProgress} from './YearProgress'
import {RatingDistribution} from './RatingDistribution'
import {WeeklyActivity} from './WeeklyActivity'

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
