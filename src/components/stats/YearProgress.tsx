import { UserStats } from '@/app/actions/stats'
import { Calendar } from 'lucide-react'

export function YearProgress({ stats }: { stats: UserStats }) {
  // Goal for the year (Arbitrary for now, maybe user setting later)
  const yearGoal = 52 // 1 per week
  const yearProgress = Math.min((stats.thisYearCount / yearGoal) * 100, 100)
  const remaining = yearGoal - stats.thisYearCount

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1e232b] p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500 mb-3">
        <Calendar size={14} />
        <span>Cafes this year</span>
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-2xl font-bold text-white">{stats.thisYearCount}</span>
        <span className="text-xs text-gray-500 mb-1">/ {yearGoal} goal</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-orange-500 transition-all duration-500"
          style={{ width: `${yearProgress}%` }}
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
