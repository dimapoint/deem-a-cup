'use server'

import type {SupabaseClient} from '@supabase/supabase-js'
import type {Activity} from '@/types/database'

export async function insertActivity(
  supabase: SupabaseClient,
  actorId: string,
  verb: Activity['verb'],
  objectId: string,
  objectType: Activity['object_type']
): Promise<void> {
  const {error} = await supabase.from('activities').insert({
    actor_id: actorId,
    verb,
    object_id: objectId,
    object_type: objectType,
  })

  if (error) {
    console.error('Error inserting activity:', error)
    throw new Error(error.message)
  }
}
