'use client'

import React from 'react'
import { UserButton } from '@clerk/nextjs'
import { Container } from '@/components/ui/Container'
import { Bell } from 'lucide-react'

interface DashboardHeaderProps {
  userName: string
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName }) => {
  return (
    <header className="bg-white border-b border-divider sticky top-0 z-40">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
            <span className="text-xl font-bold text-text-primary">Tradeo</span>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button 
              className="relative p-2 hover:bg-background-gray rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-text-secondary" />
              {/* Notification Badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full"></span>
            </button>

            {/* User Avatar - Updated */}
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9',
                },
              }}
            />
          </div>
        </div>
      </Container>
    </header>
  )
}
