import {beforeEach, describe, expect, it, vi} from 'vitest'
import {logCoffee} from '../deem'
import * as supabaseServer from '@/utils/supabase/server'

// Mock createClient
vi.mock('@/utils/supabase/server', () => ({
	createClient: vi.fn()
}))

// Mock revalidatePath
vi.mock('next/cache', () => ({
	revalidatePath: vi.fn()
}))

describe('logCoffee with Tags', () => {
	const mockSupabase = {
		from: vi.fn(),
		auth: {
			getUser: vi.fn()
		}
	}

	beforeEach(() => {
		(supabaseServer.createClient as any).mockResolvedValue(mockSupabase)

		// Mock successful auth
		mockSupabase.auth.getUser.mockResolvedValue({
			data: {user: {id: 'user-123'}}
		})
	})

	it('should save tags correctly', async () => {
		const mockInsert = vi.fn().mockResolvedValue({error: null})
		mockSupabase.from.mockReturnValue({insert: mockInsert})

		const formData = new FormData()
		formData.append('cafe_id', 'cafe-123')
		formData.append('rating', '4.5')
		formData.append('tags', JSON.stringify(['V60', 'Wifi', 'Cozy']))

		await logCoffee(formData)

		expect(mockSupabase.from).toHaveBeenCalledWith('deems')
		expect(mockInsert).toHaveBeenCalledWith({
			user_id: 'user-123',
			cafe_id: 'cafe-123',
			rating: 4.5,
			review: null,
			brew_method: null,
			bean_origin: null,
			roaster: null,
			tags: ['V60', 'Wifi', 'Cozy'],
			price: null,
			liked: false,
			visited_at: undefined
		})
	})

	it('should save technical tags correctly', async () => {
		const mockInsert = vi.fn().mockResolvedValue({error: null})
		mockSupabase.from.mockReturnValue({insert: mockInsert})

		const formData = new FormData()
		formData.append('cafe_id', 'cafe-123')
		formData.append('brew_method', 'V60')
		formData.append('bean_origin', 'Etiopía')
		formData.append('roaster', 'Fuego')

		await logCoffee(formData)

		expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
			brew_method: 'V60',
			bean_origin: 'Etiopía',
			roaster: 'Fuego'
		}))
	})

	it('should save price correctly', async () => {
		const mockInsert = vi.fn().mockResolvedValue({error: null})
		mockSupabase.from.mockReturnValue({insert: mockInsert})

		const formData = new FormData()
		formData.append('cafe_id', 'cafe-123')
		formData.append('price', '4500.50')

		await logCoffee(formData)

		expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
			price: 4500.50
		}))
	})

	it('should handle empty tags', async () => {
		const mockInsert = vi.fn().mockResolvedValue({error: null})
		mockSupabase.from.mockReturnValue({insert: mockInsert})

		const formData = new FormData()
		formData.append('cafe_id', 'cafe-123')
		// No tags appended or empty string/array

		await logCoffee(formData)

		expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
			tags: []
		}))
	})
})
