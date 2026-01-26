'use server'

export interface PlacePrediction {
	placeId: string
	mainText: string
	secondaryText: string
}

export async function searchPlaces(query: string): Promise<PlacePrediction[]> {
	if (!query || query.length < 3) return []

	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
	if (!apiKey) {
		console.error('Missing Google Maps API Key')
		return []
	}

	try {
		const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Goog-Api-Key': apiKey,
			},
			body: JSON.stringify({
				input: query,
				includedPrimaryTypes: ['cafe', 'bakery', 'restaurant', 'food'],
			})
		})

		if (!response.ok) {
			console.error('Places API error:', await response.text())
			return []
		}

		const data = await response.json()

		return (data.suggestions || []).map((s: any) => ({
			placeId: s.placePrediction.placeId,
			mainText: s.placePrediction.structuredFormat.mainText.text,
			secondaryText: s.placePrediction.structuredFormat.secondaryText?.text || ''
		}))
	} catch (error) {
		console.error('Failed to search places:', error)
		return []
	}
}
