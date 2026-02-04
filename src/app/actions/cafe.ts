'use server'

import {createClient} from '@/utils/supabase/server'
import {Cafe} from '@/types/database'
import {getPlaceLocation} from '@/app/actions/places'

export async function getOrCreateCafe(placeId: string, name: string, address: string | null): Promise<Cafe> {
	const supabase = await createClient()

	// 1. Check if cafe exists
	const {data: existingCafe} = await supabase.from('cafes').select('*').eq('place_id', placeId).single()

	if (existingCafe) {
		return existingCafe as Cafe
	}

	// 2. If not, insert it
	// We need to ensure the user is authenticated, though the RLS policies will also enforce this.
	// The createClient from utils/supabase/server should handle the session.

	// Fetch location
	const location = await getPlaceLocation(placeId)

	const {data: newCafe, error: insertError} = await supabase
		.from('cafes')
		.insert({
			name,
			address,
			place_id: placeId,
			latitude: location?.lat,
			longitude: location?.lng,
		})
		.select()
		.single()

	if (insertError) {
		console.error('Error creating cafe:', insertError)
		throw new Error('Could not create cafe')
	}

	return newCafe as Cafe
}

export async function createCafe(formData: FormData) {
	const name = formData.get('name') as string
	const address = formData.get('address') as string
	const placeIdInput = formData.get('place_id') as string

	// Use provided place_id or generate a unique one for manual entries
	const placeId = placeIdInput || `manual-${crypto.randomUUID()}`

	await getOrCreateCafe(placeId, name, address || null)
}
