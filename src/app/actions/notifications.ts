'use server'

import {createClient} from '@/utils/supabase/server'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Notification} from '@/types/database'
import {revalidatePath} from 'next/cache'

// ── Helpers (inject client for testability) ──────────────────────────────────

export async function insertNotificationsForFollowers(
  supabase: SupabaseClient,
  actorId: string,
  type: Notification['type'],
  objectId: string,
  objectType: string
): Promise<void> {
  const {error} = await supabase.rpc('insert_notifications_for_followers', {
    p_actor_id: actorId,
    p_type: type,
    p_object_id: objectId,
    p_object_type: objectType,
  })

  if (error) {
    console.error('Error inserting notifications for followers:', error)
    throw new Error(error.message)
  }
}

export async function insertNotificationForUser(
  supabase: SupabaseClient,
  userId: string,
  actorId: string,
  type: Notification['type'],
  objectId: string,
  objectType: string
): Promise<void> {
  const {error} = await supabase.rpc('insert_notification', {
    p_user_id: userId,
    p_actor_id: actorId,
    p_type: type,
    p_object_id: objectId,
    p_object_type: objectType,
  })

  if (error) {
    console.error('Error inserting notification:', error)
    throw new Error(error.message)
  }
}

// ── Server Actions ────────────────────────────────────────────────────────────

export type NotificationWithActor = Notification & {
  actor: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  }
}

export async function getNotifications(): Promise<NotificationWithActor[]> {
  const supabase = await createClient()
  const {data: {user}} = await supabase.auth.getUser()
  if (!user) return []

  const {data, error} = await supabase
    .from('notifications')
    .select(`
      *,
      actor:profiles!actor_id(username, full_name, avatar_url)
    `)
    .eq('user_id', user.id)
    .order('created_at', {ascending: false})
    .limit(50)

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data as NotificationWithActor[]
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = await createClient()
  const {data: {user}} = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const {error} = await supabase
    .from('notifications')
    .update({read: true})
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/profile')
}
