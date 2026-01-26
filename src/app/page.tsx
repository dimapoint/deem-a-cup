import {createClient} from '@/utils/supabase/server';
import CafeList from '@/components/CafeList';
import { Cafe } from '@/types/database';

export default async function Home() {
	// 1. Conexión al servidor (Server Component)
	const supabase = await createClient();

	// 2. Pedir datos a la DB
	const {data} = await supabase.from('cafes').select('*');
	const cafes = data as Cafe[] | null;

	return (
		<main className="min-h-screen bg-[#14181c] text-gray-100 p-8">
			<div className="max-w-2xl mx-auto">
				<header className="mb-12 text-center">
					<h1 className="text-5xl font-bold tracking-tighter mb-4">
						Deem a Cup <span className="text-orange-500">☕</span>
					</h1>
					<p className="text-xl text-gray-400">
						El Letterboxd para tus dosis de cafeína.
					</p>
				</header>

				<section>
					<h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">
						Cafeterías Populares
					</h2>

					{/* Grid de Cafés ahora manejado por el Client Component */}
					<CafeList cafes={cafes || []} />
				</section>
			</div>
		</main>
	);
}