import {Calendar, Mail} from 'lucide-react'

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
					<div className="flex items-center justify-between gap-3">
						<span className="flex items-center gap-2">
							<Mail size={14}/>
							Email
						</span>
						<span className="text-gray-200">{email}</span>
					</div>
				)}
				<div className="flex items-center justify-between gap-3">
					<span className="flex items-center gap-2">
						<Calendar size={14}/>
						Last visit
					</span>
					<span className="text-gray-200">{lastVisit ?? '-'}</span>
				</div>
				<div className="flex items-center justify-between gap-3">
					<span className="flex items-center gap-2">
						<span className="text-sm leading-none text-gray-400"
						      aria-hidden="true">☕</span>
						Rated visits
					</span>
					<span className="text-gray-200">{ratedDeemsCount}</span>
				</div>
			</div>
		</div>
	)
}
