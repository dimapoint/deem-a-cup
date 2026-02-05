/**
 * Safely parses a FormData entry value into a trimmed string.
 * Returns null if the value is not a string or is empty after trimming.
 *
 * @param value - The value from FormData.get()
 * @returns The trimmed string or null.
 */
export function parseString(value: FormDataEntryValue | null): string | null {
	if (typeof value !== 'string') return null
	const trimmed = value.trim()
	return trimmed || null
}

/**
 * Parses a FormData entry value into a finite number.
 * Returns null if the value is not a valid number.
 *
 * @param value - The value from FormData.get()
 * @returns The parsed number or null.
 */
export function parseNumber(value: FormDataEntryValue | null): number | null {
	const str = parseString(value)
	if (!str) return null
	const parsed = Number(str)
	return Number.isFinite(parsed) ? parsed : null
}

/**
 * Parses a currency string (e.g., "$12.50") into a finite number.
 * Removes non-numeric characters except for decimal points and signs.
 *
 * @param value - The value from FormData.get()
 * @returns The parsed numeric value or null.
 */
export function parseCurrency(value: FormDataEntryValue | null): number | null {
	if (typeof value !== 'string') return null
	const cleaned = value.trim().replace(/[^\d.-]/g, '')
	if (!cleaned) return null
	const parsed = Number(cleaned)
	return Number.isFinite(parsed) ? parsed : null
}

/**
 * Parses a JSON string representing an array of tags.
 * Filters out non-string or empty tags.
 *
 * @param value - The JSON string from FormData.get()
 * @returns An array of valid tag strings.
 */
export function parseTags(value: FormDataEntryValue | null): string[] {
	const str = parseString(value)
	if (!str) return []
	try {
		const parsed = JSON.parse(str)
		if (Array.isArray(parsed)) {
			return parsed.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
		}
	} catch (error) {
		console.error('Error parsing tags:', error)
	}
	return []
}
