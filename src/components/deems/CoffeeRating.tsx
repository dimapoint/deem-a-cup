import {memo} from 'react'
import {Coffee} from 'lucide-react'
import type {CSSProperties} from 'react'

/**
 * Configuration for rating icon sizes and container spacing.
 */
const SIZE_CONFIG = {
	sm: {
		icon: 'h-4 w-4',
		gap: 'gap-0.5',
	},
	md: {
		icon: 'h-6 w-6',
		gap: 'gap-1',
	},
} as const

type RatingSize = keyof typeof SIZE_CONFIG

/**
 * Props for the CoffeeRating component.
 */
interface CoffeeRatingProps {
	/**
	 * The rating value to display (0-5).
	 * Supports half-steps (e.g., 3.5). Values outside 0-5 are clamped.
	 */
	rating: number
	/**
	 * The visual size of the rating icons.
	 * @default 'md'
	 */
	size?: RatingSize
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

/**
 * Style for clipping the icon to show a half-filled state.
 */
const HALF_CLIP_STYLE: CSSProperties = {clipPath: 'inset(0 50% 0 0)'}

/**
 * Renders a single coffee cup icon with support for partial fill states.
 * Memoized to prevent unnecessary re-renders in large lists.
 */
const CoffeeCup = memo(({fill, sizeClass}: CoffeeCupProps) => (
	<div className={`relative inline-block ${sizeClass}`} aria-hidden="true">
		{/* Background: Empty cup (outline) */}
		<Coffee
			className="absolute inset-0 h-full w-full opacity-20"
			strokeWidth={2}
		/>

		{/* Foreground: Filled cup (clipped if half) */}
		{fill > 0 && (
			<div
				className="absolute inset-0 h-full w-full text-orange-400"
				style={fill === 0.5 ? HALF_CLIP_STYLE : undefined}
			>
				<Coffee
					className="h-full w-full fill-current"
					strokeWidth={2}
				/>
			</div>
		)}
	</div>
))

CoffeeCup.displayName = 'CoffeeCup'

/**
 * CoffeeRating Component
 *
 * Displays a 5-cup rating system. Used throughout the app to show
 * user ratings for coffee visits. Supports half-ratings for precision.
 *
 * @example
 * ```tsx
 * <CoffeeRating rating={4.5} size="md" />
 * ```
 */
export const CoffeeRating = ({
	                             rating,
	                             size = 'md',
	                             className = '',
                             }: CoffeeRatingProps) => {
	const clampedRating = Math.max(0, Math.min(5, rating))
	const {icon: iconSize, gap: gapSize} = SIZE_CONFIG[size]

	return (
		<div
			className={`flex items-center ${gapSize} ${className}`}
			role="img"
			aria-label={`Rating: ${clampedRating} out of 5 coffee cups`}
		>
			{Array.from({length: 5}).map((_, index) => {
				// Calculate fill level for this specific cup
				const fillValue = clampedRating - index
				const fill: 0 | 0.5 | 1 = fillValue >= 1 ? 1 : fillValue >= 0.5 ? 0.5 : 0

				return (
					<CoffeeCup
						key={index}
						fill={fill}
						sizeClass={iconSize}
					/>
				)
			})}
		</div>
	)
}
