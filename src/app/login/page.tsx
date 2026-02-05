import {LoginForm} from './LoginForm'

type LoginPageProps = {
	searchParams: Promise<{
		error?: string | string[]
		notice?: string | string[]
	}>
}

const LoginPage = async (props: LoginPageProps) => {
	const searchParams = await props.searchParams
	const getParamValue = (value?: string | string[]) =>
		Array.isArray(value) ? value[0] : value

	const noticeParam = getParamValue(searchParams?.notice)
	const errorParam = getParamValue(searchParams?.error)
	const noticeMessage =
		noticeParam === 'confirm-email'
			? 'You must confirm your email before logging in.'
			: noticeParam
	const errorMessage = errorParam ?? null

	return (
		<div
			className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-4 text-white">
			<LoginForm initialError={errorMessage} initialNotice={noticeMessage}/>
		</div>
	)
}

export default LoginPage
