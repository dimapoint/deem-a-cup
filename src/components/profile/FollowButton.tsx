'use client'

import {useState, useTransition} from 'react'
import {followUser, unfollowUser} from '@/app/actions/social'
import {FollowButtonContent} from './follow/FollowButtonContent'

interface FollowButtonProps {
	targetUserId: string
	initialIsFollowing: boolean
}

export function FollowButton({targetUserId, initialIsFollowing}: FollowButtonProps) {
	const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
	const [isPending, startTransition] = useTransition()

	const toggleFollow = () => {
		const nextState = !isFollowing
		setIsFollowing(nextState) // Optimistic update

		startTransition(async () => {
			try {
				if (nextState) {
					await followUser(targetUserId)
				} else {
					await unfollowUser(targetUserId)
				}
			} catch (error) {
				// Revert on error
				setIsFollowing(!nextState)
				console.error('Failed to update follow status:', error)
			}
		})
	}

	return (
		<button
			onClick={toggleFollow}
			disabled={isPending}
			className={`
        flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition
        ${
				isFollowing
					? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-red-900/30 hover:text-red-300 hover:border-red-900/50'
					: 'bg-orange-500 text-white border border-transparent hover:bg-orange-400'
			}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
		>
			<FollowButtonContent isFollowing={isFollowing}/>
		</button>
	)
}
