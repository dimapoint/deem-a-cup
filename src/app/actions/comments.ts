'use server'

import {createClient} from '@/utils/supabase/server'
import type {DeemComment, Profile} from '@/types/database'
import {revalidatePath} from 'next/cache'
import {insertNotificationForUser} from '@/app/actions/notifications'
import {buildCommentInsert} from './comment-helpers'

export type DeemCommentWithAuthor = DeemComment & {
  author: Pick<Profile, 'username' | 'full_name' | 'avatar_url'>
}

export async function addDeemComment(deemId: string, content: string): Promise<void> {
  const supabase = await createClient()
  const {data: {user}} = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const payload = buildCommentInsert(deemId, user.id, content)

  const {error} = await supabase.from('deem_comments').insert(payload)
  if (error) throw new Error(error.message)

  // Notify the deem author (if different from commenter)
  const {data: deem} = await supabase
    .from('deems')
    .select('user_id')
    .eq('id', deemId)
    .single()

  if (deem && deem.user_id !== user.id) {
    await insertNotificationForUser(
      supabase,
      deem.user_id,
      user.id,
      'new_comment',
      deemId,
      'deem'
    )
  }

  revalidatePath('/')
}

export async function getDeemComments(deemId: string): Promise<DeemCommentWithAuthor[]> {
  const supabase = await createClient()

  const {data, error} = await supabase
    .from('deem_comments')
    .select(`
      *,
      author:profiles!user_id(username, full_name, avatar_url)
    `)
    .eq('deem_id', deemId)
    .order('created_at', {ascending: true})

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  return data as DeemCommentWithAuthor[]
}
