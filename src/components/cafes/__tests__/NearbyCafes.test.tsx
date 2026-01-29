import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen, waitFor} from '@testing-library/react'
import {NearbyCafes} from '../NearbyCafes'
import * as nearbyActions from '@/app/actions/nearby'

// Mock the action
vi.mock('@/app/actions/nearby', () => ({
	getNearbyPopularCafes: vi.fn(),
}))

describe('NearbyCafes', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		// Mock navigator.geolocation
		const mockGeolocation = {
			getCurrentPosition: vi.fn().mockImplementation((success) => {
				success({
					coords: {
						latitude: 40.7128,
						longitude: -74.0060,
					},
				})
			}),
			watchPosition: vi.fn(),
		}
		Object.defineProperty(global.navigator, 'geolocation', {
			value: mockGeolocation,
			writable: true
		})
	})

	it('renders popular cafes when location is available', async () => {
		const mockCafes: nearbyActions.PopularCafe[] = [
			{
				id: '1',
				name: 'Test Cafe',
				address: '123 Test St',
				visit_count: 5,
				avg_rating: 4.5,
				distance_km: 1.2,
				place_id: 'abc',
				cover_image: null,
				created_at: '2023-01-01',
				latitude: 40.7128,
				longitude: -74.0060
			}
		];

		(nearbyActions.getNearbyPopularCafes as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockCafes)
		render(<NearbyCafes onSelect={() => {
		}}/>)

		// It might take a moment to render content after useEffect
		await waitFor(() => {
			expect(screen.getByText('Popular Near You')).toBeInTheDocument()
			expect(screen.getByText('Test Cafe')).toBeInTheDocument()
			expect(screen.getByText('1.2 km')).toBeInTheDocument()
		})
	})

	it('does not render if no cafes found', async () => {
		(nearbyActions.getNearbyPopularCafes as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([])

		const {container} = render(<NearbyCafes onSelect={() => {
		}}/>)

		await waitFor(() => {
			// Should be empty (return null)
			expect(container).toBeEmptyDOMElement()
		})
	})
})
