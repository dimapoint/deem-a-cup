'use server'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {createClient} from '@/utils/supabase/server'
import {headers} from 'next/headers'

export type ActionState = {
	error?: string
	notice?: string
	success?: boolean
} | null

export async function login(prevState: ActionState, formData: FormData): Promise<ActionState> {
	const supabase = await createClient()

	const email = formData.get('email') as string
	const password = formData.get('password') as string

	const {error} = await supabase.auth.signInWithPassword({
		email,
		password,
	})

	if (error) {
		console.error('Login error:', error)
		return { error: 'Could not authenticate user' }
	}

	revalidatePath('/', 'layout')
	redirect('/')
}

export async function signup(prevState: ActionState, formData: FormData): Promise<ActionState> {
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
		return { error: 'Could not create user' }
	}

	revalidatePath('/', 'layout')
	return { success: true, notice: 'You must confirm your email before logging in.' }
}
