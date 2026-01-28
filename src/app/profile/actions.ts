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
		throw new Error('Debes iniciar sesion para actualizar tus cafeterias favoritas')
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
			throw new Error('Error al guardar tus cafeterias favoritas')
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
		throw new Error('Error al guardar tus cafeterias favoritas')
	}

	revalidatePath('/profile')
}
