import type {CSSProperties} from 'react'

type CoffeeRatingProps = {
	rating: number
	size?: 'sm' | 'md'
	className?: string
}

type CoffeeCupProps = {
	fill: 0 | 0.5 | 1
	sizeClassName: string
}

const halfClipStyle: CSSProperties = {clipPath: 'inset(0 50% 0 0)'}

const CoffeeCup = ({fill, sizeClassName}: CoffeeCupProps) => {
	const containerClassName = `relative inline-flex items-center justify-center ${sizeClassName} leading-none`
	const iconClassName = 'absolute inset-0 flex items-center justify-center'

	return (
		<span className={containerClassName} aria-hidden="true">
			<span className={`${iconClassName} opacity-30`}>☕</span>
			{fill === 1 && <span className={iconClassName}>☕</span>}
			{fill === 0.5 && <span className={iconClassName} style={halfClipStyle}>☕</span>}
		</span>
	)
}

export const CoffeeRating = ({
	                             rating,
	                             size = 'md',
	                             className
                             }: CoffeeRatingProps) => {
	const clampedRating = Math.max(0, Math.min(5, rating))
	const sizeClassName = size === 'sm' ? 'h-4 w-4 text-sm' : 'h-6 w-6 text-xl'
	const gapClassName = size === 'sm' ? 'gap-0.5' : 'gap-1'

	return (
		<div
			className={`flex items-center ${gapClassName} ${className ?? ''}`}
			role="img"
			aria-label={`Rating ${clampedRating} out of 5`}
		>
			{[0, 1, 2, 3, 4].map((index) => {
				const fill: 0 | 0.5 | 1 = clampedRating >= index + 1
					? 1
					: clampedRating >= index + 0.5
						? 0.5
						: 0

				return (
					<CoffeeCup
						key={index}
						fill={fill}
						sizeClassName={sizeClassName}
					/>
				)
			})}
		</div>
	)
}
