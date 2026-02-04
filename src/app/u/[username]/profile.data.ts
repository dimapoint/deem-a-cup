import { createClient } from '@/utils/supabase/server'
import { DeemWithCafe, ProfileRow } from '@/types/profile'
import { calculateProfileStats, getProfileCafes } from '@/utils/profile-calculations'

export async function fetchProfilePageData(username: string) {
  const supabase = await createClient()

  const [userResult, profileResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, website, favorite_cafe_ids, created_at')
      .eq('username', username)
      .maybeSingle(),
  ])

  const currentUser = userResult.data.user
  const profile = profileResult.data as ProfileRow | null

  if (!profile) {
    return null
  }

  const isOwnProfile = currentUser?.id === profile.id

  const [followResult, deemsResult] = await Promise.all([
    currentUser && !isOwnProfile
      ? supabase
          .from('follows')
          .select('created_at')
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('deems')
      .select(`
        id,
        rating,
        review,
        liked,
        visited_at,
        created_at,
        cafe:cafe_id (
          id,
          name,
          place_id,
          address
        )
      `)
      .eq('user_id', profile.id)
      .order('visited_at', { ascending: false })
      .returns<DeemWithCafe[]>()
  ])

  const deems = (deemsResult.data ?? []) as DeemWithCafe[]
  const deemsError = deemsResult.error

  // Calculate stats and fetch extra cafe info if needed
  const stats = calculateProfileStats(deems)
  const { favoriteCafes } = await getProfileCafes(profile, deems, supabase)

  return {
    currentUser,
    profile,
    isOwnProfile,
    isFollowing: !!followResult.data,
    deems,
    deemsError,
    stats,
    favoriteCafes
  }
}
