'use server'

import { createClient } from '@/utils/supabase/server'
import { Cafe } from '@/types/database'
import { getPlaceLocation } from '@/app/actions/places'
import { parseString } from '@/utils/parsers'

/**
 * Retrieves an existing cafe by its Google Place ID or creates a new one if it doesn't exist.
 *
 * @param placeId - The unique Google Place ID or a manually generated ID.
 * @param name - The name of the cafe.
 * @param address - The physical address of the cafe (optional).
 * @returns The existing or newly created Cafe object.
 * @throws Error if the cafe cannot be created.
 */
export async function getOrCreateCafe(
  placeId: string,
  name: string,
  address: string | null
): Promise<Cafe> {
  const supabase = await createClient()

  // 1. Check if cafe exists
  const { data: existingCafe, error: fetchError } = await supabase
    .from('cafes')
    .select('*')
    .eq('place_id', placeId)
    .single()

  if (existingCafe) {
    return existingCafe as Cafe
  }

  // Ignore "PGRST116" error which means no rows returned.
  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error checking for existing cafe:', fetchError)
  }

  // 2. Fetch location details (latitude/longitude)
  // If placeId is manual or invalid, this will return null, which is handled below.
  const location = await getPlaceLocation(placeId)

  // 3. Create new cafe
  const { data: newCafe, error: insertError } = await supabase
    .from('cafes')
    .insert({
      name,
      address,
      place_id: placeId,
      latitude: location?.lat ?? null,
      longitude: location?.lng ?? null,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Error creating cafe:', insertError)
    throw new Error(`Could not create cafe: ${insertError.message}`)
  }

  return newCafe as Cafe
}

/**
 * Server Action to create a cafe from form data.
 * Useful for manual entry or when triggered directly from a form submission.
 *
 * @param formData - The form data containing 'name', 'address', and optional 'place_id'.
 * @returns The created or retrieved Cafe object.
 * @throws Error if the name is missing.
 */
export async function createCafe(formData: FormData): Promise<Cafe> {
  const name = parseString(formData.get('name'))
  const address = parseString(formData.get('address'))
  const placeIdInput = parseString(formData.get('place_id'))

  if (!name) {
    throw new Error('Cafe name is required')
  }

  // Use provided place_id or generate a unique one for manual entries
  const placeId = placeIdInput || `manual-${crypto.randomUUID()}`

  return await getOrCreateCafe(placeId, name, address || null)
}
