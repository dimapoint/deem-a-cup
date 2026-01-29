'use server'

import {revalidatePath} from 'next/cache'
import {createClient} from '@/utils/supabase/server'

const sanitizeFavoriteIds = (values: Array<FormDataEntryValue | null>) => {
	const cleaned = values
		.map((value) => (typeof value === 'string' ? value.trim() : ''))
		.filter((value) => value.length > 0)

	return Array.from(new Set(cleaned)).slice(0, 3)
}

export async function updateFavoriteCafes(formData: FormData) {
	const supabase = await createClient()

	const {data: {user}} = await supabase.auth.getUser()
	if (!user) {
		throw new Error('You must be logged in to update your favorite cafes')
	}

	const requestedIds = sanitizeFavoriteIds([
		formData.get('favorite_cafe_1'),
		formData.get('favorite_cafe_2'),
		formData.get('favorite_cafe_3'),
	])

	let favoriteCafeIds = requestedIds
	if (requestedIds.length > 0) {
		const {data: cafes, error} = await supabase
			.from('cafes')
			.select('id')
			.in('id', requestedIds)

		if (error) {
			console.error('Error validating favorite cafes:', error)
			throw new Error('Error saving your favorite cafes')
		}

		const validIds = new Set((cafes ?? []).map((cafe) => cafe.id))
		favoriteCafeIds = requestedIds.filter((id) => validIds.has(id))
	}

	const {error} = await supabase
		.from('profiles')
		.update({favorite_cafe_ids: favoriteCafeIds})
		.eq('id', user.id)

	if (error) {
		console.error('Error updating favorite cafes:', error)
		throw new Error('Error saving your favorite cafes')
	}

	revalidatePath('/profile')
}

export async function updateProfile(formData: FormData) {
	const supabase = await createClient()

	const {
		data: {user},
	} = await supabase.auth.getUser()

	if (!user) {
		throw new Error('You must be logged in to update your profile')
	}

	const fullName = formData.get('full_name') as string | null
	const username = formData.get('username') as string | null
	const website = formData.get('website') as string | null

	// Basic validation
	if (username && username.length < 3) {
		throw new Error('Username must be at least 3 characters long')
	}

	const updates: {
		full_name?: string
		username?: string
		website?: string
		updated_at: string
	} = {
		updated_at: new Date().toISOString(),
	}

	if (typeof fullName === 'string') updates.full_name = fullName
	if (typeof username === 'string') updates.username = username
	if (typeof website === 'string') updates.website = website

	const {error} = await supabase.from('profiles').update(updates).eq('id', user.id)

	if (error) {
		console.error('Error updating profile:', error)
		if (error.code === '23505') {
			throw new Error('Username already taken')
		}
		throw new Error('Error updating profile')
	}

	revalidatePath('/profile')
	revalidatePath('/') // Revalidate home feed to show new name
}
