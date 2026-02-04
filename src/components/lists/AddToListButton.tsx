'use client'

import {useState} from 'react'
import {List as ListIcon} from 'lucide-react'
import {addCafeToList, ListWithCount} from '@/app/actions/lists'
import {useFormStatus} from 'react-dom'

interface AddToListButtonProps {
	cafeId: string
	userLists: ListWithCount[]
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

export function AddToListButton({cafeId, userLists}: AddToListButtonProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [selectedListId, setSelectedListId] = useState<string>('')

	if (userLists.length === 0) {
		return null // Don't show if user has no lists
	}

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-1 rounded bg-gray-800 px-2 py-1 text-xs font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border border-gray-700"
			>
				<ListIcon size={12}/>
				Add to List
			</button>

			{isOpen && (
				<>
					<div
						className="fixed inset-0 z-40 bg-black/50"
						onClick={() => setIsOpen(false)}
					/>
					<div
						className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-gray-700 bg-[#1e232b] p-4 shadow-xl">
						<h3 className="mb-3 text-sm font-bold text-white">Add to a List</h3>
						<form
							action={async (formData) => {
								await addCafeToList(formData)
								setIsOpen(false)
								// Optional: Show toast success
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
					</div>
				</>
			)}
		</div>
	)
}
