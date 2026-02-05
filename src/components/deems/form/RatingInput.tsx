'use client'

import type { CSSProperties } from 'react'

interface RatingInputProps {
  rating: number
  hoverRating: number
  onRatingChange: (rating: number) => void
  onHoverChange: (rating: number) => void
}

const cupClassName = 'absolute inset-0 flex items-center justify-center text-2xl leading-none'
const halfClipStyle: CSSProperties = { clipPath: 'inset(0 50% 0 0)' }

export function RatingInput({ rating, hoverRating, onRatingChange, onHoverChange }: RatingInputProps) {
  const displayRating = hoverRating > 0 ? hoverRating : rating

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">Rating</label>
      <div className="flex gap-1" onMouseLeave={() => onHoverChange(0)}>
        {[0, 1, 2, 3, 4].map((index) => {
          const filled = displayRating >= index + 1
          const halfFilled = displayRating >= index + 0.5 && !filled

          return (
            <div key={index} className="relative cursor-pointer w-8 h-8">
              {/* Left half (0.5) */}
              <div
                data-testid={`coffee-${index}-half`}
                className="absolute left-0 top-0 w-1/2 h-full z-10"
                onClick={() => onRatingChange(index + 0.5)}
                onMouseEnter={() => onHoverChange(index + 0.5)}
              />
              {/* Right half (1.0) */}
              <div
                data-testid={`coffee-${index}-full`}
                className="absolute right-0 top-0 w-1/2 h-full left-1/2 z-10"
                onClick={() => onRatingChange(index + 1)}
                onMouseEnter={() => onHoverChange(index + 1)}
              />

              {/* Icon rendering */}
              <div className="absolute inset-0 pointer-events-none">
                <span className={`${cupClassName} opacity-30`} aria-hidden="true">☕</span>
                {filled ? (
                  <span className={cupClassName} aria-hidden="true">☕</span>
                ) : halfFilled ? (
                  <span className={cupClassName} style={halfClipStyle} aria-hidden="true">☕</span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
      <div className="text-sm text-gray-500 h-5 font-medium">
        {displayRating > 0 ? displayRating : 'Rate this cafe'}
      </div>
      <input type="hidden" name="rating" value={rating} />
    </div>
  )
}
