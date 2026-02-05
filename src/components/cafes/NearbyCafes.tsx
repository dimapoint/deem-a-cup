'use client'

import { useEffect, useState } from 'react'
import { getNearbyPopularCafes, PopularCafe } from '@/app/actions/nearby'
import { MapPin } from 'lucide-react'
import { NearbyCafeCard } from './NearbyCafeCard'

export function NearbyCafes({ onSelectAction }: { onSelectAction: (cafe: PopularCafe) => void }) {
  const [cafes, setCafes] = useState<PopularCafe[]>([])
  const [loading, setLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await getNearbyPopularCafes(position.coords.latitude, position.coords.longitude)
          setCafes(data)
        } catch (e) {
          console.error(e)
          setLocationError('Failed to fetch nearby cafes')
        } finally {
          setLoading(false)
        }
      },
      () => {
        setLoading(false)
        setLocationError('Location access denied. Please enable location to see nearby cafes.')
      }
    )
  }, [])

  if (loading) {
    return (
      <div className="mb-8 animate-pulse">
        <div className="h-6 w-48 bg-gray-800 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-32 bg-gray-800 rounded-xl"></div>
          <div className="h-32 bg-gray-800 rounded-xl"></div>
          <div className="h-32 bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (locationError) {
    return (
      <div className="mb-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700 text-center text-gray-400">
        <MapPin className="text-gray-500 mx-auto mb-2" size={24} />
        <p>{locationError}</p>
      </div>
    )
  }

  if (cafes.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <MapPin className="text-orange-500" />
        Popular Near You
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cafes.map(cafe => (
          <NearbyCafeCard key={cafe.id} cafe={cafe} onSelect={onSelectAction} />
        ))}
      </div>
    </div>
  )
}
