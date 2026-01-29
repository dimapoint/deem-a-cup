'use client'

import {MapPin, Search} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'
import {PlacePrediction, searchPlaces} from '@/app/actions/places'

interface CafeSearchProps {
	onSelect: (placeId: string, name: string, address: string) => void
	className?: string
}

export default function CafeSearch({onSelect, className}: CafeSearchProps) {
	const [value, setValue] = useState('')
	const [suggestions, setSuggestions] = useState<PlacePrediction[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(async () => {
			if (value.length >= 3) {
				setIsLoading(true)
				const results = await searchPlaces(value)
				setSuggestions(results)
				setIsLoading(false)
			} else {
				setSuggestions([])
			}
		}, 300)

		return () => clearTimeout(timer)
	}, [value])

	// Click outside handler to close suggestions
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				setSuggestions([])
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleSelect = (suggestion: PlacePrediction) => {
		setValue('')
		setSuggestions([])
		onSelect(suggestion.placeId, suggestion.mainText, suggestion.secondaryText)
	}

	const containerClassName = ['relative w-full max-w-md mx-auto mb-6', className]
		.filter(Boolean)
		.join(' ')

	return (
		<div ref={ref} className={containerClassName}>
			<div className="relative">
				<div
					className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Search
						className={`h-5 w-5 ${isLoading ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`}/>
				</div>
				<input
					value={value}
					onChange={(e) => setValue(e.target.value)}
					className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg leading-5 bg-[#1e232b] text-gray-300 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:text-sm transition duration-150 ease-in-out"
					placeholder="Search for a cafe..."
				/>
			</div>

			{suggestions.length > 0 && (
				<ul className="absolute z-10 w-full bg-[#1e232b] border border-gray-700 mt-1 max-h-60 rounded-md shadow-lg overflow-auto focus:outline-none sm:text-sm">
					{suggestions.map((suggestion) => (
						<li
							key={suggestion.placeId}
							onClick={() => handleSelect(suggestion)}
							className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-700 text-gray-300"
						>
							<div className="flex items-center">
                                <span
	                                className="flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                     <MapPin size={16} className="text-gray-500"/>
                                </span>
								<div className="ml-3 truncate">
                                    <span className="block font-medium truncate">
                                        {suggestion.mainText}
                                    </span>
									<span className="block text-xs text-gray-500 truncate">
                                        {suggestion.secondaryText}
                                    </span>
								</div>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
