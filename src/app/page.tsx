import {createClient} from '@/utils/supabase/server'
import {Dashboard} from '@/components/dashboard/Dashboard'
import {redirect} from 'next/navigation'
import {getRecentDeems} from '@/app/actions/deem'

export default async function Home() {
	const supabase = await createClient()

	// 1. Check session (optional, if you want it to be private)
	const {data: {user}} = await supabase.auth.getUser()
	if (!user) {
		redirect('/login')
	}

	// 2. Fetch data
	const deems = await getRecentDeems()

	return (
		<main className="min-h-screen bg-[#14181c] text-gray-100 p-4 md:p-8">
			<div className="max-w-2xl mx-auto space-y-8">
				<header className="flex justify-between items-end border-b border-gray-800 pb-6">
					<div>
						<h1 className="text-4xl font-bold tracking-tighter text-white">
							Recent Activity
						</h1>
						<p className="text-gray-500 mt-2">See what others are drinking</p>
					</div>
				</header>

				<Dashboard deems={deems}/>
			</div>
		</main>
	)
}
