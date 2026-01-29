'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function followUser(followingId: string) {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		throw new Error('Unauthorized')
	}

	const { error } = await supabase.from('follows').insert({
		follower_id: user.id,
		following_id: followingId,
	})

	if (error) {
		console.error('Error following user:', error)
		throw new Error('Failed to follow user')
	}

	revalidatePath(`/u/${followingId}`)
	revalidatePath(`/profile`)
}

export async function unfollowUser(followingId: string) {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		throw new Error('Unauthorized')
	}

	const { error } = await supabase
		.from('follows')
		.delete()
		.eq('follower_id', user.id)
		.eq('following_id', followingId)

	if (error) {
		console.error('Error unfollowing user:', error)
		throw new Error('Failed to unfollow user')
	}

	revalidatePath(`/u/${followingId}`)
	revalidatePath(`/profile`)
}
