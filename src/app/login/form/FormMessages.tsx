interface FormMessagesProps {
	noticeMessage?: string | null
	errorMessage?: string | null
}

export function FormMessages({noticeMessage, errorMessage}: FormMessagesProps) {
	return (
		<>
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
		</>
	)
}
