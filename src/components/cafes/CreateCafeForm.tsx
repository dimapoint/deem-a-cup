'use client'

import { useState } from 'react'
import { SearchStep } from './create/SearchStep'
import { ConfirmStep } from './create/ConfirmStep'

interface CreateCafeFormProps {
  onSuccess?: () => void
}

export default function CreateCafeForm({ onSuccess }: CreateCafeFormProps) {
  const [selectedPlace, setSelectedPlace] = useState<{
    placeId: string,
    name: string,
    address: string
  } | null>(null)

  if (!selectedPlace) {
    return (
      <SearchStep
        onSelect={(placeId, name, address) => setSelectedPlace({ placeId, name, address })}
        onManualLog={() => setSelectedPlace({ placeId: '', name: '', address: '' })}
      />
    )
  }

  return (
    <ConfirmStep
      selectedPlace={selectedPlace}
      onCancel={() => setSelectedPlace(null)}
      onSuccess={onSuccess}
    />
  )
}
