import Link from 'next/link'
import {Home, LogOut, User as UserIcon} from 'lucide-react'
import {logout} from '@/app/actions/auth'
import type {User} from '@supabase/supabase-js'

interface NavLinksProps {
	user: User | null
}

export function NavLinks({user}: NavLinksProps) {
	return (
		<div className="flex items-center gap-6">
			<Link href="/" className="text-gray-400 hover:text-white transition-colors"
			      title="Home">
				<Home className="h-5 w-5"/>
			</Link>

			{user ? (
				<>
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
