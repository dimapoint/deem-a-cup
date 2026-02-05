import {CafeCore} from '@/types/profile'
import {updateFavoriteCafes} from '@/app/profile/actions'
import {FavoriteSlot} from './form/FavoriteSlot'

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
				<FavoriteSlot
					key={slot.id}
					id={slot.id}
					label={slot.label}
					value={slot.value}
					selectableCafes={selectableCafes}
					disabled={!hasSelectableCafes}
				/>
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
