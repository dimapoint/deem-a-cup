'use client'

import CafeSearch from '../CafeSearch'

interface SearchStepProps {
	onSelect: (placeId: string, name: string, address: string) => void
	onManualLog: () => void
}

export function SearchStep({onSelect, onManualLog}: SearchStepProps) {
	return (
		<div
			className="flex flex-col gap-4 p-4 text-white bg-[#1e232b] rounded-lg border border-gray-800">
			<h2 className="text-xl font-bold">Log a Cafe</h2>
			<p className="text-sm text-gray-400">Search for a cafe to log your visit.</p>
			<CafeSearch onSelect={onSelect}/>

			<div className="text-center text-xs text-gray-500 mt-2">
				Can&apos;t find it?{' '}
				<button onClick={onManualLog} className="text-orange-500 hover:underline">
					Log manually
				</button>
			</div>
		</div>
	)
}
