'use client'

export function ReviewInput() {
	return (
		<div className="flex flex-col gap-1">
			<label htmlFor="review" className="text-sm font-medium">Review</label>
			<textarea
				id="review"
				name="review"
				className="rounded border border-gray-300 p-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-200"
				rows={3}
				placeholder="How was it?"
			/>
		</div>
	)
}
