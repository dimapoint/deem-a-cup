'use client'

import {useState} from 'react'
import LogCafeForm from '@/components/deems/LogCafeForm'
import CreateCafeForm from '@/components/cafes/CreateCafeForm'
import {Coffee, Store} from 'lucide-react'
import CafeSearch from '@/components/cafes/CafeSearch'
import {getOrCreateCafe} from '@/app/actions/cafe'
import {Cafe} from '@/types/database'
import {DeemWithDetails} from '@/app/actions/deem'
import {DeemFeed} from '@/components/deems/DeemFeed'
import {NearbyCafes} from '@/components/cafes/NearbyCafes'

export function Dashboard({deems}: { deems: DeemWithDetails[] }) {
	const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

	const handleCafeSelect = async (placeId: string, name: string, address: string) => {
		try {
			const cafe = await getOrCreateCafe(placeId, name, address)
			setSelectedCafe(cafe)
		} catch (error) {
			console.error("Failed to select cafe:", error)
		}
	}

	return (
		<>
			{/* Log Area */}
			<section className="rounded-xl border border-gray-800 bg-[#1e232b] p-4 md:p-5 mb-8">
				<div className="flex items-start justify-between gap-4">
					<div>
						<div
							className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500">
							<Coffee size={14}/>
							<span>Log a cafe</span>
						</div>
						<p className="text-sm text-gray-400 mt-2">
							Search for a cafe or add a custom spot to log your visit.
						</p>
					</div>
				</div>

				<div className="flex flex-col md:flex-row gap-4 mt-4">
					<div className="grow">
						<CafeSearch
							onSelect={handleCafeSelect}
							className="max-w-none mx-0 mb-0"
						/>
					</div>
					<button
						onClick={() => setIsCreateModalOpen(true)}
						className="bg-[#14181c] hover:bg-[#1b2027] border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 h-10.5 whitespace-nowrap"
					>
						<Store size={16}/>
						Add Custom Cafe
					</button>
				</div>
			</section>

			{/* Nearby Cafes */}
			<NearbyCafes onSelectAction={setSelectedCafe}/>

			{/* Activity Feed */}
			<section>
				<DeemFeed deems={deems}/>
			</section>

			{/* Log Modal */}
			{selectedCafe && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
					<div
						className="bg-[#1e232b] border border-gray-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex max-h-[calc(100dvh-2rem)] flex-col">

						<div
							className="flex justify-between items-center p-4 border-b border-gray-700 bg-[#14181c]">
							<h3 className="font-bold text-lg">
								Log <span className="text-orange-400">{selectedCafe.name}</span>
							</h3>
							<button
								onClick={() => setSelectedCafe(null)}
								className="text-gray-500 hover:text-white"
							>
								✕
							</button>
						</div>

						<div className="overflow-y-auto p-3 sm:p-4">
							<LogCafeForm
								cafeId={selectedCafe.id}
								cafeName={selectedCafe.name}
								onSuccess={() => setSelectedCafe(null)}
							/>
						</div>
					</div>
				</div>
			)}

			{/* Create Cafe Modal */}
			{isCreateModalOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
					<div
						className="bg-[#1e232b] border border-gray-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex max-h-[calc(100dvh-2rem)] flex-col">
						<div
							className="flex justify-between items-center p-4 border-b border-gray-700 bg-[#14181c]">
							<h3 className="font-bold text-lg">
								Add New <span className="text-orange-400">Cafe</span>
							</h3>
							<button
								onClick={() => setIsCreateModalOpen(false)}
								className="text-gray-500 hover:text-white"
							>
								✕
							</button>
						</div>

						<div className="overflow-y-auto p-3 sm:p-4">
							<CreateCafeForm
								onSuccess={() => setIsCreateModalOpen(false)}
							/>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
