import {Coffee} from 'lucide-react'
import type {CSSProperties} from 'react'

/**
 * Props for the CoffeeRating component.
 */
interface CoffeeRatingProps {
	/**
	 * The rating value to display (0-5).
	 * Values outside this range will be clamped.
	 */
	rating: number
	/**
	 * The size of the rating icons.
	 * @default 'md'
	 */
	size?: 'sm' | 'md'
	/**
	 * Optional CSS class for the container.
	 */
	className?: string
}

/**
 * Props for the internal CoffeeCup component.
 */
interface CoffeeCupProps {
	/**
	 * How much of the cup is filled.
	 * 0 = empty, 0.5 = half, 1 = full.
	 */
	fill: 0 | 0.5 | 1
	/**
	 * CSS class for sizing (width/height).
	 */
	sizeClass: string
}

const HALF_CLIP_STYLE: CSSProperties = {clipPath: 'inset(0 50% 0 0)'}

/**
 * Renders a single coffee cup icon.
 * Handles full, half, and empty states using layering and clipping.
 */
const CoffeeCup = ({fill, sizeClass}: CoffeeCupProps) => {
	return (
		<div className={`relative inline-block ${sizeClass}`}>
			{/* Background: Empty cup (outline with low opacity) */}
			<Coffee
				className="absolute inset-0 h-full w-full opacity-30"
				strokeWidth={2}
			/>

			{/* Foreground: Filled cup (clipped if half) */}
			{fill > 0 && (
				<div
					className="absolute inset-0 h-full w-full"
					style={fill === 0.5 ? HALF_CLIP_STYLE : undefined}
				>
					<Coffee
						className="h-full w-full fill-current"
						strokeWidth={2}
					/>
				</div>
			)}
		</div>
	)
}

/**
 * Displays a rating (0-5) using coffee cup icons.
 * Supports half-ratings.
 */
export const CoffeeRating = ({
	                             rating,
	                             size = 'md',
	                             className = '',
                             }: CoffeeRatingProps) => {
	const clampedRating = Math.max(0, Math.min(5, rating))

	// Determine sizes based on the 'size' prop
	const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'
	const gapClass = size === 'sm' ? 'gap-0.5' : 'gap-1'

	return (
		<div
			className={`flex items-center ${gapClass} ${className}`}
			role="img"
			aria-label={`Rating: ${clampedRating} out of 5`}
		>
			{[0, 1, 2, 3, 4].map((index) => {
				// Calculate fill level for this specific cup
				let fill: 0 | 0.5 | 1 = 0
				if (clampedRating >= index + 1) {
					fill = 1
				} else if (clampedRating >= index + 0.5) {
					fill = 0.5
				}

				return (
					<CoffeeCup
						key={index}
						fill={fill}
						sizeClass={sizeClass}
					/>
				)
			})}
		</div>
	)
}
