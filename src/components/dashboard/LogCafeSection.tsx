import { Coffee, Store } from 'lucide-react'
import CafeSearch from '@/components/cafes/CafeSearch'

interface LogCafeSectionProps {
  onCafeSelect: (placeId: string, name: string, address: string) => void
  onAddCustomCafe: () => void
}

export function LogCafeSection({ onCafeSelect, onAddCustomCafe }: LogCafeSectionProps) {
  return (
    <section className="rounded-xl border border-gray-800 bg-[#1e232b] p-4 md:p-5 mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500">
            <Coffee size={14} />
            <span>Log a cafe</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Search for a cafe or add a custom spot to log your visit.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <div className="grow">
          <CafeSearch
            onSelect={onCafeSelect}
            className="max-w-none mx-0 mb-0"
          />
        </div>
        <button
          onClick={onAddCustomCafe}
          className="bg-[#14181c] hover:bg-[#1b2027] border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 h-10.5 whitespace-nowrap"
        >
          <Store size={16} />
          Add Custom Cafe
        </button>
      </div>
    </section>
  )
}
