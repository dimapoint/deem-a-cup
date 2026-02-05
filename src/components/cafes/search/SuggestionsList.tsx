'use client'

import {MapPin} from 'lucide-react'
import {PlacePrediction} from '@/app/actions/places'

interface SuggestionsListProps {
	suggestions: PlacePrediction[]
	onSelect: (suggestion: PlacePrediction) => void
}

export function SuggestionsList({suggestions, onSelect}: SuggestionsListProps) {
	if (suggestions.length === 0) return null

	return (
		<ul className="absolute z-10 w-full bg-[#1e232b] border border-gray-700 mt-1 max-h-60 rounded-md shadow-lg overflow-auto focus:outline-none sm:text-sm">
			{suggestions.map((suggestion) => (
				<li
					key={suggestion.placeId}
					onClick={() => onSelect(suggestion)}
					className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-700 text-gray-300"
				>
					<div className="flex items-center">
            <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center">
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
	)
}
