import {Calendar, Mail} from 'lucide-react'
import {InfoRow} from './info/InfoRow'

interface ProfileInfoProps {
	email?: string | null
	lastVisit: string | null
	ratedDeemsCount: number
}

export function ProfileInfo({
	                            email,
	                            lastVisit,
	                            ratedDeemsCount,
                            }: ProfileInfoProps) {
	return (
		<div className="rounded-lg border border-gray-800 bg-[#1e232b] p-4">
			<h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
				Profile
			</h3>
			<div className="mt-4 space-y-3 text-sm text-gray-400">
				{email && (
					<InfoRow
						icon={<Mail size={14}/>}
						label="Email"
						value={email}
					/>
				)}
				<InfoRow
					icon={<Calendar size={14}/>}
					label="Last visit"
					value={lastVisit ?? '-'}
				/>
				<InfoRow
					icon={<span className="text-sm leading-none text-gray-400"
					            aria-hidden="true">☕</span>}
					label="Rated visits"
					value={ratedDeemsCount}
				/>
			</div>
		</div>
	)
}
