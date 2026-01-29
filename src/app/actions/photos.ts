'use server'

import {createClient} from '@/utils/supabase/server'
import {CafePhoto} from '@/types/database'
import {revalidatePath} from 'next/cache'

export interface CafePhotoWithStats extends CafePhoto {
	like_count: number
	is_liked: boolean
	user: {
		username: string | null
		avatar_url: string | null
	}
}

export async function uploadCafePhoto(formData: FormData) {
	const supabase = await createClient()

	const {
		data: {user},
	} = await supabase.auth.getUser()

	if (!user) {
		throw new Error('You must be logged in to upload photos')
	}

	const cafeId = formData.get('cafe_id') as string
	const file = formData.get('file') as File
	const caption = formData.get('caption') as string

	if (!file || !cafeId) {
		throw new Error('Missing file or cafe ID')
	}

	// 1. Upload to Storage
	const fileExt = file.name.split('.').pop()
	const filePath = `${cafeId}/${user.id}-${Date.now()}.${fileExt}`

	const {error: uploadError} = await supabase.storage
		.from('cafe-photos')
		.upload(filePath, file)

	if (uploadError) {
		console.error('Error uploading photo:', uploadError)
		throw new Error('Failed to upload photo')
	}

	const {data: publicUrlData} = supabase.storage
		.from('cafe-photos')
		.getPublicUrl(filePath)

	// 2. Insert into DB
	const {error: dbError} = await supabase.from('cafe_photos').insert({
		cafe_id: cafeId,
		user_id: user.id,
		url: publicUrlData.publicUrl,
		caption: caption || null
	})

	if (dbError) {
		console.error('Error saving photo metadata:', dbError)
		throw new Error('Failed to save photo info')
	}

	revalidatePath(`/cafe/${cafeId}`)
}

export async function togglePhotoLike(photoId: string) {
	const supabase = await createClient()
	const {data: {user}} = await supabase.auth.getUser()

	if (!user) throw new Error('Must be logged in')

	// Check if already liked
	const {data: existingLike} = await supabase
		.from('photo_likes')
		.select('*')
		.eq('user_id', user.id)
		.eq('photo_id', photoId)
		.single()

	if (existingLike) {
		await supabase
			.from('photo_likes')
			.delete()
			.eq('user_id', user.id)
			.eq('photo_id', photoId)
	} else {
		await supabase
			.from('photo_likes')
			.insert({
				user_id: user.id,
				photo_id: photoId
			})
	}

	// We might not know the cafe_id easily here without an extra query, 
	// but we can rely on client to revalidate if needed, or fetch it.
	// For now, simple return.
}

export async function getCafePhotos(cafeId: string): Promise<CafePhotoWithStats[]> {
	const supabase = await createClient()
	const {data: {user}} = await supabase.auth.getUser()

	const {data, error} = await supabase
		.from('cafe_photos')
		.select(`
			*,
			profiles (username, avatar_url),
			photo_likes (user_id)
		`)
		.eq('cafe_id', cafeId)
		.order('created_at', {ascending: false})

	if (error) {
		console.error('Error fetching photos:', error)
		return []
	}

	// Calculate stats in JS (or use a view/RPC for better performance in large scale)
	return data.map((photo: any) => ({
		id: photo.id,
		cafe_id: photo.cafe_id,
		user_id: photo.user_id,
		url: photo.url,
		caption: photo.caption,
		created_at: photo.created_at,
		like_count: photo.photo_likes ? photo.photo_likes.length : 0,
		is_liked: user ? photo.photo_likes.some((like: any) => like.user_id === user.id) : false,
		user: {
			username: photo.profiles?.username || 'Unknown',
			avatar_url: photo.profiles?.avatar_url
		}
	})).sort((a, b) => b.like_count - a.like_count) // Sort by popularity
}

export async function getDynamicCoverPhoto(cafeId: string): Promise<string | null> {
	const supabase = await createClient()

	// Use the RPC we defined in SQL
	const {data, error} = await supabase.rpc('get_cafe_cover_photo', {
		target_cafe_id: cafeId
	})

	if (error) {
		console.error('Error fetching dynamic cover:', error)
		return null
	}

	return data as string | null
}
