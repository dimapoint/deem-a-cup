import {Camera, Coffee, ListPlus, MessageCircle, UserPlus} from 'lucide-react'
import type {ReactNode} from 'react'
import type {Notification} from '@/types/database'

type NotificationPresentation = {
	icon: ReactNode
	accent: string
	chip: string
	/** Phrase that follows the actor's name, e.g. "started following you" */
	phrase: string
}

const PRESENTATIONS: Record<Notification['type'], NotificationPresentation> = {
	new_deem: {
		icon: <Coffee size={14} />,
		accent: 'text-orange-400',
		chip: 'bg-orange-500/10 border-orange-500/30',
		phrase: 'logged a new coffee',
	},
	new_comment: {
		icon: <MessageCircle size={14} />,
		accent: 'text-amber-400',
		chip: 'bg-amber-500/10 border-amber-500/30',
		phrase: 'commented on your deem',
	},
	new_follow: {
		icon: <UserPlus size={14} />,
		accent: 'text-emerald-400',
		chip: 'bg-emerald-500/10 border-emerald-500/30',
		phrase: 'started following you',
	},
	new_photo: {
		icon: <Camera size={14} />,
		accent: 'text-violet-400',
		chip: 'bg-violet-500/10 border-violet-500/30',
		phrase: 'shared a new photo',
	},
	new_list: {
		icon: <ListPlus size={14} />,
		accent: 'text-sky-400',
		chip: 'bg-sky-500/10 border-sky-500/30',
		phrase: 'created a new list',
	},
}

const FALLBACK: NotificationPresentation = {
	icon: <Coffee size={14} />,
	accent: 'text-gray-400',
	chip: 'bg-gray-700/40 border-gray-700',
	phrase: 'sent you an update',
}

export function getNotificationPresentation(
	type: Notification['type']
): NotificationPresentation {
	return PRESENTATIONS[type] ?? FALLBACK
}
