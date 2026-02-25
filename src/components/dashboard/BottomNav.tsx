'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Home, BookOpen, TrendingUp, Users, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export const BottomNav: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { id: 'home',    icon: Home,        label: 'Home',    href: '/home' },
    { id: 'learn',   icon: BookOpen,    label: 'Learn',   href: '/learn' },
    { id: 'trade',   icon: TrendingUp,  label: 'Trade',   href: '/simulate' },
    { id: 'social',  icon: Users,       label: 'Social',  href: '/social' },
    { id: 'profile', icon: User,        label: 'Profile', href: '/profile' },
  ]

  // Derive active tab from the current URL
  const activeTab = navItems.find((item) => pathname.startsWith(item.href))?.id ?? 'home'

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-divider z-40">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={cn(
                'relative flex flex-col items-center justify-center space-y-1 flex-1 h-full transition-colors',
                isActive ? 'text-primary' : 'text-text-secondary'
              )}
            >
              {/* Active indicator pill at top */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary rounded-b-full" />
              )}
              <Icon size={22} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}


