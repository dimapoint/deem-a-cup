import {describe, it, expect} from 'bun:test'
import {buildCommentInsert} from '@/app/actions/comment-helpers'

describe('buildCommentInsert', () => {
  it('returns insert payload with userId and deemId', () => {
    const result = buildCommentInsert('deem-1', 'user-1', 'great coffee!')
    expect(result).toEqual({
      deem_id: 'deem-1',
      user_id: 'user-1',
      content: 'great coffee!',
    })
  })

  it('trims whitespace from content', () => {
    const result = buildCommentInsert('deem-1', 'user-1', '  hello  ')
    expect(result.content).toBe('hello')
  })

  it('throws if content is empty', () => {
    expect(() => buildCommentInsert('deem-1', 'user-1', '  ')).toThrow('Content is required')
  })
})
