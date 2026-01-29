'use server'

import { createClient } from '@/utils/supabase/server'

export type UserStats = {
	totalDeems: number
	thisYearCount: number
	ratingDistribution: Record<string, number> // "1": 5, "1.5": 2...
	dayDistribution: Record<string, number> // "Monday": 4, "Tuesday": 1...
	mostActiveDay: string
}

export async function getUserStats(userId: string): Promise<UserStats> {
	const supabase = await createClient()

	// Fetch necessary fields to calculate stats
	// We don't need the full object, just rating and visited_at
	const { data: deems, error } = await supabase
		.from('deems')
		.select('rating, visited_at')
		.eq('user_id', userId)

	if (error) {
		console.error('Error fetching user stats:', error)
		return {
			totalDeems: 0,
			thisYearCount: 0,
			ratingDistribution: {},
			dayDistribution: {},
			mostActiveDay: 'N/A',
		}
	}

	const now = new Date()
	const currentYear = now.getFullYear()

	let thisYearCount = 0
	const ratingDistribution: Record<string, number> = {}
	const dayDistribution: Record<string, number> = {
		Sunday: 0,
		Monday: 0,
		Tuesday: 0,
		Wednesday: 0,
		Thursday: 0,
		Friday: 0,
		Saturday: 0,
	}

	// Initialize rating buckets (0.5 to 5.0)
	for (let i = 1; i <= 10; i++) {
		const r = i / 2
		ratingDistribution[r.toString()] = 0
	}
    // Also handle 0 if allowed, though typically 1-5 or 0.5-5. Schema says >=0.

	deems.forEach((deem) => {
		const visitedAt = new Date(deem.visited_at)
		
		// 1. This Year Count
		if (visitedAt.getFullYear() === currentYear) {
			thisYearCount++
		}

		// 2. Rating Distribution
		if (deem.rating !== null) {
            // Ensure key exists (e.g. if rating is 3, key is "3")
			const key = deem.rating.toString()
            if (ratingDistribution[key] !== undefined) {
			    ratingDistribution[key]++
            } else {
                ratingDistribution[key] = 1
            }
		}

		// 3. Day Distribution
		const dayName = visitedAt.toLocaleDateString('en-US', { weekday: 'long' })
		if (dayDistribution[dayName] !== undefined) {
			dayDistribution[dayName]++
		}
	})

	// Find most active day
	let mostActiveDay = 'N/A'
	let maxCount = -1

	Object.entries(dayDistribution).forEach(([day, count]) => {
		if (count > maxCount) {
			maxCount = count
			mostActiveDay = day
		}
	})
    
    // If no visits, keep N/A
    if (maxCount === 0) mostActiveDay = 'None yet'

	return {
		totalDeems: deems.length,
		thisYearCount,
		ratingDistribution,
		dayDistribution,
		mostActiveDay,
	}
}
