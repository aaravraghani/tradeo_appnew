'use client'

import React, { useState } from 'react'
import { Home, BookOpen, TrendingUp, Users, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export const BottomNav: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home')

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'learn', icon: BookOpen, label: 'Learn' },
    { id: 'trade', icon: TrendingUp, label: 'Trade' },
    { id: 'social', icon: Users, label: 'Social' },
    { id: 'profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-divider z-40 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 flex-1 h-full transition-colors',
                isActive ? 'text-primary' : 'text-text-secondary'
              )}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full"></div>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}


