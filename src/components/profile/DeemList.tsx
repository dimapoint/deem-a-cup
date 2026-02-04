import {Calendar, Heart} from 'lucide-react'
import {CoffeeRating} from '@/components/deems/CoffeeRating'
import {formatDate} from '@/utils/date'
import {DeemWithCafe} from '@/types/profile'

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
				<div
					key={deem.id}
					className="rounded-lg border border-gray-800 bg-[#1e232b] p-4"
				>
					<div
						className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<h3 className="text-lg font-semibold text-white">
								{deem.cafe?.name ?? 'Unknown Cafe'}
							</h3>
							<p className="text-xs text-gray-500">
								{deem.cafe?.address ?? 'Address not set'}
							</p>
						</div>
						{deem.rating !== null && (
							<div
								className="flex items-center rounded-md border border-gray-700 bg-gray-900 px-2 py-1 text-sm font-semibold text-gray-200">
								<CoffeeRating rating={deem.rating} size="sm"/>
							</div>
						)}
					</div>

					<div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
						<span className="flex items-center gap-1">
							<Calendar size={12}/>
							{formatDate(deem.visited_at)}
						</span>
						{deem.liked && (
							<span className="flex items-center gap-1 text-pink-400">
								<Heart size={12} className="fill-pink-400"/>
								Liked
							</span>
						)}
					</div>

					{deem.review && (
						<p className="mt-3 text-sm italic text-gray-300">
							&#34;{deem.review}&#34;
						</p>
					)}
				</div>
			))}
		</div>
	)
}
