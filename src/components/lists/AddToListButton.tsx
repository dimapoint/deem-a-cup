'use client'

import {useState} from 'react'
import {List as ListIcon} from 'lucide-react'
import {ListWithCount} from '@/app/actions/lists'
import {AddToListForm} from './add-to-list/AddToListForm'

interface AddToListButtonProps {
	cafeId: string
	userLists: ListWithCount[]
}

export function AddToListButton({cafeId, userLists}: AddToListButtonProps) {
	const [isOpen, setIsOpen] = useState(false)

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
						<AddToListForm
							cafeId={cafeId}
							userLists={userLists}
							onSuccess={() => setIsOpen(false)}
						/>
					</div>
				</>
			)}
		</div>
	)
}
