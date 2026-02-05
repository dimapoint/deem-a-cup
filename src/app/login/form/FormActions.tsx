interface FormActionsProps {
  loginAction: (payload: FormData) => void
  signupAction: (payload: FormData) => void
  isLoginPending: boolean
  isSignupPending: boolean
}

export function FormActions({ loginAction, signupAction, isLoginPending, isSignupPending }: FormActionsProps) {
  return (
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
  )
}
