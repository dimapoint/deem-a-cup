import {createClient} from '@/utils/supabase/server'
import {CafeFeed} from '@/components/CafeFeed'
import {redirect} from 'next/navigation'

export default async function Home() {
	const supabase = await createClient()

	// 1. Verificamos sesión (opcional, si quieres que sea privado)
	const {data: {user}} = await supabase.auth.getUser()
	if (!user) {
		redirect('/login')
	}

	// 2. Pedimos los datos
	const {data: cafes} = await supabase
		.from('cafes')
		.select('*')
		.order('created_at', {ascending: false})

	return (
		<main className="min-h-screen bg-[#14181c] text-gray-100 p-4 md:p-8">
			<div className="max-w-2xl mx-auto space-y-8">
				<header className="flex justify-between items-end border-b border-gray-800 pb-6">
					<div>
						<h1 className="text-4xl font-bold tracking-tighter text-white">
							Deem a Cup <span className="text-orange-500">☕</span>
						</h1>
						<p className="text-gray-500 mt-2">Bienvenido, {user.email}</p>
					</div>
				</header>

				<section>
					<h2 className="text-xl font-bold mb-4 text-gray-400 uppercase tracking-wider text-sm">
						Cafeterías Disponibles
					</h2>
					{/* Aquí inyectamos el componente interactivo */}
					<CafeFeed cafes={cafes || []}/>
				</section>
			</div>
		</main>
	)
}