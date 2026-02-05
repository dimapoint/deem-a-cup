'use server'

import {createClient} from '@/utils/supabase/server'
import {revalidatePath} from 'next/cache'
import type {Cafe, List, ListItem, Profile} from '@/types/database'

/**
 * Creates a new list for the authenticated user.
 *
 * @param {FormData} formData - The form data containing title, description, and is_ranked.
 * @throws {Error} If the user is not authenticated or the title is missing.
 */
export async function createList(formData: FormData): Promise<void> {
	const supabase = await createClient()
	const {
		data: {user},
	} = await supabase.auth.getUser()

	if (!user) {
		throw new Error('Unauthorized')
	}

	const title = formData.get('title') as string
	const description = formData.get('description') as string
	const isRanked = formData.get('is_ranked') === 'on'

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

	// Fetch username for revalidation
	const {data: profile} = await supabase
		.from('profiles')
		.select('username')
		.eq('id', user.id)
		.single()

	if (profile?.username) {
		revalidatePath(`/u/${profile.username}`)
	}
	revalidatePath('/profile')
	revalidatePath('/lists')
}

/**
 * Adds a cafe to a specific list.
 * If the list is ranked, it appends the cafe to the end of the list.
 *
 * @param {FormData} formData - The form data containing list_id, cafe_id, and note.
 * @throws {Error} If the user is not authenticated, required fields are missing, or the cafe is
 *     already in the list.
 */
export async function addCafeToList(formData: FormData): Promise<void> {
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

	// Check if the list is ranked to determine order
	const {data: list, error: listError} = await supabase
		.from('lists')
		.select('is_ranked')
		.eq('id', listId)
		.single()

	if (listError || !list) {
		throw new Error('List not found')
	}

	let order: number | null = null

	if (list.is_ranked) {
		const {data: maxOrderData} = await supabase
			.from('list_items')
			.select('order')
			.eq('list_id', listId)
			.order('order', {ascending: false})
			.limit(1)
			.maybeSingle()

		order = (maxOrderData?.order ?? 0) + 1
	}

	const {error} = await supabase.from('list_items').insert({
		list_id: listId,
		cafe_id: cafeId,
		note: note || null,
		order,
	})

	if (error) {
		if (error.code === '23505') {
			// Unique violation code
			throw new Error('This cafe is already in the list')
		}
		console.error('Error adding cafe to list:', error)
		throw new Error('Failed to add cafe to list')
	}

	revalidatePath(`/lists/${listId}`)
}

export type ListWithCount = List & { count: number }

/**
 * Fetches all lists for a specific user, including the count of items in each list.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Promise<ListWithCount[]>} A list of user lists with item counts.
 */
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

/**
 * Fetches detailed information about a specific list, including its items and the owner.
 *
 * @param {string} listId - The ID of the list.
 * @returns {Promise<ListDetails | null>} The list details or null if not found.
 */
export async function getListDetails(listId: string): Promise<ListDetails | null> {
	const supabase = await createClient()

	// Fetch list metadata and owner
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

	// Fetch list items with cafe details
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
