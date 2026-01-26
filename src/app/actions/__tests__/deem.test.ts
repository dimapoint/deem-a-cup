import {beforeEach, describe, expect, it, vi} from 'vitest'
import {logCoffee} from '../deem'
import {revalidatePath} from 'next/cache'

// Mock next/cache
vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}))

// Mock supabase client
const mockInsert = vi.fn()
const mockFrom = vi.fn(() => ({
	insert: mockInsert,
}))
const mockGetUser = vi.fn()
const mockAuth = {
	getUser: mockGetUser,
}
const mockSupabase = {
	auth: mockAuth,
	from: mockFrom,
}

vi.mock('@/utils/supabase/server', () => ({
	createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

describe('logCoffee Server Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockInsert.mockResolvedValue({error: null})
		mockGetUser.mockResolvedValue({data: {user: {id: 'user-123'}}, error: null})
	})

	it('should log coffee successfully', async () => {
		const formData = new FormData()
		formData.append('cafe_id', 'cafe-1')
		formData.append('rating', '5')
		formData.append('review', 'Great coffee!')
		formData.append('liked', 'on')

		await logCoffee(formData)

		expect(mockGetUser).toHaveBeenCalled()
		expect(mockFrom).toHaveBeenCalledWith('deems')
		expect(mockInsert).toHaveBeenCalledWith({
			user_id: 'user-123',
			cafe_id: 'cafe-1',
			rating: 5,
			review: 'Great coffee!',
			liked: true,
			visited_at: undefined,
		})
		expect(revalidatePath).toHaveBeenCalledWith('/')
	})

	it('should throw error if user is not logged in', async () => {
		mockGetUser.mockResolvedValueOnce({data: {user: null}, error: null})

		const formData = new FormData()
		formData.append('cafe_id', 'cafe-1')

		await expect(logCoffee(formData)).rejects.toThrow('Debes iniciar sesión para loguear una visita')
	})

	it('should throw error if db insert fails', async () => {
		mockInsert.mockResolvedValueOnce({error: {message: 'DB Error'}})

		const formData = new FormData()
		formData.append('cafe_id', 'cafe-1')

		await expect(logCoffee(formData)).rejects.toThrow('Error al guardar la visita')
	})
})
