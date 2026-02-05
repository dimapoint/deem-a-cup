import { UserMinus, UserPlus } from 'lucide-react'

interface FollowButtonContentProps {
  isFollowing: boolean
}

export function FollowButtonContent({ isFollowing }: FollowButtonContentProps) {
  return isFollowing ? (
    <>
      <UserMinus size={14} />
      Unfollow
    </>
  ) : (
    <>
      <UserPlus size={14} />
      Follow
    </>
  )
}
