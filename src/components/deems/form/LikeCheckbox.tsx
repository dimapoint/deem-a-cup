'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'

export function LikeCheckbox() {
  const [liked, setLiked] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          name="liked"
          className="hidden"
          checked={liked}
          onChange={(e) => setLiked(e.target.checked)}
        />
        <Heart
          className={`w-6 h-6 transition-colors ${
            liked ? 'fill-orange-500 text-orange-500' : 'text-gray-400 group-hover:text-gray-600'
          }`}
        />
        <span className="text-sm font-medium select-none">Like</span>
      </label>
    </div>
  )
}
