import { ReactNode } from 'react'
import { Calendar, Link2 } from 'lucide-react'

interface UserInfoProps {
  displayName: string
  username: string | null
  memberSince?: string
  websiteUrl: string | null
  websiteDisplay: string | null
  children?: ReactNode
}

export function UserInfo({
  displayName,
  username,
  memberSince,
  websiteUrl,
  websiteDisplay,
  children
}: UserInfoProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-3xl font-bold text-white">{displayName}</h1>
        {username && (
          <span className="text-sm text-gray-500">@{username}</span>
        )}
      </div>

      {children}

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        {memberSince && (
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            Member since {memberSince}
          </span>
        )}
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-orange-400 hover:text-orange-300"
          >
            <Link2 size={14} />
            {websiteDisplay}
          </a>
        )}
      </div>
    </div>
  )
}
