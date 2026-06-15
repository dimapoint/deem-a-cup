import {User} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type {DeemCommentWithAuthor} from '@/app/actions/comments'
import {formatRelativeTime} from '@/utils/date'

/**
 * A single comment under a deem: small avatar, author name, relative time and
 * the comment body.
 */
export function CommentItem({comment}: {comment: DeemCommentWithAuthor}) {
	const {author} = comment
	const profileUrl = author?.username ? `/u/${author.username}` : null
	const name = author?.full_name || author?.username || 'Anonymous'

	const avatar = (
		<div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600 shrink-0">
			{author?.avatar_url ? (
				<Image
					src={author.avatar_url}
					alt={name}
					width={28}
					height={28}
					className="w-full h-full object-cover"
				/>
			) : (
				<User size={14} className="text-gray-400" />
			)}
		</div>
	)

	return (
		<div className="flex items-start gap-2.5">
			{profileUrl ? <Link href={profileUrl}>{avatar}</Link> : avatar}

			<div className="min-w-0 flex-1">
				<div className="flex items-baseline gap-2">
					{profileUrl ? (
						<Link
							href={profileUrl}
							className="text-xs font-bold text-gray-200 hover:text-orange-400 transition-colors"
						>
							{name}
						</Link>
					) : (
						<span className="text-xs font-bold text-gray-200">{name}</span>
					)}
					<time
						className="text-[11px] text-gray-600 tabular-nums"
						dateTime={comment.created_at}
					>
						{formatRelativeTime(comment.created_at)}
					</time>
				</div>
				<p className="text-sm text-gray-300 leading-snug break-words">
					{comment.content}
				</p>
			</div>
		</div>
	)
}
