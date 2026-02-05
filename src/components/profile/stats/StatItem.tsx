import {ReactNode} from 'react'
import {StatCard} from '../StatCard'

interface StatItemProps {
	label: string
	value: string
	icon: ReactNode
}

export function StatItem({label, value, icon}: StatItemProps) {
	return (
		<StatCard
			label={label}
			value={value}
			icon={icon}
		/>
	)
}
