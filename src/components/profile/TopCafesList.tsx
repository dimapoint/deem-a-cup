import {CafeCore} from '@/types/profile'
import {ReactNode} from 'react'

interface TopCafesListProps {
	cafes: CafeCore[]
	children?: ReactNode
}

export function TopCafesList({cafes, children}: TopCafesListProps) {
	return (
		<div className="rounded-lg border border-gray-800 bg-[#1e232b] p-4">
			<h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
				Top cafes
			</h3>
			{cafes.length === 0 ? (
				<p className="mt-4 text-sm text-gray-500">
					{children ? 'Pick up to three favorites to feature on your profile.' : 'No favorites selected yet.'}
				</p>
			) : (
				<div className="mt-4 space-y-3">
					{cafes.map((cafe, index) => (
						<div key={cafe.id} className="flex items-start gap-3">
							<div
								className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-gray-400">
								<span className="text-xs font-semibold text-gray-300">
									{index + 1}
								</span>
							</div>
							<div className="flex-1">
								<p className="text-sm font-semibold text-gray-200">
									{cafe.name}
								</p>
								<p className="text-xs text-gray-500">
									{cafe.address ?? 'Address not set'}
								</p>
							</div>
						</div>
					))}
				</div>
			)}

			{children && (
				<div className="mt-4 border-t border-gray-800 pt-4">
					{children}
				</div>
			)}
		</div>
	)
}
