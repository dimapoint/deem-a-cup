'use client'

import {logCoffee} from '@/app/actions/deem'
import React, {useState} from 'react'
import {VisitDateInput} from './form/VisitDateInput'
import {RatingInput} from './form/RatingInput'
import {ReviewInput} from './form/ReviewInput'
import {DetailsSection} from './form/DetailsSection'
import {TagsInput} from './form/TagsInput'
import {LikeCheckbox} from './form/LikeCheckbox'
import {SubmitButton} from './form/SubmitButton'

interface LogCafeFormProps {
	cafeId: string
	cafeName: string
	onSuccess?: () => void
}

const toDateInputValue = (date: Date) => {
	const timezoneOffset = date.getTimezoneOffset() * 60000
	return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10)
}

export default function LogCafeForm({cafeId, cafeName, onSuccess}: LogCafeFormProps) {
	const [rating, setRating] = useState(0)
	const [hoverRating, setHoverRating] = useState(0)
	const [visitedAt, setVisitedAt] = useState(() => toDateInputValue(new Date()))

	const today = new Date()
	const yesterday = new Date()
	yesterday.setDate(yesterday.getDate() - 1)
	const todayValue = toDateInputValue(today)
	const yesterdayValue = toDateInputValue(yesterday)

	return (
		<form action={async (formData) => {
			await logCoffee(formData)
			if (onSuccess) onSuccess()
		}} className="flex flex-col gap-4 p-4 text-black bg-white rounded-lg">
			<h2 className="text-xl font-bold">Log visit: {cafeName}</h2>

			<input type="hidden" name="cafe_id" value={cafeId}/>

			<VisitDateInput
				value={visitedAt}
				onChange={setVisitedAt}
				todayValue={todayValue}
				yesterdayValue={yesterdayValue}
			/>

			<RatingInput
				rating={rating}
				hoverRating={hoverRating}
				onRatingChange={setRating}
				onHoverChange={setHoverRating}
			/>

			<ReviewInput/>

			<DetailsSection/>

			<TagsInput/>

			<LikeCheckbox/>

			<SubmitButton/>
		</form>
	)
}
