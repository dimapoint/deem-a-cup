'use client'

import {useActionState} from 'react'
import {ActionState, login, signup} from './actions'

export function LoginForm({
	                          initialError,
	                          initialNotice,
                          }: {
	initialError?: string | null
	initialNotice?: string | null
}) {
	const [loginState, loginAction, isLoginPending] = useActionState<ActionState, FormData>(login, null)
	const [signupState, signupAction, isSignupPending] = useActionState<ActionState, FormData>(signup, null)

	const noticeMessage = signupState?.notice || initialNotice
	const errorMessage = loginState?.error || signupState?.error || initialError

	return (
		<form
			className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-gray-800 bg-gray-900 p-8 shadow-lg">
			<h1 className="mb-4 text-center text-2xl font-bold">Deem a Cup</h1>

			{noticeMessage ? (
				<div
					className="rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
					{noticeMessage}
				</div>
			) : null}
			{errorMessage ? (
				<div
					className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
					{errorMessage}
				</div>
			) : null}

			<div className="flex flex-col gap-2">
				<label htmlFor="email" className="text-sm font-medium text-gray-300">
					Email
				</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					className="rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
					placeholder="you@example.com"
				/>
			</div>

			<div className="flex flex-col gap-2">
				<label htmlFor="password" className="text-sm font-medium text-gray-300">
					Password
				</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					className="rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
					placeholder="••••••••"
				/>
			</div>

			<div className="mt-4 flex flex-col gap-3">
				<button
					formAction={loginAction}
					disabled={isLoginPending || isSignupPending}
					className="flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoginPending ? 'Signing In...' : 'Sign In'}
				</button>
				<button
					formAction={signupAction}
					disabled={isLoginPending || isSignupPending}
					className="flex items-center justify-center rounded-md border border-gray-700 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSignupPending ? 'Signing Up...' : 'Sign Up'}
				</button>
			</div>
		</form>
	)
}
