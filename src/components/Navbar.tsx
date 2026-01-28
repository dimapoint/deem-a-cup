import Link from 'next/link'
import { Home, User, Coffee } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#14181c]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white hover:text-orange-500 transition-colors">
          <Coffee className="h-6 w-6 text-orange-500" />
          <span className="hidden sm:inline">Deem a Cup</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors" title="Home">
            <Home className="h-5 w-5" />
          </Link>
          
          {user ? (
            <Link href="/profile" className="text-gray-400 hover:text-white transition-colors" title="Profile">
              <User className="h-5 w-5" />
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
