import {login, signup} from './actions'

export default function LoginPage() {
	return (
		<div
			className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-4 text-white">
			<form
				className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-gray-800 bg-gray-900 p-8 shadow-lg">
				<h1 className="mb-4 text-center text-2xl font-bold">Deem a Cup</h1>

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
						formAction={login}
						className="flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
					>
						Sign In
					</button>
					<button
						formAction={signup}
						className="flex items-center justify-center rounded-md border border-gray-700 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
					>
						Sign Up
					</button>
				</div>
			</form>
		</div>
	)
}
