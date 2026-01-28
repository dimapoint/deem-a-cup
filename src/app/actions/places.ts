'use server'

export interface PlacePrediction {
	placeId: string
	mainText: string
	secondaryText: string
}

interface NewPlacePrediction {
	placeId?: string
	structuredFormat?: {
		mainText?: {text?: string}
		secondaryText?: {text?: string}
	}
	text?: {text?: string}
}

interface NewAutocompleteSuggestion {
	placePrediction?: NewPlacePrediction
}

interface NewAutocompleteResponse {
	suggestions?: NewAutocompleteSuggestion[]
}

interface LegacyPlacePrediction {
	place_id: string
	description: string
	structured_formatting?: {
		main_text?: string
		secondary_text?: string
	}
	types?: string[]
}

interface LegacyAutocompleteResponse {
	status?: string
	predictions?: LegacyPlacePrediction[]
	error_message?: string
}

const allowedPlaceTypes = new Set(['cafe', 'bakery', 'restaurant', 'food'])
let isNewPlacesApiAvailable = true

const normalizeNewPrediction = (prediction: NewPlacePrediction): PlacePrediction | null => {
	if (!prediction.placeId) return null
	const mainText =
		prediction.structuredFormat?.mainText?.text ??
		prediction.text?.text ??
		''
	if (!mainText) return null

	return {
		placeId: prediction.placeId,
		mainText,
		secondaryText: prediction.structuredFormat?.secondaryText?.text ?? '',
	}
}

const normalizeLegacyPrediction = (prediction: LegacyPlacePrediction): PlacePrediction | null => {
	if (!prediction.place_id) return null
	const mainText =
		prediction.structured_formatting?.main_text ??
		prediction.description ??
		''
	if (!mainText) return null

	return {
		placeId: prediction.place_id,
		mainText,
		secondaryText: prediction.structured_formatting?.secondary_text ?? '',
	}
}

const fetchNewAutocomplete = async (query: string, apiKey: string): Promise<PlacePrediction[] | null> => {
	if (!isNewPlacesApiAvailable) return null

	try {
		const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Goog-Api-Key': apiKey,
				'X-Goog-FieldMask': [
					'suggestions.placePrediction.placeId',
					'suggestions.placePrediction.text',
					'suggestions.placePrediction.structuredFormat.mainText',
					'suggestions.placePrediction.structuredFormat.secondaryText',
				].join(','),
			},
			body: JSON.stringify({
				input: query,
				includedPrimaryTypes: Array.from(allowedPlaceTypes),
			}),
		})

		if (!response.ok) {
			const errorText = await response.text()
			console.error('Places API (new) error:', errorText)
			if (errorText.includes('SERVICE_DISABLED') || errorText.includes('Places API (New)')) {
				isNewPlacesApiAvailable = false
			}
			return null
		}

		const data = await response.json() as NewAutocompleteResponse
		const suggestions = Array.isArray(data.suggestions) ? data.suggestions : []

		return suggestions
			.map((suggestion) => suggestion.placePrediction)
			.filter((prediction): prediction is NewPlacePrediction => Boolean(prediction))
			.map((prediction) => normalizeNewPrediction(prediction))
			.filter((prediction): prediction is PlacePrediction => Boolean(prediction))
	} catch (error) {
		console.error('Failed to search places (new):', error)
		return null
	}
}

const fetchLegacyAutocomplete = async (query: string, apiKey: string): Promise<PlacePrediction[]> => {
	try {
		const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json')
		url.searchParams.set('input', query)
		url.searchParams.set('types', 'establishment')
		url.searchParams.set('key', apiKey)

		const response = await fetch(url.toString())
		if (!response.ok) {
			console.error('Places API (legacy) error:', await response.text())
			return []
		}

		const data = await response.json() as LegacyAutocompleteResponse
		const predictions = Array.isArray(data.predictions) ? data.predictions : []

		if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
			console.error('Places API (legacy) error:', data.status, data.error_message ?? '')
			return []
		}

		const filtered = predictions.filter((prediction) => {
			const types = Array.isArray(prediction.types) ? prediction.types : []
			return types.some((type) => allowedPlaceTypes.has(type))
		})

		const candidates = filtered.length > 0 ? filtered : predictions

		return candidates
			.map((prediction) => normalizeLegacyPrediction(prediction))
			.filter((prediction): prediction is PlacePrediction => Boolean(prediction))
	} catch (error) {
		console.error('Failed to search places (legacy):', error)
		return []
	}
}

export async function searchPlaces(query: string): Promise<PlacePrediction[]> {
	const normalizedQuery = query.trim()
	if (!normalizedQuery || normalizedQuery.length < 3) return []

	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
	if (!apiKey) {
		console.error('Missing Google Maps API Key')
		return []
	}

	const newResults = await fetchNewAutocomplete(normalizedQuery, apiKey)
	if (newResults !== null) {
		return newResults
	}

	return fetchLegacyAutocomplete(normalizedQuery, apiKey)
}
