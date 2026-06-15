import type {DeemCommentInsert} from '@/types/database'

export function buildCommentInsert(
  deemId: string,
  userId: string,
  content: string
): DeemCommentInsert {
  const trimmed = content.trim()
  if (!trimmed) throw new Error('Content is required')
  return {deem_id: deemId, user_id: userId, content: trimmed}
}
