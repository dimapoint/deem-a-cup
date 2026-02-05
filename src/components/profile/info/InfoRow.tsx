import { ReactNode } from 'react'

interface InfoRowProps {
  icon: ReactNode
  label: string
  value: string | number
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="text-gray-200">{value}</span>
    </div>
  )
}
