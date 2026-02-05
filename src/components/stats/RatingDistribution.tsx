import { UserStats } from '@/app/actions/stats'
import { Star } from 'lucide-react'

export function RatingDistribution({ stats }: { stats: UserStats }) {
  // Pre-calculate buckets to determine the correct max value for scaling
  const buckets = [1, 2, 3, 4, 5].map((rating) => {
    const count =
      (stats.ratingDistribution[rating.toString()] || 0) +
      (stats.ratingDistribution[(rating + 0.5).toString()] || 0)
    return { rating, count }
  })

  const maxBucketCount = Math.max(...buckets.map((b) => b.count), 1)

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1e232b] p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500 mb-4">
        <Star size={14} />
        <span>Rating Distribution</span>
      </div>

      <div className="flex items-end justify-between h-32 gap-1">
        {buckets.map(({ rating, count }) => {
          const heightPct = (count / (stats.totalDeems || 1)) * 100
          // Visual scaling relative to max to fill height
          const visualHeight = (count / maxBucketCount) * 100

          return (
            <div
              key={rating}
              className="flex flex-col items-center gap-1 w-full group relative"
            >
              {/* Tooltip */}
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-xs text-white px-2 py-1 rounded border border-gray-700 pointer-events-none whitespace-nowrap z-10">
                {count} logs ({heightPct.toFixed(0)}%)
              </div>
              <div className="flex-1 w-full flex items-end justify-center">
                <div
                  className="w-full max-w-[20px] bg-gray-700 rounded-t-sm hover:bg-orange-400 transition-colors"
                  style={{ height: `${visualHeight || 2}%` }} // Min 2% for visibility
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
