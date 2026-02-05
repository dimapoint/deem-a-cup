import Image from 'next/image'
import { User } from 'lucide-react'

interface AvatarProps {
  url: string | null
  alt: string
}

export function Avatar({ url, alt }: AvatarProps) {
  return (
    <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-gray-700 bg-gray-800">
      {url ? (
        <Image
          src={url}
          alt={alt}
          fill
          sizes="80px"
          className="object-cover"
        />
      ) : (
        <User size={28} className="text-gray-400" />
      )}
    </div>
  )
}
