import {DeemWithDetails} from '@/app/actions/deem'
import {DeemHeader} from './card/DeemHeader'
import {DeemContent} from './card/DeemContent'
import {DeemFooter} from './card/DeemFooter'

export function DeemCard({deem}: { deem: DeemWithDetails }) {
	return (
		<div
			className="bg-[#1e232b] p-5 rounded-lg border border-gray-700 hover:border-gray-600 transition flex flex-col gap-3">
			<DeemHeader deem={deem}/>
			<DeemContent deem={deem}/>
			<DeemFooter deem={deem}/>
		</div>
	)
}
