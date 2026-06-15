import {Camera, Coffee, ListPlus, ListChecks, UserPlus} from 'lucide-react'
import type {ReactNode} from 'react'
import type {Activity} from '@/types/database'

/**
 * Visual presentation (icon, accent color, and human phrase) for each activity
 * verb. Keeping this in one place lets ActivityCard stay declarative and makes
 * adding a new verb a single-edit change.
 */
type VerbPresentation = {
	icon: ReactNode
	/** Tailwind text color for the icon + accent */
	accent: string
	/** Tailwind background tint for the icon chip */
	chip: string
	/** Phrase that follows the actor's name, e.g. "logged a coffee" */
	phrase: string
}

const PRESENTATIONS: Record<Activity['verb'], VerbPresentation> = {
	deem: {
		icon: <Coffee size={14} />,
		accent: 'text-orange-400',
		chip: 'bg-orange-500/10 border-orange-500/30',
		phrase: 'logged a coffee',
	},
	list_created: {
		icon: <ListPlus size={14} />,
		accent: 'text-sky-400',
		chip: 'bg-sky-500/10 border-sky-500/30',
		phrase: 'created a list',
	},
	list_updated: {
		icon: <ListChecks size={14} />,
		accent: 'text-sky-400',
		chip: 'bg-sky-500/10 border-sky-500/30',
		phrase: 'updated a list',
	},
	followed: {
		icon: <UserPlus size={14} />,
		accent: 'text-emerald-400',
		chip: 'bg-emerald-500/10 border-emerald-500/30',
		phrase: 'followed someone new',
	},
	photo_uploaded: {
		icon: <Camera size={14} />,
		accent: 'text-violet-400',
		chip: 'bg-violet-500/10 border-violet-500/30',
		phrase: 'shared a photo',
	},
}

const FALLBACK: VerbPresentation = {
	icon: <Coffee size={14} />,
	accent: 'text-gray-400',
	chip: 'bg-gray-700/40 border-gray-700',
	phrase: 'did something',
}

export function getVerbPresentation(verb: Activity['verb']): VerbPresentation {
	return PRESENTATIONS[verb] ?? FALLBACK
}
