import {createClient} from '@/utils/supabase/server'
import {redirect} from 'next/navigation'
import {getFeedActivities} from '@/app/actions/feed'
import {ActivityFeed} from '@/components/feed/ActivityFeed'

export default async function FeedPage() {
	const supabase = await createClient()
	const {data: {user}} = await supabase.auth.getUser()
	if (!user) {
		redirect('/login')
	}

	const activities = await getFeedActivities()

	return (
		<main className="min-h-screen bg-[#14181c] text-gray-100 p-4 md:p-8">
			<div className="max-w-2xl mx-auto space-y-8">
				<header className="border-b border-gray-800 pb-6">
					<h1 className="text-4xl font-bold tracking-tighter text-white">Following</h1>
					<p className="text-gray-500 mt-2">Activity from people you follow</p>
				</header>

				<ActivityFeed activities={activities} />
			</div>
		</main>
	)
}
