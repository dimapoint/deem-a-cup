'use client'

import {useActionState} from 'react'
import {ActionState, login, signup} from './actions'
import {FormHeader} from './form/FormHeader'
import {FormMessages} from './form/FormMessages'
import {EmailInput} from './form/EmailInput'
import {PasswordInput} from './form/PasswordInput'
import {FormActions} from './form/FormActions'

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
			<FormHeader/>
			<FormMessages noticeMessage={noticeMessage} errorMessage={errorMessage}/>
			<EmailInput/>
			<PasswordInput/>
			<FormActions
				loginAction={loginAction}
				signupAction={signupAction}
				isLoginPending={isLoginPending}
				isSignupPending={isSignupPending}
			/>
		</form>
	)
}
