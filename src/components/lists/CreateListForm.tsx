'use client'

import {createList} from '@/app/actions/lists'
import {useFormStatus} from 'react-dom'

function SubmitButton() {
	const {pending} = useFormStatus()

	return (
		<button
			type="submit"
			disabled={pending}
			className="w-full rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
		>
			{pending ? 'Creating...' : 'Create List'}
		</button>
	)
}

export function CreateListForm({onSuccess}: { onSuccess?: () => void }) {
	return (
		<form
			action={async (formData) => {
				await createList(formData)
				if (onSuccess) onSuccess()
			}}
			className="flex flex-col gap-4 p-4 text-white bg-[#1e232b] rounded-lg border border-gray-800"
		>
			<h2 className="text-xl font-bold">New List</h2>

			<div className="flex flex-col gap-1">
				<label htmlFor="title" className="text-sm font-medium text-gray-300">
					Title
				</label>
				<input
					type="text"
					id="title"
					name="title"
					required
					className="rounded border border-gray-700 bg-[#15191f] p-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
					placeholder="e.g. Best Work Spots"
				/>
			</div>

			<div className="flex flex-col gap-1">
				<label htmlFor="description" className="text-sm font-medium text-gray-300">
					Description (optional)
				</label>
				<textarea
					id="description"
					name="description"
					rows={3}
					className="rounded border border-gray-700 bg-[#15191f] p-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500 resize-none"
					placeholder="What is this list about?"
				/>
			</div>

			<div className="flex items-center gap-2">
				<input
					type="checkbox"
					id="is_ranked"
					name="is_ranked"
					className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
				/>
				<label htmlFor="is_ranked" className="text-sm text-gray-300">
					Ranked List (1, 2, 3...)
				</label>
			</div>

			<SubmitButton/>
		</form>
	)
}
