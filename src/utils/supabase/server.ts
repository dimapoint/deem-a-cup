import {createServerClient} from '@supabase/ssr'
import {cookies} from 'next/headers'

export async function createClient() {
	const cookieStore = await cookies()
	const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!supabaseURL || !supabaseAnonKey) {
		throw new Error('Missing Supabase environment variables')
	}
	return createServerClient(
		supabaseURL,
		supabaseAnonKey,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll()
				},
				setAll: function (cookiesToSet) {
					try {
						cookiesToSet.forEach(({name, value, options}) =>
							cookieStore.set(name, value, options)
						)
					} catch {
					}
				},
			},
		}
	)
}
