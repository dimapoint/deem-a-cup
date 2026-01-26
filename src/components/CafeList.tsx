'use client'

import {useState} from 'react'
import {Cafe} from '@/types/database'
import LogCafeForm from './LogCafeForm'

interface CafeListProps {
	cafes: Cafe[]
}

export default function CafeList({cafes}: CafeListProps) {
	const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)

	return (
		<>
			<div className="grid gap-4">
				{cafes?.map((cafe) => (
					<div
						key={cafe.id}
						className="bg-[#1e232b] p-4 rounded-lg border border-gray-700 hover:border-orange-500/50 transition flex justify-between items-center group"
					>
						<div>
							<h3 className="font-bold text-lg group-hover:text-orange-400 transition">
								{cafe.name}
							</h3>
							<p className="text-sm text-gray-400">📍 {cafe.address}</p>
						</div>

						<button
							onClick={() => setSelectedCafe(cafe)}
							className="bg-gray-700 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-bold transition"
						>
							+ Log
						</button>
					</div>
				))}

				{(!cafes || cafes.length === 0) && (
					<p className="text-gray-500 italic">
						No hay cafeterías en la base de datos aún.
					</p>
				)}
			</div>

			{/* Modal */}
			{selectedCafe && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
					<div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
						<button
							onClick={() => setSelectedCafe(null)}
							className="absolute right-4 top-4 text-gray-500 hover:text-black z-10"
						>
							✕
						</button>
						<LogCafeForm
							cafeId={selectedCafe.id}
							cafeName={selectedCafe.name}
							onSuccess={() => setSelectedCafe(null)}
						/>
					</div>
				</div>
			)}
		</>
	)
}
