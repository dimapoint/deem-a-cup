import {Bell} from 'lucide-react'
import type {NotificationWithActor} from '@/app/actions/notifications'
import {NotificationItem} from './NotificationItem'

/**
 * Renders the notification inbox with a staggered reveal. Empty state nudges
 * the user toward the parts of the app that generate notifications.
 */
export function NotificationList({
	notifications,
}: {
	notifications: NotificationWithActor[]
}) {
	if (notifications.length === 0) {
		return (
			<div className="flex flex-col items-center text-center py-16 px-6 rounded-lg border border-dashed border-gray-800">
				<div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 text-gray-500 mb-4">
					<Bell size={22} />
				</div>
				<p className="text-gray-300 font-semibold">No notifications yet</p>
				<p className="text-sm text-gray-500 mt-1 max-w-xs">
					When someone follows you or interacts with your deems, it&#39;ll show up here.
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-2">
			{notifications.map((notification, i) => (
				<div
					key={notification.id}
					className="animate-fade-in-up"
					style={{animationDelay: `${Math.min(i * 40, 400)}ms`}}
				>
					<NotificationItem notification={notification} />
				</div>
			))}
		</div>
	)
}
