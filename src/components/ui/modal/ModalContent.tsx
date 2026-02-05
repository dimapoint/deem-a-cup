import { ReactNode } from 'react'

interface ModalContentProps {
  children: ReactNode
}

export function ModalContent({ children }: ModalContentProps) {
  return (
    <div className="overflow-y-auto p-3 sm:p-4">
      {children}
    </div>
  )
}
