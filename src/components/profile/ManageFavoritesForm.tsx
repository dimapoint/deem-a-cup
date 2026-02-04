import {CafeCore} from '@/types/profile'
import {updateFavoriteCafes} from '@/app/profile/actions'

interface ManageFavoritesFormProps {
	favoriteSlots: { id: string; label: string; value: string }[]
	selectableCafes: CafeCore[]
	hasSelectableCafes: boolean
}

export function ManageFavoritesForm({
	                                    favoriteSlots,
	                                    selectableCafes,
	                                    hasSelectableCafes
                                    }: ManageFavoritesFormProps) {
	return (
		<form action={updateFavoriteCafes} className="space-y-3">
			{favoriteSlots.map((slot) => (
				<div key={slot.id} className="space-y-1">
					<label
						htmlFor={slot.id}
						className="text-[11px] font-semibold uppercase tracking-widest text-gray-500"
					>
						{slot.label}
					</label>
					<select
						id={slot.id}
						name={slot.id}
						defaultValue={slot.value}
						disabled={!hasSelectableCafes}
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
			))}

			<div className="space-y-2">
				{!hasSelectableCafes && (
					<p className="text-xs text-gray-500">
						Log a cafe to start choosing favorites.
					</p>
				)}
				<button
					type="submit"
					disabled={!hasSelectableCafes}
					className="w-full rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
				>
					Save favorites
				</button>
			</div>
		</form>
	)
}
