import Link from 'next/link'
import {Home, LogOut, User as UserIcon, Users} from 'lucide-react'
import {logout} from '@/app/actions/auth'
import type {User} from '@supabase/supabase-js'
import {NotificationBell} from './NotificationBell'

interface NavLinksProps {
	user: User | null
	unreadCount?: number
}

export function NavLinks({user, unreadCount = 0}: NavLinksProps) {
	return (
		<div className="flex items-center gap-6">
			<Link href="/" className="text-gray-400 hover:text-white transition-colors"
			      title="Home">
				<Home className="h-5 w-5"/>
			</Link>

			{user ? (
				<>
					<Link href="/feed"
					      className="text-gray-400 hover:text-white transition-colors"
					      title="Following">
						<Users className="h-5 w-5"/>
					</Link>
					<NotificationBell unreadCount={unreadCount}/>
					<Link href="/profile"
					      className="text-gray-400 hover:text-white transition-colors"
					      title="Profile">
						<UserIcon className="h-5 w-5"/>
					</Link>
					<form action={logout}>
						<button
							type="submit"
							className="text-gray-400 hover:text-white transition-colors"
							title="Logout"
							aria-label="Logout"
						>
							<LogOut className="h-5 w-5"/>
						</button>
					</form>
				</>
			) : (
				<Link href="/login"
				      className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
					Login
				</Link>
			)}
		</div>
	)
}
