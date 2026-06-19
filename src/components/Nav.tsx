'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Home' },
  { href: '/checklist', label: 'Checklist' },
  { href: '/chat', label: 'Ask AI' },
  { href: '/community', label: 'Community' },
]

type Props = {
  userName?: string
}

export default function Nav({ userName }: Props) {
  const pathname = usePathname()
  const initial = userName ? userName[0].toUpperCase() : '?'

  return (
    <nav className="bg-white/90 backdrop-blur border-b border-gray-100 sticky top-0 z-10 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-bold text-emerald-700 flex-shrink-0 tracking-tight">
          Landr
        </Link>
        <div className="flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                pathname === link.href ||
                (link.href !== '/dashboard' && pathname.startsWith(link.href))
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {userName && (
            <div className="ml-2 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {initial}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
