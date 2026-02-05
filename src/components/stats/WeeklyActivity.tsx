import { UserStats } from '@/app/actions/stats'
import { BarChart3 } from 'lucide-react'

export function WeeklyActivity({ stats }: { stats: UserStats }) {
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
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500 mb-4">
        <BarChart3 size={14} />
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
                  style={{ width: `${widthPct}%` }}
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
