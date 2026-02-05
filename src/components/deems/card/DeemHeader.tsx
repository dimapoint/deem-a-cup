import { DeemWithDetails } from '@/app/actions/deem'
import { CoffeeRating } from '../CoffeeRating'
import { User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/utils/date'

export function DeemHeader({ deem }: { deem: DeemWithDetails }) {
  const { cafe, profile } = deem
  const profileUrl = profile?.username ? `/u/${profile.username}` : null

  return (
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        {profileUrl ? (
          <Link href={profileUrl}>
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600 hover:border-orange-500 transition-colors">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User'}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={20} className="text-gray-400" />
              )}
            </div>
          </Link>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name || 'User'}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={20} className="text-gray-400" />
            )}
          </div>
        )}
        <div>
          <div className="flex items-baseline gap-2">
            {profileUrl ? (
              <Link href={profileUrl} className="font-bold text-gray-200 hover:text-orange-400 transition-colors">
                {profile?.full_name || profile?.username || 'Anonymous'}
              </Link>
            ) : (
              <span className="font-bold text-gray-200">
                {profile?.full_name || profile?.username || 'Anonymous'}
              </span>
            )}
            <span className="text-xs text-gray-500">visited</span>
            <span className="font-bold text-orange-400">{cafe.name}</span>
          </div>
          <p className="text-xs text-gray-500">{formatDate(deem.visited_at)}</p>
        </div>
      </div>

      {/* Rating */}
      {deem.rating !== null && (
        <div className="flex items-center bg-gray-800 px-2 py-1 rounded-md border border-gray-700">
          <CoffeeRating rating={deem.rating} size="sm" />
        </div>
      )}
    </div>
  )
}
