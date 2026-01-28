'use server'

import {createClient} from '@/utils/supabase/server'
import {revalidatePath} from 'next/cache'

export async function toggleWatchlist(cafeId: string, currentState: boolean) {
	const supabase = await createClient()

	try {
		const {
			data: {user},
		} = await supabase.auth.getUser()

		if (!user) {
			throw new Error('You must be logged in to manage your watchlist')
		}

		if (currentState) {
			// Remove from watchlist
			const {error} = await supabase
				.from('watchlist')
				.delete()
				.match({user_id: user.id, cafe_id: cafeId})

			if (error) throw error

			revalidatePath('/')
			return {success: true, isInWatchlist: false}
		} else {
			// Add to watchlist
			const {error} = await supabase
				.from('watchlist')
				.insert({user_id: user.id, cafe_id: cafeId})

			if (error) throw error

			revalidatePath('/')
			return {success: true, isInWatchlist: true}
		}
	} catch (error) {
		console.error('Error toggling watchlist:', error)
		return {success: false, isInWatchlist: currentState}
	}
}
