import Image from 'next/image'
import {Calendar, Link2, User} from 'lucide-react'
import {ProfileRow} from '@/types/profile'
import {ReactNode} from 'react'

interface ProfileHeaderProps {
	profile: ProfileRow
	displayName: string
	memberSince?: string
	websiteUrl: string | null
	children?: ReactNode
}

export function ProfileHeader({
	                              profile,
	                              displayName,
	                              memberSince,
	                              websiteUrl,
	                              children
                              }: ProfileHeaderProps) {
	return (
		<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div className="flex items-center gap-4">
				<div
					className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-gray-700 bg-gray-800">
					{profile.avatar_url ? (
						<Image
							src={profile.avatar_url}
							alt={displayName}
							fill
							sizes="80px"
							className="object-cover"
						/>
					) : (
						<User size={28} className="text-gray-400"/>
					)}
				</div>
				<div>
					<div className="flex flex-wrap items-center gap-2">
						<h1 className="text-3xl font-bold text-white">{displayName}</h1>
						{profile.username && (
							<span className="text-sm text-gray-500">@{profile.username}</span>
						)}
					</div>

					{children}

					<div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
						{memberSince && (
							<span className="flex items-center gap-1">
								<Calendar size={14}/>
								Member since {memberSince}
							</span>
						)}
						{websiteUrl && (
							<a
								href={websiteUrl}
								target="_blank"
								rel="noreferrer"
								className="flex items-center gap-1 text-orange-400 hover:text-orange-300"
							>
								<Link2 size={14}/>
								{profile.website}
							</a>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
