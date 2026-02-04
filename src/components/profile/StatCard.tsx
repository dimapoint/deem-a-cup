import type {ReactNode} from 'react'

type StatCardProps = {
	label: string
	value: string
	icon: ReactNode
}

export const StatCard = ({label, value, icon}: StatCardProps) => (
	<div className="rounded-lg border border-gray-800 bg-[#1e232b] p-4">
		<div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500">
			{icon}
			<span>{label}</span>
		</div>
		<div className="mt-2 text-2xl font-bold text-white">{value}</div>
	</div>
)
