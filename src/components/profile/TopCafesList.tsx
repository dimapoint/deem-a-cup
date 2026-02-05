import {CafeCore} from '@/types/profile'
import {ReactNode} from 'react'
import {CafeItem} from './top-cafes/CafeItem'

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
						<CafeItem key={cafe.id} cafe={cafe} index={index}/>
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
