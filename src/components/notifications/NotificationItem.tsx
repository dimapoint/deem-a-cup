'use client'

import {useOptimistic, useTransition} from 'react'
import {User} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type {NotificationWithActor} from '@/app/actions/notifications'
import {markNotificationRead} from '@/app/actions/notifications'
import {formatRelativeTime} from '@/utils/date'
import {getNotificationPresentation} from './notificationPresentation'

/**
 * A single notification row. Unread items get an accent rail + tinted
 * background and a "mark as read" affordance. Clicking the dot marks it read
 * optimistically via the server action.
 */
export function NotificationItem({notification}: {notification: NotificationWithActor}) {
	const [isPending, startTransition] = useTransition()
	const [optimisticRead, setOptimisticRead] = useOptimistic(
		notification.read,
		(_state, next: boolean) => next
	)

	const {actor} = notification
	const {icon, accent, chip, phrase} = getNotificationPresentation(notification.type)
	const profileUrl = actor?.username ? `/u/${actor.username}` : null
	const name = actor?.full_name || actor?.username || 'Someone'

	const handleMarkRead = () => {
		if (optimisticRead) return
		startTransition(async () => {
			setOptimisticRead(true)
			try {
				await markNotificationRead(notification.id)
			} catch (error) {
				console.error('Failed to mark notification read:', error)
			}
		})
	}

	return (
		<div
			className={`group relative flex items-center gap-3 pl-4 pr-3 py-3 rounded-lg border transition-colors ${
				optimisticRead
					? 'bg-[#1e232b] border-gray-800'
					: 'bg-[#20262f] border-gray-700'
			}`}
		>
			{/* Unread accent rail */}
			{!optimisticRead && (
				<span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-orange-500" />
			)}

			<div className="relative w-10 h-10 shrink-0">
				<div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600">
					{actor?.avatar_url ? (
						<Image
							src={actor.avatar_url}
							alt={name}
							width={40}
							height={40}
							className="w-full h-full object-cover"
						/>
					) : (
						<User size={18} className="text-gray-400" />
					)}
				</div>
				<span
					className={`absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full border ${chip} ${accent}`}
				>
					{icon}
				</span>
			</div>

			<div className="min-w-0 flex-1">
				<p className="text-sm text-gray-300 truncate">
					{profileUrl ? (
						<Link
							href={profileUrl}
							className="font-bold text-gray-100 hover:text-orange-400 transition-colors"
						>
							{name}
						</Link>
					) : (
						<span className="font-bold text-gray-100">{name}</span>
					)}{' '}
					<span className="text-gray-500">{phrase}</span>
				</p>
				<time
					className="text-xs text-gray-600 tabular-nums"
					dateTime={notification.created_at}
				>
					{formatRelativeTime(notification.created_at)}
				</time>
			</div>

			{!optimisticRead && (
				<button
					type="button"
					onClick={handleMarkRead}
					disabled={isPending}
					title="Mark as read"
					aria-label="Mark as read"
					className="shrink-0 w-2.5 h-2.5 rounded-full bg-orange-500 hover:scale-125 transition-transform disabled:opacity-50"
				/>
			)}
		</div>
	)
}
