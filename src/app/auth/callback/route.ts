import {NextResponse} from 'next/server'
import {createClient} from '@/utils/supabase/server'

/**
 * Handles the OAuth callback from Supabase Auth.
 * Exchanges the authorization code for a session and redirects the user.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<NextResponse>} The response redirecting the user.
 */
export async function GET(request: Request): Promise<NextResponse> {
	const {searchParams, origin} = new URL(request.url)
	const code = searchParams.get('code')
	// Default to root if the 'next' param is missing
	const next = searchParams.get('next') ?? '/'

	if (code) {
		const supabase = await createClient()
		const {error} = await supabase.auth.exchangeCodeForSession(code)

		if (!error) {
			// Successful authentication, redirect to the intended page
			return NextResponse.redirect(`${origin}${next}`)
		}

		// Log the error for debugging purposes
		console.error('Auth callback error:', error)
	}

	// Redirect to the error page if code is missing or exchange failed
	return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
