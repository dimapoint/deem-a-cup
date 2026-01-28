import {DeemWithDetails} from '@/app/actions/deem'
import {CoffeeRating} from '@/components/CoffeeRating'
import {Coffee, Heart, User} from 'lucide-react'
import Image from 'next/image'

// Helper to format date
const formatDate = (value: string) => {
	const [datePart] = value.split('T')
	const [year, month, day] = datePart.split('-').map(Number)
	const date = year && month && day ? new Date(year, month - 1, day) : new Date(value)
	return new Intl.DateTimeFormat('es-ES', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	}).format(date)
}

export function DeemCard({deem}: { deem: DeemWithDetails }) {
	const {cafe, profile} = deem

	return (
		<div
			className="bg-[#1e232b] p-5 rounded-lg border border-gray-700 hover:border-gray-600 transition flex flex-col gap-3">
			{/* Header: User and Cafe */}
			<div className="flex justify-between items-start">
				<div className="flex items-center gap-3">
					<div
						className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600">
						{profile?.avatar_url ? (
							<Image
								src={profile.avatar_url}
								alt={profile.full_name || 'User'}
								width={40}
								height={40}
								className="w-full h-full object-cover"
							/>
						) : (
							<User size={20} className="text-gray-400"/>
						)}
					</div>
					<div>
						<div className="flex items-baseline gap-2">
							<span className="font-bold text-gray-200">
								{profile?.full_name || profile?.username || 'Anónimo'}
							</span>
							<span className="text-xs text-gray-500">
								visited
							</span>
							<span className="font-bold text-orange-400">
								{cafe.name}
							</span>
						</div>
						<p className="text-xs text-gray-500">
							{formatDate(deem.visited_at)}
						</p>
					</div>
				</div>

				{/* Rating */}
				{deem.rating !== null && (
					<div
						className="flex items-center bg-gray-800 px-2 py-1 rounded-md border border-gray-700">
						<CoffeeRating rating={deem.rating} size="sm"/>
					</div>
				)}
			</div>

			{/* Review Content */}
			{(deem.review || deem.liked) && (
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
			)}

			{/* Footer: Cafe Address (Context) */}
			<div
				className="mt-2 pt-3 border-t border-gray-800/50 flex items-center gap-2 text-xs text-gray-500">
				<Coffee size={12}/>
				<span>{cafe.address}</span>
			</div>
		</div>
	)
}
