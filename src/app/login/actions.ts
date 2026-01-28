'use server'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {createClient} from '@/utils/supabase/server'
import {headers} from 'next/headers'

export async function login(formData: FormData) {
	const supabase = await createClient()

	const email = formData.get('email') as string
	const password = formData.get('password') as string

	const {error} = await supabase.auth.signInWithPassword({
		email,
		password,
	})

	if (error) {
		console.error('Login error:', error)
		// For now, redirect to login with error param, or throw to be handled by error boundary
		redirect('/login?error=Could not authenticate user')
	}

	revalidatePath('/', 'layout')
	redirect('/')
}

export async function signup(formData: FormData) {
	const supabase = await createClient()

	// Get origin to construct callback URL correctly for any environment
	const origin = (await headers()).get('origin')

	const email = formData.get('email') as string
	const password = formData.get('password') as string

	const {error} = await supabase.auth.signUp({
		email,
		password,
		options: {
			emailRedirectTo: `${origin}/auth/callback`,
		},
	})

	if (error) {
		console.error('Signup error:', error)
		redirect('/login?error=Could not create user')
	}

	revalidatePath('/', 'layout')
	redirect('/login?notice=confirm-email')
}
