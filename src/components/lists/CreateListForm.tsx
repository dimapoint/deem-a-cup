'use client'

import {createList} from '@/app/actions/lists'
import {SubmitButton} from './create/SubmitButton'
import {ListFormFields} from './create/ListFormFields'

export function CreateListForm({onSuccessAction}: { onSuccessAction?: () => void }) {
	return (
		<form
			action={async (formData) => {
				await createList(formData)
				if (onSuccessAction) onSuccessAction()
			}}
			className="flex flex-col gap-4 p-4 text-white bg-[#1e232b] rounded-lg border border-gray-800"
		>
			<h2 className="text-xl font-bold">New List</h2>
			<ListFormFields/>
			<SubmitButton/>
		</form>
	)
}
