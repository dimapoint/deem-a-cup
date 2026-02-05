import {ReactNode} from 'react'
import {X} from 'lucide-react'

interface ModalHeaderProps {
	title: ReactNode
	onClose: () => void
}

export function ModalHeader({title, onClose}: ModalHeaderProps) {
	return (
		<div
			className="flex justify-between items-center p-4 border-b border-gray-700 bg-[#14181c]">
			<h3 className="font-bold text-lg text-white">{title}</h3>
			<button
				onClick={onClose}
				className="text-gray-500 hover:text-white transition-colors"
				aria-label="Close"
			>
				<X size={20}/>
			</button>
		</div>
	)
}
