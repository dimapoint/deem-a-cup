import {describe, it, expect, mock} from 'bun:test'
import {
  insertNotificationsForFollowers,
  insertNotificationForUser,
} from '@/app/actions/notifications'
import type {SupabaseClient} from '@supabase/supabase-js'

type MockResult = {error: {message: string} | null}

function makeMockRpc(result: MockResult = {error: null}) {
  const mockRpc = mock(() => Promise.resolve(result))
  return {supabase: {rpc: mockRpc} as unknown as SupabaseClient, mockRpc}
}

describe('insertNotificationsForFollowers', () => {
  it('calls insert_notifications_for_followers RPC with correct params', async () => {
    const {supabase, mockRpc} = makeMockRpc()

    await insertNotificationsForFollowers(supabase, 'actor-1', 'new_deem', 'deem-1', 'deem')

    expect(mockRpc).toHaveBeenCalledWith('insert_notifications_for_followers', {
      p_actor_id: 'actor-1',
      p_type: 'new_deem',
      p_object_id: 'deem-1',
      p_object_type: 'deem',
    })
  })

  it('throws if RPC returns an error', async () => {
    const {supabase} = makeMockRpc({error: {message: 'RPC error'}})

    expect(
      insertNotificationsForFollowers(supabase, 'a', 'new_deem', 'b', 'deem')
    ).rejects.toThrow('RPC error')
  })
})

describe('insertNotificationForUser', () => {
  it('calls insert_notification RPC with correct params', async () => {
    const {supabase, mockRpc} = makeMockRpc()

    await insertNotificationForUser(supabase, 'user-1', 'actor-1', 'new_comment', 'deem-1', 'deem')

    expect(mockRpc).toHaveBeenCalledWith('insert_notification', {
      p_user_id: 'user-1',
      p_actor_id: 'actor-1',
      p_type: 'new_comment',
      p_object_id: 'deem-1',
      p_object_type: 'deem',
    })
  })
})
