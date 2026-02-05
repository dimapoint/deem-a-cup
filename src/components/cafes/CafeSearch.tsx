'use client'

import {useEffect, useRef, useState} from 'react'
import {PlacePrediction, searchPlaces} from '@/app/actions/places'
import {SearchInput} from './search/SearchInput'
import {SuggestionsList} from './search/SuggestionsList'

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
			<SearchInput value={value} onChange={setValue} isLoading={isLoading}/>
			<SuggestionsList suggestions={suggestions} onSelect={handleSelect}/>
		</div>
	)
}
