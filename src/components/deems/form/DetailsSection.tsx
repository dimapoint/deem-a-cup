'use client'

import { useState } from 'react'

const BREW_METHODS = ['Espresso', 'Flat White', 'V60', 'Chemex', 'Cold Brew', 'Aeropress']
const BEAN_ORIGINS = ['Colombia', 'Etiopía', 'Brasil', 'Blend de la casa']

export function DetailsSection() {
  const [showDetails, setShowDetails] = useState(false)
  const [brewMethod, setBrewMethod] = useState('')
  const [beanOrigin, setBeanOrigin] = useState('')

  const handleDetailsToggle = (checked: boolean) => {
    setShowDetails(checked)
    if (!checked) {
      setBrewMethod('')
      setBeanOrigin('')
    }
  }

  return (
    <>
      <div className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-2">
        <div className="flex flex-col">
          <span className="text-sm font-medium">Add coffee details</span>
          <span className="text-xs text-gray-500">Brew method, bean origin, roaster, price</span>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showDetails}
            onChange={(event) => handleDetailsToggle(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-200"
          />
          <span>Include</span>
        </label>
      </div>

      {showDetails && (
        <div className="flex flex-col gap-3 pt-2 pb-2">
          {/* Brew Method */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Brew Method</label>
            <div className="flex flex-wrap gap-2">
              {BREW_METHODS.map(method => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setBrewMethod(method === brewMethod ? '' : method)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    brewMethod === method
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
            <input type="hidden" name="brew_method" value={brewMethod} />
          </div>

          {/* Bean Origin */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Bean Origin</label>
            <div className="flex flex-wrap gap-2">
              {BEAN_ORIGINS.map(origin => (
                <button
                  type="button"
                  key={origin}
                  onClick={() => setBeanOrigin(origin === beanOrigin ? '' : origin)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    beanOrigin === origin
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {origin}
                </button>
              ))}
            </div>
            <input type="hidden" name="bean_origin" value={beanOrigin} />
          </div>

          {/* Roaster */}
          <div className="flex flex-col gap-1">
            <label htmlFor="roaster" className="text-sm font-medium">Roaster</label>
            <input
              id="roaster"
              name="roaster"
              type="text"
              placeholder="Roaster (e.g. Fuego, Puerto Blest)"
              className="rounded border border-gray-300 p-2 text-sm w-full focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-200"
            />
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1">
            <label htmlFor="price" className="text-sm font-medium">Price</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="rounded border border-gray-300 p-2 text-sm w-full focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-200"
            />
          </div>
        </div>
      )}
    </>
  )
}
