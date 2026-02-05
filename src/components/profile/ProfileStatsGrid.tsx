import {Coffee, Heart, MapPin} from 'lucide-react'
import {StatItem} from './stats/StatItem'

interface ProfileStatsGridProps {
	visitCount: number
	cafeCount: number
	likedCount: number
	averageRating: number | null
}

export function ProfileStatsGrid({
	                                 visitCount,
	                                 cafeCount,
	                                 likedCount,
	                                 averageRating
                                 }: ProfileStatsGridProps) {
	const stats = [
		{
			label: 'Visits',
			value: String(visitCount),
			icon: <Coffee size={14} className="text-gray-400"/>
		},
		{
			label: 'Cafes',
			value: String(cafeCount),
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
		<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
			{stats.map((stat) => (
				<StatItem
					key={stat.label}
					label={stat.label}
					value={stat.value}
					icon={stat.icon}
				/>
			))}
		</div>
	)
}
