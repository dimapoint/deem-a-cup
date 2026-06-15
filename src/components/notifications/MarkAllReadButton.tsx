'use client'

import {useTransition} from 'react'
import {CheckCheck} from 'lucide-react'
import {markAllNotificationsRead} from '@/app/actions/notifications'

/**
 * "Mark all as read" affordance for the notifications page header. Only shown
 * when there is at least one unread notification.
 */
export function MarkAllReadButton() {
	const [isPending, startTransition] = useTransition()

	const handleClick = () => {
		startTransition(async () => {
			try {
				await markAllNotificationsRead()
			} catch (error) {
				console.error('Failed to mark all notifications read:', error)
			}
		})
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={isPending}
			className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-orange-400 transition-colors disabled:opacity-50"
		>
			<CheckCheck size={14} />
			Mark all read
		</button>
	)
}
