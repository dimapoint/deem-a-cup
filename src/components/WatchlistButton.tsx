'use client'

import {toggleWatchlist} from '@/app/actions/watchlist'
import {Bookmark} from 'lucide-react'
import {usePathname} from 'next/navigation'
import {useOptimistic, useTransition} from 'react'

interface WatchlistButtonProps {
	cafeId: string
	initialIsSaved: boolean
}

export default function WatchlistButton({cafeId, initialIsSaved}: WatchlistButtonProps) {
	const pathname = usePathname()
	const [isPending, startTransition] = useTransition()
	const [optimisticIsSaved, setOptimisticIsSaved] = useOptimistic(
		initialIsSaved,
		(_state, nextValue: boolean) => nextValue
	)

	const handleClick = () => {
		const nextState = !optimisticIsSaved

		startTransition(async () => {
			setOptimisticIsSaved(nextState)
			await toggleWatchlist(cafeId, optimisticIsSaved, pathname)
		})
	}

	const iconClassName = optimisticIsSaved ? 'text-orange-500' : 'text-gray-400'

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={isPending}
			aria-pressed={optimisticIsSaved}
			aria-label={optimisticIsSaved ? 'Remove from watchlist' : 'Save to watchlist'}
			className="inline-flex items-center justify-center rounded transition-transform active:scale-95 disabled:opacity-50"
		>
			<Bookmark
				className={`h-5 w-5 transition-colors ${iconClassName}`}
				fill={optimisticIsSaved ? 'currentColor' : 'none'}
			/>
		</button>
	)
}
