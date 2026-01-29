import {beforeEach, describe, expect, it, vi} from 'vitest'
import {getNearbyPopularCafes} from '../nearby'
import * as supabaseServer from '@/utils/supabase/server'

// Mock createClient
vi.mock('@/utils/supabase/server', () => ({
	createClient: vi.fn()
}))

describe('getNearbyPopularCafes', () => {
	const mockSupabase = {
		rpc: vi.fn(),
		from: vi.fn(),
	}

	beforeEach(() => {
		(supabaseServer.createClient as any).mockResolvedValue(mockSupabase)
	})

	it('should return data from RPC if successful', async () => {
		const mockData = [{id: '1', name: 'Cafe RPC', visit_count: 10}]
		mockSupabase.rpc.mockResolvedValue({data: mockData, error: null})

		const result = await getNearbyPopularCafes(40, -74)
		expect(result).toEqual(mockData)
		expect(mockSupabase.rpc).toHaveBeenCalledWith('get_popular_nearby_cafes', {
			user_lat: 40,
			user_lng: -74,
			radius_km: 20
		})
	})

	it('should use fallback if RPC returns PGRST202', async () => {
		// RPC fails with function not found
		mockSupabase.rpc.mockResolvedValue({data: null, error: {code: 'PGRST202'}})

		// Mock fallback chain
		const mockFrom = vi.fn()
		const mockSelect = vi.fn()
		const mockNot = vi.fn()
		const mockGte = vi.fn()
		const mockLte = vi.fn()

		mockSupabase.from.mockReturnValue({
			select: mockSelect
		})

		// Setup generic chainable mock
		const createChain = (returnData: any) => {
			const chain = {
				select: vi.fn().mockReturnThis(),
				not: vi.fn().mockReturnThis(),
				gte: vi.fn().mockReturnThis(),
				lte: vi.fn().mockReturnThis(),
				in: vi.fn().mockReturnThis(),
				then: (resolve: any) => resolve(returnData)
			}
			return chain
		}

		// Mock cafes query
		mockSupabase.from.mockImplementation((table: string) => {
			if (table === 'cafes') {
				return createChain({
					data: [
						{id: '1', name: 'Fallback Cafe', latitude: 40.01, longitude: -74.01}
					],
					error: null
				})
			}
			if (table === 'deems') {
				return createChain({
					data: [
						{cafe_id: '1', rating: 5}
					],
					error: null
				})
			}
			return createChain({data: [], error: null})
		})

		const result = await getNearbyPopularCafes(40, -74)

		expect(result).toHaveLength(1)
		expect(result[0].name).toBe('Fallback Cafe')
		expect(result[0].visit_count).toBe(1) // 1 deem
	})

	it('should return empty if RPC fails with other error', async () => {
		mockSupabase.rpc.mockResolvedValue({data: null, error: {code: 'SOME_OTHER_ERROR'}})

		const result = await getNearbyPopularCafes(40, -74)
		expect(result).toEqual([])
	})
})
