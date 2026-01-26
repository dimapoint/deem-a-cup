'use server'

import {createClient} from '@/utils/supabase/server'
import {revalidatePath} from 'next/cache'

export async function logCoffee(formData: FormData) {
	const supabase = await createClient()

	const {
		data: {user},
	} = await supabase.auth.getUser()

	if (!user) {
		throw new Error('Debes iniciar sesión para loguear una visita')
	}

	const cafe_id = formData.get('cafe_id') as string
	const ratingRaw = formData.get('rating')
	const review = formData.get('review') as string
	const likedRaw = formData.get('liked')
	// visited_at is optional in prompt extraction list, but DB has default now().
	// We extract it if present, though UI task doesn't ask for input.
	const visitedAtRaw = formData.get('visited_at') as string
	
	const rating = ratingRaw ? Number(ratingRaw) : null
	const liked = likedRaw === 'on'

	const {error} = await supabase.from('deems').insert({
		user_id: user.id,
		cafe_id,
		rating,
		review,
		liked,
		visited_at: visitedAtRaw || undefined // Let DB default to now() if undefined
	})

	if (error) {
		console.error('Error logging coffee:', error)
		throw new Error('Error al guardar la visita')
	}

	revalidatePath('/')
}
