'use client'

import { PopularCafe } from '@/app/actions/nearby'
import { Star } from 'lucide-react'

interface NearbyCafeCardProps {
  cafe: PopularCafe
  onSelect: (cafe: PopularCafe) => void
}

export function NearbyCafeCard({ cafe, onSelect }: NearbyCafeCardProps) {
  return (
    <div
      onClick={() => onSelect(cafe)}
      className="bg-[#1e232b] p-4 rounded-xl border border-gray-800 hover:border-orange-500/50 cursor-pointer transition group"
    >
      <h3 className="font-bold text-lg group-hover:text-orange-400 transition truncate">{cafe.name}</h3>
      <p className="text-gray-400 text-sm truncate">{cafe.address}</p>
      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Star size={14} className="text-yellow-500" fill="currentColor" />
          {cafe.avg_rating ? Number(cafe.avg_rating).toFixed(1) : '-'}
        </span>
        <span>•</span>
        <span>{cafe.visit_count} visits</span>
        <span>•</span>
        <span>{cafe.distance_km.toFixed(1)} km</span>
      </div>
    </div>
  )
}
