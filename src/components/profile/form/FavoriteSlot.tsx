import {CafeCore} from '@/types/profile'

interface FavoriteSlotProps {
	id: string
	label: string
	value: string
	selectableCafes: CafeCore[]
	disabled: boolean
}

export function FavoriteSlot({id, label, value, selectableCafes, disabled}: FavoriteSlotProps) {
	return (
		<div className="space-y-1">
			<label
				htmlFor={id}
				className="text-[11px] font-semibold uppercase tracking-widest text-gray-500"
			>
				{label}
			</label>
			<select
				id={id}
				name={id}
				defaultValue={value}
				disabled={disabled}
				className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
			>
				<option value="">None</option>
				{selectableCafes.map((cafe) => (
					<option key={cafe.id} value={cafe.id}>
						{cafe.name}
					</option>
				))}
			</select>
		</div>
	)
}
