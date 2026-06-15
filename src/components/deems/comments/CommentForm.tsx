'use client'

import {useState, useTransition} from 'react'
import {SendHorizontal} from 'lucide-react'
import {addDeemComment} from '@/app/actions/comments'

interface CommentFormProps {
	deemId: string
	/** Called after a comment is successfully persisted, so the parent can refresh. */
	onSubmitted: () => void
}

/**
 * Input + submit for posting a comment on a deem. Clears on success and
 * notifies the parent to refetch the canonical comment list.
 */
export function CommentForm({deemId, onSubmitted}: CommentFormProps) {
	const [value, setValue] = useState('')
	const [isPending, startTransition] = useTransition()

	const trimmed = value.trim()
	const canSubmit = trimmed.length > 0 && !isPending

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!canSubmit) return

		startTransition(async () => {
			try {
				await addDeemComment(deemId, trimmed)
				setValue('')
				onSubmitted()
			} catch (error) {
				console.error('Failed to post comment:', error)
			}
		})
	}

	return (
		<form onSubmit={handleSubmit} className="flex items-center gap-2">
			<input
				type="text"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="Add a comment…"
				maxLength={500}
				disabled={isPending}
				className="flex-1 bg-[#14181c] border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-orange-500/60 transition-colors disabled:opacity-50"
			/>
			<button
				type="submit"
				disabled={!canSubmit}
				aria-label="Post comment"
				className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-500 text-white hover:bg-orange-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
			>
				<SendHorizontal size={16} />
			</button>
		</form>
	)
}
