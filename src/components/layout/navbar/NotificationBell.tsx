import Link from 'next/link'
import {Bell} from 'lucide-react'

/**
 * Navbar bell linking to /notifications, with an unread-count badge. The count
 * is fetched server-side in the Navbar and passed down so this stays a cheap
 * presentational component.
 */
export function NotificationBell({unreadCount}: {unreadCount: number}) {
	const hasUnread = unreadCount > 0

	return (
		<Link
			href="/notifications"
			title="Notifications"
			aria-label={
				hasUnread ? `Notifications, ${unreadCount} unread` : 'Notifications'
			}
			className="relative text-gray-400 hover:text-white transition-colors"
		>
			<Bell className="h-5 w-5" />
			{hasUnread && (
				<span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-orange-500 text-[10px] font-bold leading-none text-white tabular-nums">
					{unreadCount > 9 ? '9+' : unreadCount}
				</span>
			)}
		</Link>
	)
}
