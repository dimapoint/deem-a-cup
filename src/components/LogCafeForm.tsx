'use client'

import {logCoffee} from '@/app/actions/deem'
import {useState} from 'react'
import {useFormStatus} from 'react-dom'

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

	// We wrap the server action to handle success/close if needed,
	// but strictly following the prompt, we just need action={logCoffee}.
	// However, to close the modal, we usually intercept the action or use a separate effect.
	// Since useFormStatus is inside the form, we can't easily detect success *after* submit here
	// without useActionState.
	// But the prompt just asks for the form structure.
	// I'll stick to action={logCoffee} directly as requested,
	// but maybe wrap it to call onSuccess if provided?
	// Let's stick to the simplest requirement first: use action={logCoffee}.

	return (
		<form action={async (formData) => {
			await logCoffee(formData)
			// Simple way to close modal after action completes (if onSuccess provided)
			if (onSuccess) onSuccess()
		}} className="flex flex-col gap-4 p-4 text-black bg-white rounded-lg">
			<h2 className="text-xl font-bold">Log visit: {cafeName}</h2>

			<input type="hidden" name="cafe_id" value={cafeId}/>

			{/* Star Rating */}
			<div className="flex flex-col gap-1">
				<label className="text-sm font-medium">Rating</label>
				<div className="flex gap-1">
					{[1, 2, 3, 4, 5].map((star) => (
						<button
							key={star}
							type="button"
							onClick={() => setRating(star)}
							className={`text-2xl ${
								star <= rating ? 'text-yellow-400' : 'text-gray-300'
							}`}
						>
							★
						</button>
					))}
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
				<input
					type="checkbox"
					id="liked"
					name="liked"
					className="h-4 w-4 rounded border-gray-300"
				/>
				<label htmlFor="liked" className="text-sm font-medium">Liked</label>
			</div>

			<SubmitButton/>
		</form>
	)
}
