import {DeemWithCafe} from '@/types/profile'
import {DeemItem} from './deem-list/DeemItem'

interface DeemListProps {
	deems: DeemWithCafe[]
	emptyMessage?: string
}

export function DeemList({deems, emptyMessage = "No logs yet."}: DeemListProps) {
	if (deems.length === 0) {
		return (
			<div
				className="rounded-lg border border-gray-800 bg-[#1e232b] p-6 text-sm text-gray-500">
				{emptyMessage}
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{deems.map((deem) => (
				<DeemItem key={deem.id} deem={deem}/>
			))}
		</div>
	)
}
