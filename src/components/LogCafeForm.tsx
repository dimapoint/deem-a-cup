'use client'

import {logCoffee} from '@/app/actions/deem'
import {useState} from 'react'
import {useFormStatus} from 'react-dom'
import {Heart, Star, StarHalf} from 'lucide-react'

interface LogCafeFormProps {
	cafeId: string
	cafeName: string
	onSuccess?: () => void
}

function SubmitButton() {
	const {pending} = useFormStatus()

	return (
		<button
			type="submit"
			disabled={pending}
			className="w-full rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600 disabled:opacity-50"
		>
			{pending ? 'Guardando...' : 'Guardar'}
		</button>
	)
}

export default function LogCafeForm({cafeId, cafeName, onSuccess}: LogCafeFormProps) {
	const [rating, setRating] = useState(0)
	const [hoverRating, setHoverRating] = useState(0)
	const [liked, setLiked] = useState(false)

	const handleStarClick = (starIndex: number, isHalf: boolean) => {
		setRating(isHalf ? starIndex + 0.5 : starIndex + 1)
	}

	const handleStarHover = (starIndex: number, isHalf: boolean) => {
		setHoverRating(isHalf ? starIndex + 0.5 : starIndex + 1)
	}

	const displayRating = hoverRating > 0 ? hoverRating : rating

	return (
		<form action={async (formData) => {
			await logCoffee(formData)
			if (onSuccess) onSuccess()
		}} className="flex flex-col gap-4 p-4 text-black bg-white rounded-lg">
			<h2 className="text-xl font-bold">Log visit: {cafeName}</h2>

			<input type="hidden" name="cafe_id" value={cafeId}/>

			{/* Star Rating */}
			<div className="flex flex-col gap-1">
				<label className="text-sm font-medium">Rating</label>
				<div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
					{[0, 1, 2, 3, 4].map((index) => {
						const filled = displayRating >= index + 1
						const halfFilled = displayRating >= index + 0.5 && !filled

						return (
							<div key={index} className="relative cursor-pointer w-8 h-8">
								{/* Left half (0.5) */}
								<div
									data-testid={`star-${index}-half`}
									className="absolute left-0 top-0 w-1/2 h-full z-10"
									onClick={() => handleStarClick(index, true)}
									onMouseEnter={() => handleStarHover(index, true)}
								/>
								{/* Right half (1.0) */}
								<div
									data-testid={`star-${index}-full`}
									className="absolute right-0 top-0 w-1/2 h-full left-1/2 z-10"
									onClick={() => handleStarClick(index, false)}
									onMouseEnter={() => handleStarHover(index, false)}
								/>

								{/* Icon rendering */}
								<div className="absolute inset-0 pointer-events-none">
									{/* Background: Gray Star (always render as base) */}
									<Star
										className="absolute w-full h-full text-gray-300 fill-gray-300"/>

									{/* Foreground: Yellow Star or Half Star */}
									{filled ? (
										<Star
											className="absolute w-full h-full text-yellow-400 fill-yellow-400"/>
									) : halfFilled ? (
										<StarHalf
											className="absolute w-full h-full text-yellow-400 fill-yellow-400"/>
									) : null}
								</div>
							</div>
						)
					})}
				</div>
				<div className="text-sm text-gray-500 h-5 font-medium">
					{displayRating > 0 ? displayRating : 'Rate this cafe'}
				</div>
				<input type="hidden" name="rating" value={rating}/>
			</div>

			{/* Review */}
			<div className="flex flex-col gap-1">
				<label htmlFor="review" className="text-sm font-medium">Review</label>
				<textarea
					id="review"
					name="review"
					className="rounded border border-gray-300 p-2 text-sm"
					rows={3}
					placeholder="¿Qué tal estuvo?"
				/>
			</div>

			{/* Liked */}
			<div className="flex items-center gap-2">
				<label className="flex items-center gap-2 cursor-pointer group">
					<input
						type="checkbox"
						name="liked"
						className="hidden"
						checked={liked}
						onChange={(e) => setLiked(e.target.checked)}
					/>
					<Heart
						className={`w-6 h-6 transition-colors ${
							liked ? 'fill-orange-500 text-orange-500' : 'text-gray-400 group-hover:text-gray-600'
						}`}
					/>
					<span className="text-sm font-medium select-none">Like</span>
				</label>
			</div>

			<SubmitButton/>
		</form>
	)
}
