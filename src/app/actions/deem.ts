'use server'

import { createClient } from '@/utils/supabase/server'
import type { Cafe, Deem, Profile, Watchlist } from '@/types/database'
import { revalidatePath } from 'next/cache'

// --- Types ---

export type DeemWithDetails = Deem & {
  cafe: Pick<Cafe, 'id' | 'name' | 'place_id' | 'address'> & {
    isSaved: boolean
  }
  profile: Pick<Profile, 'full_name' | 'username' | 'avatar_url'>
}

type CafeSummary = Pick<Cafe, 'id' | 'name' | 'place_id' | 'address'>
type ProfileSummary = Pick<Profile, 'id' | 'full_name' | 'username' | 'avatar_url'>
type WatchlistCafe = Pick<Watchlist, 'cafe_id'>

// --- Helpers ---

function parseString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function parseNumber(value: FormDataEntryValue | null): number | null {
  const str = parseString(value)
  if (!str) return null
  const parsed = Number(str)
  return Number.isFinite(parsed) ? parsed : null
}

function parseCurrency(value: FormDataEntryValue | null): number | null {
  if (typeof value !== 'string') return null
  const cleaned = value.trim().replace(/[^\d.-]/g, '')
  if (!cleaned) return null
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

function parseTags(value: FormDataEntryValue | null): string[] {
  const str = parseString(value)
  if (!str) return []
  try {
    const parsed = JSON.parse(str)
    if (Array.isArray(parsed)) {
      return parsed.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
    }
  } catch (error) {
    console.error('Error parsing tags:', error)
  }
  return []
}

// --- Actions ---

/**
 * Logs a new coffee visit (Deem).
 *
 * Validates the user session and form data before inserting into the database.
 * Revalidates the home path upon success.
 *
 * @param formData - The form data containing visit details.
 * @throws Error if the user is not logged in or if the cafe_id is missing.
 */
export async function logCoffee(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to log a visit')
  }

  const cafeId = parseString(formData.get('cafe_id'))
  if (!cafeId) {
    throw new Error('Missing cafe id')
  }

  const deemData = {
    user_id: user.id,
    cafe_id: cafeId,
    rating: parseNumber(formData.get('rating')),
    review: parseString(formData.get('review')),
    brew_method: parseString(formData.get('brew_method')),
    bean_origin: parseString(formData.get('bean_origin')),
    roaster: parseString(formData.get('roaster')),
    tags: parseTags(formData.get('tags')),
    price: parseCurrency(formData.get('price')),
    liked: formData.get('liked') === 'on',
    visited_at: parseString(formData.get('visited_at')) || new Date().toISOString(),
  }

  const { error } = await supabase.from('deems').insert(deemData)

  if (error) {
    console.error('Error logging coffee:', error)
    throw new Error(error.message || 'Error saving visit')
  }

  revalidatePath('/')
}

/**
 * Fetches the most recent Deems (visits) with related Cafe and Profile details.
 *
 * Uses a batch fetching strategy to avoid N+1 query problems:
 * 1. Fetches recent Deems.
 * 2. Collects unique Cafe IDs and User IDs.
 * 3. Fetches related Cafes, Profiles, and the current user's Watchlist in parallel.
 * 4. Maps the results back to the Deems.
 *
 * @returns A list of Deems with expanded details.
 */
export async function getRecentDeems(): Promise<DeemWithDetails[]> {
  const supabase = await createClient()

  try {
    // 1. Fetch Deems
    const { data: deemsData, error: deemsError } = await supabase
      .from('deems')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (deemsError) {
      console.error('Error fetching deems table:', deemsError)
      return []
    }

    const deems = (deemsData ?? []) as Deem[]
    if (deems.length === 0) return []

    // 2. Extract IDs for batch fetching
    const cafeIds = Array.from(new Set(deems.map((d) => d.cafe_id)))
    const userIds = Array.from(new Set(deems.map((d) => d.user_id)))

    // 3. Fetch related data
    const { data: { user } } = await supabase.auth.getUser()

    const [cafesResult, profilesResult, watchlistResult] = await Promise.all([
      supabase.from('cafes').select('id, name, place_id, address').in('id', cafeIds),
      supabase.from('profiles').select('id, full_name, username, avatar_url').in('id', userIds),
      user
        ? supabase.from('watchlist').select('cafe_id').eq('user_id', user.id).in('cafe_id', cafeIds)
        : Promise.resolve({ data: [], error: null }),
    ])

    if (cafesResult.error) console.error('Error fetching cafes:', cafesResult.error)
    if (profilesResult.error) console.error('Error fetching profiles:', profilesResult.error)

    const cafes = (cafesResult.data as CafeSummary[]) ?? []
    const profiles = (profilesResult.data as ProfileSummary[]) ?? []
    const watchlist = (watchlistResult.data as WatchlistCafe[]) ?? []

    const cafeMap = new Map(cafes.map((c) => [c.id, c]))
    const profileMap = new Map(profiles.map((p) => [p.id, p]))
    const watchlistSet = new Set(watchlist.map((w) => w.cafe_id))

    // 4. Map data back
    return deems.map((deem) => {
      const cafe = cafeMap.get(deem.cafe_id)
      const profile = profileMap.get(deem.user_id)

      return {
        ...deem,
        cafe: cafe
          ? { ...cafe, isSaved: watchlistSet.has(cafe.id) }
          : { id: deem.cafe_id, name: 'Unknown Cafe', place_id: '', address: null, isSaved: false },
        profile: profile ?? { full_name: 'Unknown User', username: 'unknown', avatar_url: null },
      }
    })
  } catch (e) {
    console.error('Unexpected error in getRecentDeems:', e)
    return []
  }
}
