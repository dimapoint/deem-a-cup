'use client'

import { CalendarDays } from 'lucide-react'
import { formatDate } from '@/utils/date'

interface VisitDateInputProps {
  value: string
  onChange: (value: string) => void
  todayValue: string
  yesterdayValue: string
}

export function VisitDateInput({ value, onChange, todayValue, yesterdayValue }: VisitDateInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="visited_at" className="text-sm font-medium">Date</label>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <CalendarDays
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            id="visited_at"
            name="visited_at"
            type="date"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-200"
          />
        </div>
        <button
          type="button"
          onClick={() => onChange(todayValue)}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            value === todayValue
              ? 'border-orange-400 text-orange-600'
              : 'border-gray-300 text-gray-600 hover:border-gray-400'
          }`}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onChange(yesterdayValue)}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            value === yesterdayValue
              ? 'border-orange-400 text-orange-600'
              : 'border-gray-300 text-gray-600 hover:border-gray-400'
          }`}
        >
          Yesterday
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Selected: <span className="font-medium text-gray-700">{formatDate(value) || 'Pick a date'}</span>
      </p>
    </div>
  )
}
