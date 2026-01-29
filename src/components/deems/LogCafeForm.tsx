'use client'

import {logCoffee} from '@/app/actions/deem'
import {useState} from 'react'
import {useFormStatus} from 'react-dom'
import {CalendarDays, Heart, X} from 'lucide-react'

interface LogCafeFormProps {
	cafeId: string
	cafeName: string
	onSuccess?: () => void
}

const toDateInputValue = (date: Date) => {
	const timezoneOffset = date.getTimezoneOffset() * 60000
	return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10)
}

const formatDateLabel = (value: string) => {
	if (!value) return 'Pick a date'
	const [year, month, day] = value.split('-').map(Number)
	if (!year || !month || !day) return 'Pick a date'
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	}).format(new Date(year, month - 1, day))
}

function SubmitButton() {
	const {pending} = useFormStatus()

	return (
		<button
			type="submit"
			disabled={pending}
			className="w-full rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600 disabled:opacity-50"
		>
			{pending ? 'Saving...' : 'Save'}
		</button>
	)
}

const BREW_METHODS = ['Espresso', 'Flat White', 'V60', 'Chemex', 'Cold Brew', 'Aeropress']
const BEAN_ORIGINS = ['Colombia', 'Etiopía', 'Brasil', 'Blend de la casa']

export default function LogCafeForm({cafeId, cafeName, onSuccess}: LogCafeFormProps) {
	const [rating, setRating] = useState(0)
	const [hoverRating, setHoverRating] = useState(0)
	const [liked, setLiked] = useState(false)
	const [tags, setTags] = useState<string[]>([])
	const [currentTag, setCurrentTag] = useState('')
	const [brewMethod, setBrewMethod] = useState('')
	const [beanOrigin, setBeanOrigin] = useState('')
	const [visitedAt, setVisitedAt] = useState(() => toDateInputValue(new Date()))
	const today = new Date()
	const yesterday = new Date()
	yesterday.setDate(yesterday.getDate() - 1)
	const todayValue = toDateInputValue(today)
	const yesterdayValue = toDateInputValue(yesterday)
	const cupClassName = 'absolute inset-0 flex items-center justify-center text-2xl leading-none'
	const halfClipStyle = {clipPath: 'inset(0 50% 0 0)'}

	const handleCoffeeClick = (cupIndex: number, isHalf: boolean) => {
		setRating(isHalf ? cupIndex + 0.5 : cupIndex + 1)
	}

	const handleCoffeeHover = (cupIndex: number, isHalf: boolean) => {
		setHoverRating(isHalf ? cupIndex + 0.5 : cupIndex + 1)
	}

	const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
		if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return
		e.preventDefault()
		
		const trimmedTag = currentTag.trim()
		if (trimmedTag && !tags.includes(trimmedTag)) {
			setTags([...tags, trimmedTag])
			setCurrentTag('')
		}
	}

	const removeTag = (tagToRemove: string) => {
		setTags(tags.filter(tag => tag !== tagToRemove))
	}

	const displayRating = hoverRating > 0 ? hoverRating : rating

	return (
		<form action={async (formData) => {
			await logCoffee(formData)
			if (onSuccess) onSuccess()
		}} className="flex flex-col gap-4 p-4 text-black bg-white rounded-lg">
			<h2 className="text-xl font-bold">Log visit: {cafeName}</h2>

			<input type="hidden" name="cafe_id" value={cafeId}/>

			{/* Visit Date */}
			<div className="flex flex-col gap-1">
				<label htmlFor="visited_at" className="text-sm font-medium">Date</label>
				<div className="flex flex-wrap items-center gap-2">
					<div className="relative flex-1 min-w-[200px]">
						<CalendarDays
							size={16}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
						/>
						<input
							id="visited_at"
							name="visited_at"
							type="date"
							value={visitedAt}
							onChange={(event) => setVisitedAt(event.target.value)}
							className="w-full rounded border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-200"
						/>
					</div>
					<button
						type="button"
						onClick={() => setVisitedAt(todayValue)}
						className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
							visitedAt === todayValue
								? 'border-orange-400 text-orange-600'
								: 'border-gray-300 text-gray-600 hover:border-gray-400'
						}`}
					>
						Today
					</button>
					<button
						type="button"
						onClick={() => setVisitedAt(yesterdayValue)}
						className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
							visitedAt === yesterdayValue
								? 'border-orange-400 text-orange-600'
								: 'border-gray-300 text-gray-600 hover:border-gray-400'
						}`}
					>
						Yesterday
					</button>
				</div>
				<p className="text-xs text-gray-500">
					Selected: <span
					className="font-medium text-gray-700">{formatDateLabel(visitedAt)}</span>
				</p>
			</div>

			{/* Coffee Rating */}
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
									data-testid={`coffee-${index}-half`}
									className="absolute left-0 top-0 w-1/2 h-full z-10"
									onClick={() => handleCoffeeClick(index, true)}
									onMouseEnter={() => handleCoffeeHover(index, true)}
								/>
								{/* Right half (1.0) */}
								<div
									data-testid={`coffee-${index}-full`}
									className="absolute right-0 top-0 w-1/2 h-full left-1/2 z-10"
									onClick={() => handleCoffeeClick(index, false)}
									onMouseEnter={() => handleCoffeeHover(index, false)}
								/>

								{/* Icon rendering */}
								<div className="absolute inset-0 pointer-events-none">
									<span className={`${cupClassName} opacity-30`}
									      aria-hidden="true">☕</span>
									{filled ? (
										<span className={cupClassName} aria-hidden="true">☕</span>
									) : halfFilled ? (
										<span className={cupClassName} style={halfClipStyle}
										      aria-hidden="true">☕</span>
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
					placeholder="How was it?"
				/>
			</div>

			{/* Technical Details */}
			<div className="flex flex-col gap-3 pt-2 pb-2">
				{/* Brew Method */}
				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium">Brew Method</label>
					<div className="flex flex-wrap gap-2">
						{BREW_METHODS.map(method => (
							<button
								type="button"
								key={method}
								onClick={() => setBrewMethod(method === brewMethod ? '' : method)}
								className={`px-3 py-1 text-xs rounded-full border transition-colors ${
									brewMethod === method
										? 'bg-orange-500 text-white border-orange-500'
										: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
								}`}
							>
								{method}
							</button>
						))}
					</div>
					<input type="hidden" name="brew_method" value={brewMethod} />
				</div>

				{/* Bean Origin */}
				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium">Bean Origin</label>
					<div className="flex flex-wrap gap-2">
						{BEAN_ORIGINS.map(origin => (
							<button
								type="button"
								key={origin}
								onClick={() => setBeanOrigin(origin === beanOrigin ? '' : origin)}
								className={`px-3 py-1 text-xs rounded-full border transition-colors ${
									beanOrigin === origin
										? 'bg-orange-500 text-white border-orange-500'
										: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
								}`}
							>
								{origin}
							</button>
						))}
					</div>
					<input type="hidden" name="bean_origin" value={beanOrigin} />
				</div>

				{/* Roaster */}
				<div className="flex flex-col gap-1">
					<label htmlFor="roaster" className="text-sm font-medium">Roaster</label>
					<input
						id="roaster"
						name="roaster"
						type="text"
						placeholder="Roaster (e.g. Fuego, Puerto Blest)"
						className="rounded border border-gray-300 p-2 text-sm w-full"
					/>
				</div>

				{/* Price */}
				<div className="flex flex-col gap-1">
					<label htmlFor="price" className="text-sm font-medium">Price</label>
					<input
						id="price"
						name="price"
						type="number"
						step="0.01"
						placeholder="0.00"
						className="rounded border border-gray-300 p-2 text-sm w-full"
					/>
				</div>
			</div>

			{/* Tags */}
			<div className="flex flex-col gap-2">
				<label htmlFor="tags-input" className="text-sm font-medium">Tags</label>
				<div className="flex flex-wrap gap-2 mb-1">
					{tags.map(tag => (
						<span key={tag} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            #{tag}
                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-orange-950 focus:outline-none">
                                <X size={12} />
                            </button>
                        </span>
					))}
				</div>
				<div className="flex gap-2">
					<input
						id="tags-input"
						type="text"
						value={currentTag}
						onChange={(e) => setCurrentTag(e.target.value)}
						onKeyDown={handleAddTag}
						className="flex-1 rounded border border-gray-300 p-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-200"
						placeholder="Add a tag (e.g. Wifi, V60)..."
					/>
					<button 
						type="button" 
						onClick={handleAddTag}
						className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
					>
						Add
					</button>
				</div>
				<input type="hidden" name="tags" value={JSON.stringify(tags)} />
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
