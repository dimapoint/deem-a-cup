import {DeemWithDetails} from '@/app/actions/deem'
import {Coffee} from 'lucide-react'
import WatchlistButton from '@/components/cafes/WatchlistButton'

export function DeemFooter({deem}: { deem: DeemWithDetails }) {
	const {cafe} = deem

	return (
		<div
			className="mt-2 pt-3 border-t border-gray-800/50 flex items-center justify-between text-xs text-gray-500">
			<div className="flex items-center gap-2">
				<Coffee size={12}/>
				<span>{cafe.address}</span>
			</div>
			<WatchlistButton cafeId={cafe.id} initialIsSaved={cafe.isSaved}/>
		</div>
	)
}
