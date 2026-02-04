export const formatDate = (value: string) => {
	const [datePart] = value.split('T')
	const [year, month, day] = datePart.split('-').map(Number)
	const date = year && month && day ? new Date(year, month - 1, day) : new Date(value)
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	}).format(date)
}

export const formatMonthYear = (value: string) => new Intl.DateTimeFormat('en-US', {
	month: 'short',
	year: 'numeric'
}).format(new Date(value))
