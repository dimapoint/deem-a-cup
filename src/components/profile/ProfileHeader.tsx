import { ProfileRow } from '@/types/profile'
import { ReactNode } from 'react'
import { Avatar } from './header/Avatar'
import { UserInfo } from './header/UserInfo'

interface ProfileHeaderProps {
  profile: ProfileRow
  displayName: string
  memberSince?: string
  websiteUrl: string | null
  children?: ReactNode
}

export function ProfileHeader({
  profile,
  displayName,
  memberSince,
  websiteUrl,
  children
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <Avatar url={profile.avatar_url} alt={displayName} />
        <UserInfo
          displayName={displayName}
          username={profile.username}
          memberSince={memberSince}
          websiteUrl={websiteUrl}
          websiteDisplay={profile.website}
        >
          {children}
        </UserInfo>
      </div>
    </div>
  )
}
