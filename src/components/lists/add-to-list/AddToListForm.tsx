'use client'

import {addCafeToList, ListWithCount} from '@/app/actions/lists'
import {useFormStatus} from 'react-dom'
import {useState} from 'react'

interface AddToListFormProps {
	cafeId: string
	userLists: ListWithCount[]
	onSuccess: () => void
}

function SubmitButton() {
	const {pending} = useFormStatus()
	return (
		<button
			type="submit"
			disabled={pending}
			className="w-full rounded bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
		>
			{pending ? 'Adding...' : 'Add to List'}
		</button>
	)
}

export function AddToListForm({cafeId, userLists, onSuccess}: AddToListFormProps) {
	const [selectedListId, setSelectedListId] = useState<string>('')

	return (
		<form
			action={async (formData) => {
				await addCafeToList(formData)
				onSuccess()
			}}
			className="space-y-3"
		>
			<input type="hidden" name="cafe_id" value={cafeId}/>

			<div className="space-y-1">
				<label className="text-xs text-gray-400">Select List</label>
				<select
					name="list_id"
					required
					className="w-full rounded border border-gray-700 bg-[#15191f] p-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
					value={selectedListId}
					onChange={(e) => setSelectedListId(e.target.value)}
				>
					<option value="" disabled>Choose a list...</option>
					{userLists.map((list) => (
						<option key={list.id} value={list.id}>
							{list.title}
						</option>
					))}
				</select>
			</div>

			<div className="space-y-1">
				<label className="text-xs text-gray-400">Note (Optional)</label>
				<textarea
					name="note"
					rows={2}
					className="w-full rounded border border-gray-700 bg-[#15191f] p-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500 resize-none"
					placeholder="Why this spot?"
				/>
			</div>

			<SubmitButton/>
		</form>
	)
}
