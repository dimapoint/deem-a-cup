
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadCafePhoto, togglePhotoLike, getCafePhotos, getDynamicCoverPhoto } from '../photos'
import * as supabaseServer from '@/utils/supabase/server'

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn()
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

describe('Photo Actions', () => {
  const mockSupabase = {
    storage: {
        from: vi.fn().mockReturnValue({
            upload: vi.fn(),
            getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'http://test.com/photo.jpg' } })
        })
    },
    from: vi.fn(),
    auth: {
        getUser: vi.fn()
    },
    rpc: vi.fn()
  }

  beforeEach(() => {
    (supabaseServer.createClient as any).mockResolvedValue(mockSupabase)
    
    // Default auth mock
    mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } }
    })
  })

  describe('uploadCafePhoto', () => {
      it('should upload file and insert record', async () => {
          const mockInsert = vi.fn().mockResolvedValue({ error: null })
          mockSupabase.from.mockReturnValue({ insert: mockInsert })
          
          const mockUpload = vi.fn().mockResolvedValue({ error: null })
          mockSupabase.storage.from().upload = mockUpload

          const formData = new FormData()
          formData.append('cafe_id', 'cafe-123')
          formData.append('file', new File([''], 'test.jpg', { type: 'image/jpeg' }))
          formData.append('caption', 'Nice!')

          await uploadCafePhoto(formData)

          expect(mockUpload).toHaveBeenCalled()
          expect(mockInsert).toHaveBeenCalledWith({
              cafe_id: 'cafe-123',
              user_id: 'user-123',
              url: 'http://test.com/photo.jpg',
              caption: 'Nice!'
          })
      })
  })

  describe('togglePhotoLike', () => {
      it('should insert like if not exists', async () => {
          // Mock no existing like
          const mockSelect = vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                      single: vi.fn().mockResolvedValue({ data: null })
                  })
              })
          })
          const mockInsert = vi.fn().mockResolvedValue({ error: null })
          
          mockSupabase.from.mockImplementation((table) => {
              if (table === 'photo_likes') {
                  return {
                      select: mockSelect,
                      insert: mockInsert,
                      delete: vi.fn()
                  }
              }
              return {}
          })

          await togglePhotoLike('photo-123')
          expect(mockInsert).toHaveBeenCalledWith({
              user_id: 'user-123',
              photo_id: 'photo-123'
          })
      })
  })
  
  describe('getDynamicCoverPhoto', () => {
      it('should call RPC', async () => {
          mockSupabase.rpc.mockResolvedValue({ data: 'http://cover.jpg', error: null })
          
          const result = await getDynamicCoverPhoto('cafe-123')
          
          expect(result).toBe('http://cover.jpg')
          expect(mockSupabase.rpc).toHaveBeenCalledWith('get_cafe_cover_photo', {
              target_cafe_id: 'cafe-123'
          })
      })
  })
})
