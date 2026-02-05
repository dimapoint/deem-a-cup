import {ListWithCount} from '@/app/actions/lists'
import {ListCard} from './user-lists/ListCard'

interface UserListsProps {
	lists: ListWithCount[]
}

export function UserLists({lists}: UserListsProps) {
	if (lists.length === 0) {
		return (
			<div
				className="rounded-lg border border-gray-800 bg-[#1e232b] p-6 text-sm text-gray-500">
				No lists created yet.
			</div>
		)
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2">
			{lists.map((list) => (
				<ListCard key={list.id} list={list}/>
			))}
		</div>
	)
}
