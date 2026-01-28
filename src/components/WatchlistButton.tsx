'use client'

import {toggleWatchlist} from '@/app/actions/watchlist'
import {Bookmark} from 'lucide-react'
import {useOptimistic, useTransition} from 'react'

interface WatchlistButtonProps {
	cafeId: string
	initialIsSaved: boolean
}

const resolveOptimisticState = (_current: boolean, nextValue: boolean) => nextValue

export default function WatchlistButton({cafeId, initialIsSaved}: WatchlistButtonProps) {
	const [, startTransition] = useTransition()
	const [optimisticIsSaved, setOptimisticIsSaved] = useOptimistic(
		initialIsSaved,
		resolveOptimisticState
	)

	const handleClick = () => {
		const previousValue = optimisticIsSaved
		const nextValue = !previousValue

		startTransition(() => {
			setOptimisticIsSaved(nextValue)
		})

		void toggleWatchlist(cafeId, previousValue)
			.then((result) => {
				const nextState = result?.success ? result.isInWatchlist : previousValue
				startTransition(() => {
					setOptimisticIsSaved(nextState)
				})
			})
			.catch(() => {
				startTransition(() => {
					setOptimisticIsSaved(previousValue)
				})
			})
	}

	const iconClassName = optimisticIsSaved ? 'text-orange-500' : 'text-gray-400'

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-pressed={optimisticIsSaved}
			aria-label={optimisticIsSaved ? 'Remove from watchlist' : 'Save to watchlist'}
			className="inline-flex items-center justify-center rounded transition-transform active:scale-95"
		>
			<Bookmark
				className={`h-5 w-5 transition-colors ${iconClassName}`}
				fill={optimisticIsSaved ? 'currentColor' : 'none'}
			/>
		</button>
	)
}
