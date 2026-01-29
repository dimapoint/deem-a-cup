'use server'

import {createClient} from '@/utils/supabase/server'
import {revalidatePath} from 'next/cache'
import type {Cafe, List, ListItem, Profile} from '@/types/database'

export async function createList(formData: FormData) {
	const supabase = await createClient()
	const {
		data: {user},
	} = await supabase.auth.getUser()

	if (!user) {
		throw new Error('Unauthorized')
	}

	const title = formData.get('title') as string
	const description = formData.get('description') as string
	const isRankedRaw = formData.get('is_ranked')
	const isRanked = isRankedRaw === 'on'

	if (!title) {
		throw new Error('Title is required')
	}

	const {error} = await supabase.from('lists').insert({
		user_id: user.id,
		title,
		description: description || null,
		is_ranked: isRanked,
	})

	if (error) {
		console.error('Error creating list:', error)
		throw new Error('Failed to create list')
	}

	revalidatePath('/profile')
	revalidatePath('/lists') // Assuming we might have a global lists page later
}

export async function addCafeToList(formData: FormData) {
	const supabase = await createClient()
	const {
		data: {user},
	} = await supabase.auth.getUser()

	if (!user) {
		throw new Error('Unauthorized')
	}

	const listId = formData.get('list_id') as string
	const cafeId = formData.get('cafe_id') as string
	const note = formData.get('note') as string

	if (!listId || !cafeId) {
		throw new Error('List ID and Cafe ID are required')
	}

	// For ranked lists, we need to find the current max order
	let order: number | null = null

	// Fetch list details to check if it's ranked
	const {data: list, error: listError} = await supabase
		.from('lists')
		.select('is_ranked')
		.eq('id', listId)
		.single()

	if (listError || !list) {
		throw new Error('List not found')
	}

	if (list.is_ranked) {
		const {data: maxOrderData, error: maxOrderError} = await supabase
			.from('list_items')
			.select('order')
			.eq('list_id', listId)
			.order('order', {ascending: false})
			.limit(1)
			.maybeSingle()

		if (!maxOrderError) {
			order = (maxOrderData?.order ?? 0) + 1
		}
	}

	const {error} = await supabase.from('list_items').insert({
		list_id: listId,
		cafe_id: cafeId,
		note: note || null,
		order: order,
	})

	if (error) {
		if (error.code === '23505') {
			// Unique violation
			throw new Error('This cafe is already in the list')
		}
		console.error('Error adding cafe to list:', error)
		throw new Error('Failed to add cafe to list')
	}

	revalidatePath(`/lists/${listId}`)
}

export type ListWithCount = List & { count: number }

export async function getUserLists(userId: string): Promise<ListWithCount[]> {
	const supabase = await createClient()

	const {data, error} = await supabase
		.from('lists')
		.select(`
            *,
            list_items (count)
        `)
		.eq('user_id', userId)
		.order('created_at', {ascending: false})

	if (error) {
		console.error('Error fetching user lists:', error)
		return []
	}

	return data.map((list) => ({
		...list,
		count: list.list_items[0]?.count ?? 0,
	}))
}

export type ListItemWithCafe = ListItem & {
	cafe: Pick<Cafe, 'id' | 'name' | 'address' | 'place_id'>
}

export type ListDetails = List & {
	items: ListItemWithCafe[]
	user: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'>
}

export async function getListDetails(listId: string): Promise<ListDetails | null> {
	const supabase = await createClient()

	const {data: list, error: listError} = await supabase
		.from('lists')
		.select(`
            *,
            user:profiles (
                id,
                username,
                full_name,
                avatar_url
            )
        `)
		.eq('id', listId)
		.single()

	if (listError || !list) {
		console.error('Error fetching list details:', listError)
		return null
	}

	const {data: items, error: itemsError} = await supabase
		.from('list_items')
		.select(`
            *,
            cafe:cafes (
                id,
                name,
                address,
                place_id
            )
        `)
		.eq('list_id', listId)
		.order(list.is_ranked ? 'order' : 'created_at', {ascending: true})

	if (itemsError) {
		console.error('Error fetching list items:', itemsError)
		return null
	}

	return {
		...list,
		user: list.user,
		items: items as ListItemWithCafe[],
	}
}
