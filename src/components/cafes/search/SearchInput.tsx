'use client'

import {Search} from 'lucide-react'

interface SearchInputProps {
	value: string
	onChange: (value: string) => void
	isLoading: boolean
}

export function SearchInput({value, onChange, isLoading}: SearchInputProps) {
	return (
		<div className="relative">
			<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<Search
					className={`h-5 w-5 ${isLoading ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`}/>
			</div>
			<input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg leading-5 bg-[#1e232b] text-gray-300 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:text-sm transition duration-150 ease-in-out"
				placeholder="Search for a cafe..."
			/>
		</div>
	)
}
