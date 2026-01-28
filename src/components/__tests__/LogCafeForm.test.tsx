import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LogCafeForm from '../LogCafeForm'
import {logCoffee} from '@/app/actions/deem'

// Mock server action
vi.mock('@/app/actions/deem', () => ({
	logCoffee: vi.fn(() => Promise.resolve())
}))

// Mock useFormStatus
vi.mock('react-dom', async () => {
	const actual = await vi.importActual('react-dom')
	return {
		...actual,
		useFormStatus: () => ({pending: false})
	}
})

describe('LogCafeForm Component', () => {
	beforeEach(() => {
		vi.mocked(logCoffee).mockClear()
	})

	it('renders correctly', () => {
		render(<LogCafeForm cafeId="123" cafeName="Test Cafe"/>)
		expect(screen.getByText('Log visit: Test Cafe')).toBeDefined()
		expect(screen.getByLabelText('Date')).toBeDefined()
		expect(screen.getByLabelText('Review')).toBeDefined()
		expect(screen.getByLabelText('Like')).toBeDefined()
	})

	it('submits the form with correct data', async () => {
		const user = userEvent.setup()
		render(<LogCafeForm cafeId="123" cafeName="Test Cafe"/>)

		// Select Rating (3 coffees)
		const coffee3 = screen.getByTestId('coffee-2-full')
		await user.click(coffee3)

		// Select Date
		const dateInput = screen.getByLabelText('Date')
		await user.clear(dateInput)
		await user.type(dateInput, '2025-01-15')

		// Fill Review
		const reviewInput = screen.getByLabelText('Review')
		await user.type(reviewInput, 'Nice place!')

		// Check Liked
		const likedCheckbox = screen.getByLabelText('Like')
		await user.click(likedCheckbox)

		// Submit
		const submitButton = screen.getByText('Guardar')
		await user.click(submitButton)

		// Check if logCoffee called
		await waitFor(() => {
			expect(logCoffee).toHaveBeenCalled()
		})

		const formData = vi.mocked(logCoffee).mock.calls[0][0] as FormData
		expect(formData.get('cafe_id')).toBe('123')
		expect(formData.get('rating')).toBe('3')
		expect(formData.get('visited_at')).toBe('2025-01-15')
		expect(formData.get('review')).toBe('Nice place!')
		expect(formData.get('liked')).toBe('on')
	})
})
