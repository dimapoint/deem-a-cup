'use server'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {createClient} from '@/utils/supabase/server'

/**
 * Logs out the current user by signing out from Supabase and clearing the session.
 * Redirects to the home page on success or to the login page with an error message on failure.
 *
 * @throws {Error} Redirects the user, which Next.js handles by throwing a special error.
 * @returns {Promise<void>}
 */
export async function logout() {
	const supabase = await createClient()

	const {error} = await supabase.auth.signOut()

	if (error) {
		console.error('Logout error:', error)
		redirect('/login?error=Could not log out')
	}

	revalidatePath('/', 'layout')
	redirect('/')
}
