'use client'

import {createCafe} from '@/app/actions/cafe'
import {useFormStatus} from 'react-dom'

interface CreateCafeFormProps {
	onSuccess?: () => void
}

function SubmitButton() {
	const {pending} = useFormStatus()

	return (
		<button
			type="submit"
			disabled={pending}
			className="w-full rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600 disabled:opacity-50"
		>
			{pending ? 'Creating...' : 'Create Cafe'}
		</button>
	)
}

export default function CreateCafeForm({onSuccess}: CreateCafeFormProps) {
	return (
		<form
			action={async (formData) => {
				await createCafe(formData)
				if (onSuccess) onSuccess()
			}}
			className="flex flex-col gap-4 p-4 text-black bg-white rounded-lg"
		>
			<h2 className="text-xl font-bold">Add New Cafe</h2>

			{/* Name */}
			<div className="flex flex-col gap-1">
				<label htmlFor="name" className="text-sm font-medium">Name</label>
				<input
					type="text"
					id="name"
					name="name"
					required
					className="rounded border border-gray-300 p-2 text-sm"
					placeholder="Cafe Name"
				/>
			</div>

			{/* Address */}
			<div className="flex flex-col gap-1">
				<label htmlFor="address" className="text-sm font-medium">Address</label>
				<input
					type="text"
					id="address"
					name="address"
					className="rounded border border-gray-300 p-2 text-sm"
					placeholder="Address (optional)"
				/>
			</div>

			<SubmitButton/>
		</form>
	)
}
