import {getListDetails} from '@/app/actions/lists'
import {notFound} from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {Calendar, User} from 'lucide-react'

interface PageProps {
	params: Promise<{ id: string }>
}

export default async function ListPage({params}: PageProps) {
	const {id} = await params
	const list = await getListDetails(id)

	if (!list) {
		notFound()
	}

	const formatDate = (value: string) =>
		new Intl.DateTimeFormat('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		}).format(new Date(value))

	return (
		<main className="min-h-screen bg-[#14181c] text-gray-100 p-4 md:p-8">
			<div className="mx-auto max-w-4xl space-y-8">
				<header className="space-y-4 border-b border-gray-800 pb-6">
					<div>
						<h1 className="text-3xl font-bold text-white mb-2">{list.title}</h1>
						{list.description && (
							<p className="text-gray-400 text-lg mb-4">{list.description}</p>
						)}
						<div className="flex items-center gap-4 text-sm text-gray-500">
							<Link
								href={`/u/${list.user.username}`}
								className="flex items-center gap-2 hover:text-orange-400 transition-colors"
							>
								<div
									className="relative h-6 w-6 overflow-hidden rounded-full bg-gray-800">
									{list.user.avatar_url ? (
										<Image
											src={list.user.avatar_url}
											alt={list.user.username || 'User'}
											fill
											className="object-cover"
										/>
									) : (
										<User size={16} className="m-1 text-gray-400"/>
									)}
								</div>
								<span>{list.user.full_name || list.user.username}</span>
							</Link>
							<span className="flex items-center gap-1">
								<Calendar size={14}/>
								{formatDate(list.created_at)}
							</span>
							<span
								className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
								{list.is_ranked ? 'Ranked List' : 'Collection'}
							</span>
						</div>
					</div>
				</header>

				<section className="space-y-4">
					{list.items.length === 0 ? (
						<div
							className="rounded-lg border border-gray-800 bg-[#1e232b] p-8 text-center text-gray-500">
							This list is empty.
						</div>
					) : (
						<div className="grid gap-4">
							{list.items.map((item, index) => (
								<div
									key={item.id}
									className="group relative flex flex-col sm:flex-row gap-4 rounded-lg border border-gray-800 bg-[#1e232b] p-4 transition hover:border-orange-500/30"
								>
									{/* Rank Number (for ranked lists) */}
									{list.is_ranked && (
										<div
											className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white sm:h-10 sm:w-10 sm:text-lg">
											{item.order ?? index + 1}
										</div>
									)}

									<div className="flex-1 space-y-2">
										<div className="flex justify-between items-start">
											<div>
												<h3 className="font-bold text-white text-lg">
													{item.cafe.name}
												</h3>
												<p className="text-sm text-gray-500">
													{item.cafe.address}
												</p>
											</div>
											{/* Could add a 'View Cafe' button here later */}
										</div>

										{item.note && (
											<div
												className="rounded bg-gray-900/50 p-3 text-sm italic text-gray-300 border-l-2 border-orange-500/50">
												{item.note}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</section>
			</div>
		</main>
	)
}
