'use server'

import {createClient} from '@/utils/supabase/server'
import type {Activity, Profile} from '@/types/database'

export type ActivityWithActor = Activity & {
  actor: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'>
}

export async function getFeedActivities(limit = 20): Promise<ActivityWithActor[]> {
  const supabase = await createClient()
  const {data: {user}} = await supabase.auth.getUser()
  if (!user) return []

  // Get IDs of users this user follows
  const {data: followingRows, error: followError} = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  if (followError || !followingRows?.length) return []

  const followingIds = followingRows.map((f) => f.following_id)

  const {data, error} = await supabase
    .from('activities')
    .select(`
      *,
      actor:profiles!actor_id(id, username, full_name, avatar_url)
    `)
    .in('actor_id', followingIds)
    .order('created_at', {ascending: false})
    .limit(limit)

  if (error) {
    console.error('Error fetching feed activities:', error)
    return []
  }

  return data as ActivityWithActor[]
}
