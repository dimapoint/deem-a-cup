import {createClient} from '@/utils/supabase/server'
import {redirect} from 'next/navigation'
import {getNotifications} from '@/app/actions/notifications'
import {NotificationList} from '@/components/notifications/NotificationList'
import {MarkAllReadButton} from '@/components/notifications/MarkAllReadButton'

export default async function NotificationsPage() {
	const supabase = await createClient()
	const {data: {user}} = await supabase.auth.getUser()
	if (!user) {
		redirect('/login')
	}

	const notifications = await getNotifications()
	const hasUnread = notifications.some((n) => !n.read)

	return (
		<main className="min-h-screen bg-[#14181c] text-gray-100 p-4 md:p-8">
			<div className="max-w-2xl mx-auto space-y-8">
				<header className="flex justify-between items-end border-b border-gray-800 pb-6">
					<div>
						<h1 className="text-4xl font-bold tracking-tighter text-white">
							Notifications
						</h1>
						<p className="text-gray-500 mt-2">Recent activity directed at you</p>
					</div>
					{hasUnread && <MarkAllReadButton />}
				</header>

				<NotificationList notifications={notifications} />
			</div>
		</main>
	)
}
