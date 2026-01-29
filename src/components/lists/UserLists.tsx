import Link from 'next/link'
import { ListWithCount } from '@/app/actions/lists'
import { List as ListIcon, Trophy } from 'lucide-react'

interface UserListsProps {
	lists: ListWithCount[]
}

export function UserLists({ lists }: UserListsProps) {
	if (lists.length === 0) {
		return (
			<div className="rounded-lg border border-gray-800 bg-[#1e232b] p-6 text-sm text-gray-500">
				No lists created yet.
			</div>
		)
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2">
			{lists.map((list) => (
				<Link
					key={list.id}
					href={`/lists/${list.id}`}
					className="group block rounded-lg border border-gray-800 bg-[#1e232b] p-4 transition hover:border-orange-500/50"
				>
					<div className="flex items-start justify-between">
						<div>
							<h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors">
								{list.title}
							</h3>
							{list.description && (
								<p className="mt-1 text-xs text-gray-400 line-clamp-2">
									{list.description}
								</p>
							)}
						</div>
						{list.is_ranked ? (
							<Trophy size={16} className="text-yellow-500 flex-shrink-0" />
						) : (
							<ListIcon size={16} className="text-gray-500 flex-shrink-0" />
						)}
					</div>
					<div className="mt-4 text-xs text-gray-500">
						{list.count} {list.count === 1 ? 'item' : 'items'}
					</div>
				</Link>
			))}
		</div>
	)
}
