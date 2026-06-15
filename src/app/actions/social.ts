'use server'

import {createClient} from '@/utils/supabase/server'
import {revalidatePath} from 'next/cache'
import {insertActivity} from '@/app/actions/activity'
import {insertNotificationForUser} from '@/app/actions/notifications'

/**
 * Follows a user.
 *
 * Creates a new record in the 'follows' table linking the current authenticated user
 * as the follower and the specified user as the one being followed.
 * Revalidates the profile paths to reflect the change.
 *
 * @param followingId - The UUID of the user to follow.
 * @throws {Error} If the user is not authenticated or if the database operation fails.
 */
export async function followUser(followingId: string) {
	const supabase = await createClient()
	const {
		data: {user},
	} = await supabase.auth.getUser()

	if (!user) {
		throw new Error('Unauthorized')
	}

	const {error} = await supabase.from('follows').insert({
		follower_id: user.id,
		following_id: followingId,
	})

	if (error) {
		console.error('Error following user:', error)
		throw new Error('Failed to follow user')
	}

	// Non-fatal side-effects: await so the writes complete before the action
	// returns (serverless can drop unawaited promises). The helpers log their
	// own errors, and allSettled never rejects, so followUser never fails here.
	await Promise.allSettled([
		insertActivity(supabase, user.id, 'followed', followingId, 'follow'),
		insertNotificationForUser(supabase, followingId, user.id, 'new_follow', followingId, 'follow'),
	])

	// Fetch username for revalidation
	const {data: profile} = await supabase
		.from('profiles')
		.select('username')
		.eq('id', followingId)
		.single()

	if (profile?.username) {
		revalidatePath(`/u/${profile.username}`)
	}
	revalidatePath(`/profile`)
}

/**
 * Unfollows a user.
 *
 * Removes the record from the 'follows' table where the current authenticated user
 * is the follower and the specified user is the one being followed.
 * Revalidates the profile paths to reflect the change.
 *
 * @param followingId - The UUID of the user to unfollow.
 * @throws {Error} If the user is not authenticated or if the database operation fails.
 */
export async function unfollowUser(followingId: string) {
	const supabase = await createClient()
	const {
		data: {user},
	} = await supabase.auth.getUser()

	if (!user) {
		throw new Error('Unauthorized')
	}

	const {error} = await supabase
		.from('follows')
		.delete()
		.eq('follower_id', user.id)
		.eq('following_id', followingId)

	if (error) {
		console.error('Error unfollowing user:', error)
		throw new Error('Failed to unfollow user')
	}

	// Fetch username for revalidation
	const {data: profile} = await supabase
		.from('profiles')
		.select('username')
		.eq('id', followingId)
		.single()

	if (profile?.username) {
		revalidatePath(`/u/${profile.username}`)
	}
	revalidatePath(`/profile`)
}
