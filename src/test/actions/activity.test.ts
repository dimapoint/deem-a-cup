import {describe, it, expect, mock} from 'bun:test'
import {insertActivity} from '@/app/actions/activity'
import type {SupabaseClient} from '@supabase/supabase-js'

type MockResult = {error: {message: string} | null}

function makeMockSupabase(insertResult: MockResult = {error: null}) {
  const mockInsert = mock(() => Promise.resolve(insertResult))
  const mockFrom = mock(() => ({insert: mockInsert}))
  return {supabase: {from: mockFrom} as unknown as SupabaseClient, mockFrom, mockInsert}
}

describe('insertActivity', () => {
  it('inserts a row in the activities table with the correct fields', async () => {
    const {supabase, mockFrom, mockInsert} = makeMockSupabase()

    await insertActivity(supabase, 'actor-1', 'deem', 'deem-1', 'deem')

    expect(mockFrom).toHaveBeenCalledWith('activities')
    expect(mockInsert).toHaveBeenCalledWith({
      actor_id: 'actor-1',
      verb: 'deem',
      object_id: 'deem-1',
      object_type: 'deem',
    })
  })

  it('throws if Supabase returns an error', async () => {
    const {supabase} = makeMockSupabase({error: {message: 'DB error'}})

    expect(insertActivity(supabase, 'a', 'deem', 'b', 'deem')).rejects.toThrow('DB error')
  })
})
