import {ReactNode} from 'react'
import {ModalHeader} from './modal/ModalHeader'
import {ModalContent} from './modal/ModalContent'

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	title: ReactNode
	children: ReactNode
}

export function Modal({isOpen, onClose, title, children}: ModalProps) {
	if (!isOpen) return null

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
			<div
				className="bg-[#1e232b] border border-gray-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex max-h-[calc(100dvh-2rem)] flex-col">
				<ModalHeader title={title} onClose={onClose}/>
				<ModalContent>{children}</ModalContent>
			</div>
		</div>
	)
}
