'use client'

import {createCafe} from '@/app/actions/cafe'
import {useFormStatus} from 'react-dom'
import {useState} from 'react'
import CafeSearch from './CafeSearch'
import {X} from 'lucide-react'

interface CreateCafeFormProps {
	onSuccess?: () => void
}

function SubmitButton() {
	const {pending} = useFormStatus()

	return (
		<button
			type="submit"
			disabled={pending}
			className="w-full rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
		>
			{pending ? 'Creating...' : 'Log Cafe'}
		</button>
	)
}

export default function CreateCafeForm({onSuccess}: CreateCafeFormProps) {
	const [selectedPlace, setSelectedPlace] = useState<{placeId: string, name: string, address: string} | null>(null)

	if (!selectedPlace) {
		return (
			<div className="flex flex-col gap-4 p-4 text-white bg-[#1e232b] rounded-lg border border-gray-800">
				<h2 className="text-xl font-bold">Log a Cafe</h2>
				<p className="text-sm text-gray-400">Search for a cafe to log your visit.</p>
				<CafeSearch onSelect={(placeId, name, address) => setSelectedPlace({placeId, name, address})} />
				
				<div className="text-center text-xs text-gray-500 mt-2">
					Can&apos;t find it? <button onClick={() => setSelectedPlace({placeId: '', name: '', address: ''})} className="text-orange-500 hover:underline">Log manually</button>
				</div>
			</div>
		)
	}

	return (
		<form
			action={async (formData) => {
				await createCafe(formData)
				if (onSuccess) onSuccess()
			}}
			className="flex flex-col gap-4 p-4 text-white bg-[#1e232b] rounded-lg border border-gray-800"
		>
			<div className="flex justify-between items-center mb-2">
				<h2 className="text-xl font-bold">Confirm Cafe</h2>
				<button type="button" onClick={() => setSelectedPlace(null)} className="text-gray-400 hover:text-white transition-colors">
					<X size={20} />
				</button>
			</div>

			<input type="hidden" name="place_id" value={selectedPlace.placeId} />

			{/* Name */}
			<div className="flex flex-col gap-1">
				<label htmlFor="name" className="text-sm font-medium text-gray-300">Name</label>
				<input
					type="text"
					id="name"
					name="name"
					required
					defaultValue={selectedPlace.name}
					readOnly={!!selectedPlace.placeId}
					className={`rounded border border-gray-700 bg-[#15191f] p-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500 ${selectedPlace.placeId ? 'cursor-default opacity-80' : ''}`}
					placeholder="Cafe Name"
				/>
			</div>

			{/* Address */}
			<div className="flex flex-col gap-1">
				<label htmlFor="address" className="text-sm font-medium text-gray-300">Address</label>
				<input
					type="text"
					id="address"
					name="address"
					defaultValue={selectedPlace.address}
					readOnly={!!selectedPlace.placeId}
					className={`rounded border border-gray-700 bg-[#15191f] p-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500 ${selectedPlace.placeId ? 'cursor-default opacity-80' : ''}`}
					placeholder="Address (optional)"
				/>
			</div>

			<SubmitButton/>
		</form>
	)
}