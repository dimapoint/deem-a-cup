import {Modal} from '@/components/ui/Modal'
import LogCafeForm from '@/components/deems/LogCafeForm'
import CreateCafeForm from '@/components/cafes/CreateCafeForm'
import {Cafe} from '@/types/database'

interface DashboardModalsProps {
	selectedCafe: Cafe | null
	isCreateModalOpen: boolean
	onCloseLogModal: () => void
	onCloseCreateModal: () => void
}

export function DashboardModals({
	                                selectedCafe,
	                                isCreateModalOpen,
	                                onCloseLogModal,
	                                onCloseCreateModal
                                }: DashboardModalsProps) {
	return (
		<>
			{/* Log Modal */}
			<Modal
				isOpen={!!selectedCafe}
				onClose={onCloseLogModal}
				title={<>Log <span className="text-orange-400">{selectedCafe?.name}</span></>}
			>
				{selectedCafe && (
					<LogCafeForm
						cafeId={selectedCafe.id}
						cafeName={selectedCafe.name}
						onSuccess={onCloseLogModal}
					/>
				)}
			</Modal>

			{/* Create Cafe Modal */}
			<Modal
				isOpen={isCreateModalOpen}
				onClose={onCloseCreateModal}
				title={<>Add New <span className="text-orange-400">Cafe</span></>}
			>
				<CreateCafeForm onSuccess={onCloseCreateModal}/>
			</Modal>
		</>
	)
}
