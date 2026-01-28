import {DeemWithDetails} from '@/app/actions/deem'
import {DeemCard} from './DeemCard'

export function DeemFeed({deems}: { deems: DeemWithDetails[] }) {
	if (deems.length === 0) {
		return (
			<div className="text-center py-10 text-gray-500">
				<p>No hay actividad reciente.</p>
				<p className="text-sm">¡Sé el primero en loguear un café!</p>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{deems.map((deem) => (
				<DeemCard key={deem.id} deem={deem}/>
			))}
		</div>
	)
}
