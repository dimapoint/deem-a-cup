import {DeemWithDetails} from '@/app/actions/deem'
import {Heart} from 'lucide-react'

export function DeemContent({deem}: { deem: DeemWithDetails }) {
	if (!deem.review && !deem.liked) return null

	return (
		<div className="pl-13 ml-10 border-l-2 border-gray-800 pl-3">
			{deem.review && (
				<p className="text-gray-300 text-sm leading-relaxed italic">
					&#34;{deem.review}&#34;
				</p>
			)}

			{deem.liked && (
				<div
					className="mt-2 flex items-center gap-2 text-pink-500 text-xs font-bold uppercase tracking-wider">
					<Heart size={12} className="fill-pink-500"/>
					Liked
				</div>
			)}
		</div>
	)
}
