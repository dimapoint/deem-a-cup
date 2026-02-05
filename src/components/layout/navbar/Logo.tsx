import Link from 'next/link'
import {Coffee} from 'lucide-react'

export function Logo() {
	return (
		<Link
			href="/"
			className="flex items-center gap-2 text-lg font-bold text-white hover:text-orange-500 transition-colors"
		>
			<Coffee className="h-6 w-6 text-orange-500"/>
			<span className="hidden sm:inline">Deem a Cup</span>
		</Link>
	)
}
