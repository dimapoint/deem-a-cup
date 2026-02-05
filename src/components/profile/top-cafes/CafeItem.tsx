import {CafeCore} from '@/types/profile'

interface CafeItemProps {
	cafe: CafeCore
	index: number
}

export function CafeItem({cafe, index}: CafeItemProps) {
	return (
		<div className="flex items-start gap-3">
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
	)
}
