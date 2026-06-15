'use client'

import {useCallback, useState} from 'react'
import {Loader2, MessageCircle} from 'lucide-react'
import {getDeemComments} from '@/app/actions/comments'
import type {DeemCommentWithAuthor} from '@/app/actions/comments'
import {CommentItem} from './CommentItem'
import {CommentForm} from './CommentForm'

/**
 * Collapsible comments area for a deem. Comments are lazy-loaded on first open
 * so a feed of many deems doesn't eagerly fetch every thread. The composer and
 * list refresh from the server after each successful post.
 */
export function CommentSection({deemId}: {deemId: string}) {
	const [isOpen, setIsOpen] = useState(false)
	const [comments, setComments] = useState<DeemCommentWithAuthor[] | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const load = useCallback(async () => {
		setIsLoading(true)
		try {
			const data = await getDeemComments(deemId)
			setComments(data)
		} catch (error) {
			console.error('Failed to load comments:', error)
			setComments([])
		} finally {
			setIsLoading(false)
		}
	}, [deemId])

	const toggle = () => {
		const next = !isOpen
		setIsOpen(next)
		if (next && comments === null) {
			void load()
		}
	}

	const count = comments?.length ?? 0
	const countLabel = comments === null ? 'Comments' : count === 1 ? '1 comment' : `${count} comments`

	return (
		<div className="mt-1">
			<button
				type="button"
				onClick={toggle}
				aria-expanded={isOpen}
				className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-orange-400 transition-colors"
			>
				<MessageCircle size={14} />
				{countLabel}
			</button>

			{isOpen && (
				<div className="mt-3 space-y-4 animate-fade-in-up">
					{isLoading ? (
						<div className="flex items-center gap-2 text-xs text-gray-600">
							<Loader2 size={14} className="animate-spin" />
							Loading comments…
						</div>
					) : (
						<div className="space-y-3">
							{count === 0 ? (
								<p className="text-xs text-gray-600">
									No comments yet. Start the conversation.
								</p>
							) : (
								comments!.map((comment) => (
									<CommentItem key={comment.id} comment={comment} />
								))
							)}
						</div>
					)}

					<CommentForm deemId={deemId} onSubmitted={load} />
				</div>
			)}
		</div>
	)
}
