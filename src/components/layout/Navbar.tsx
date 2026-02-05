import {createClient} from '@/utils/supabase/server'
import {Logo} from './navbar/Logo'
import {NavLinks} from './navbar/NavLinks'

export default async function Navbar() {
	const supabase = await createClient()
	const {data: {user}} = await supabase.auth.getUser()

	return (
		<nav
			className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#14181c]/80 backdrop-blur-md">
			<div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
				<Logo/>
				<NavLinks user={user}/>
			</div>
		</nav>
	)
}
