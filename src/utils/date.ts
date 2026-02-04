/**
 * Formats a date string into a human-readable format (e.g., "Jan 1, 2023").
 * Handles ISO strings by extracting the date part to avoid timezone issues.
 *
 * @param value - The date string to format (e.g., "2023-01-01T00:00:00Z" or "2023-01-01").
 * @returns The formatted date string.
 */
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

/**
 * Formats a date string into a month and year format (e.g., "Jan 2023").
 *
 * @param value - The date string to format.
 * @returns The formatted month and year string.
 */
export const formatMonthYear = (value: string) => new Intl.DateTimeFormat('en-US', {
	month: 'short',
	year: 'numeric'
}).format(new Date(value))
