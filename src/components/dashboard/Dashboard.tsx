'use client'

import { useState } from 'react'
import { getOrCreateCafe } from '@/app/actions/cafe'
import { Cafe } from '@/types/database'
import { DeemWithDetails } from '@/app/actions/deem'
import { DeemFeed } from '@/components/deems/DeemFeed'
import { NearbyCafes } from '@/components/cafes/NearbyCafes'
import { LogCafeSection } from '@/components/dashboard/LogCafeSection'
import { DashboardModals } from '@/components/dashboard/DashboardModals'

/**
 * Dashboard Component
 *
 * The main view for authenticated users. It serves as the central hub for:
 * 1. Logging new coffee visits (Deems).
 * 2. Discovering nearby cafés.
 * 3. Viewing the activity feed of recent logs.
 *
 * This component manages the client-side state for café selection and modal visibility.
 */
export function Dashboard({ deems }: { deems: DeemWithDetails[] }) {
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  /**
   * Handles the selection of a cafe from the search component.
   *
   * Calls the Server Action `getOrCreateCafe` to ensure the café exists in our
   * database before opening the logging modal.
   */
  const handleCafeSelect = async (placeId: string, name: string, address: string) => {
    try {
      const cafe = await getOrCreateCafe(placeId, name, address)
      setSelectedCafe(cafe)
    } catch (error) {
      console.error("Failed to select cafe:", error)
    }
  }

  return (
    <>
      {/* Log Area */}
      <LogCafeSection
        onCafeSelect={handleCafeSelect}
        onAddCustomCafe={() => setIsCreateModalOpen(true)}
      />

      {/* Nearby Cafes */}
      <NearbyCafes onSelectAction={setSelectedCafe} />

      {/* Activity Feed */}
      <section>
        <DeemFeed deems={deems} />
      </section>

      {/* Modals */}
      <DashboardModals
        selectedCafe={selectedCafe}
        isCreateModalOpen={isCreateModalOpen}
        onCloseLogModal={() => setSelectedCafe(null)}
        onCloseCreateModal={() => setIsCreateModalOpen(false)}
      />
    </>
  )
}
