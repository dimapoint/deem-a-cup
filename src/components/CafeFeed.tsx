'use client' // ¡Importante! Esto habilita useState y onClick

import {useState} from 'react'
import LogCafeForm from './LogCafeForm' // Asegúrate que el import coincida con lo que creó Junie
import {Coffee, MapPin, Plus} from 'lucide-react' // Iconos bonitos

// Definimos el tipo aquí o lo importamos de tus types
type Cafe = {
	id: string
	name: string
	address: string | null
}

export function CafeFeed({cafes}: { cafes: Cafe[] }) {
	const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)

	return (
		<>
			{/* 1. La Grid de Cafeterías */}
			<div className="grid gap-4">
				{cafes.map((cafe) => (
					<div
						key={cafe.id}
						className="bg-[#1e232b] p-4 rounded-lg border border-gray-700 hover:border-orange-500/50 transition flex justify-between items-center group"
					>
						<div>
							<h3 className="font-bold text-lg text-gray-200 group-hover:text-orange-400 transition flex items-center gap-2">
								<Coffee size={18}/>
								{cafe.name}
							</h3>
							<p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
								<MapPin size={14}/>
								{cafe.address}
							</p>
						</div>

						<button
							onClick={() => setSelectedCafe(cafe)} // AQUÍ abrimos el modal
							className="bg-gray-800 hover:bg-green-600 hover:text-white text-gray-300 px-4 py-2 rounded-md text-sm font-bold transition flex items-center gap-2"
						>
							<Plus size={16}/>
							Log
						</button>
					</div>
				))}
			</div>

			{/* 2. El Modal (Dialog) Nativo */}
			{selectedCafe && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
					<div
						className="bg-[#1e232b] border border-gray-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

						{/* Header del Modal */}
						<div
							className="flex justify-between items-center p-4 border-b border-gray-700 bg-[#14181c]">
							<h3 className="font-bold text-lg">
								Logueando <span
								className="text-orange-400">{selectedCafe.name}</span>
							</h3>
							<button
								onClick={() => setSelectedCafe(null)}
								className="text-gray-500 hover:text-white"
							>
								✕
							</button>
						</div>

						{/* El Formulario que hizo Junie */}
						<div className="p-4">
							<LogCafeForm
								cafeId={selectedCafe.id}
								cafeName={selectedCafe.name}
								// Truco: Pasamos una función para cerrar el modal al terminar
								onSuccess={() => setSelectedCafe(null)}
							/>
						</div>
					</div>
				</div>
			)}
		</>
	)
}