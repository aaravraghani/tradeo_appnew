'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Flame } from 'lucide-react'

interface StreakCardProps {
  currentStreak: number
}

export const StreakCard: React.FC<StreakCardProps> = ({ currentStreak }) => {
  // Generate last 7 days
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const completedDays = [true, true, true, true, true, true, true] // Mock data

  return (
    <Card className="bg-gradient-to-r from-accent-orange to-accent-red text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Flame className="text-white" size={24} />
          </div>
          <div>
            <p className="text-sm opacity-90">Current Streak</p>
            <p className="text-3xl font-bold">{currentStreak} Days 🔥</p>
          </div>
        </div>

        {/* Mini Calendar */}
        <div className="hidden sm:flex space-x-2">
          {days.map((day, index) => (
            <div key={index} className="text-center">
              <p className="text-xs opacity-75 mb-1">{day}</p>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  completedDays[index] 
                    ? 'bg-white text-accent-orange' 
                    : 'bg-white/20'
                }`}
              >
                {completedDays[index] ? '✓' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Message */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-sm opacity-90">
          🎉 Amazing! Keep it up to reach your 30-day streak goal!
        </p>
      </div>
    </Card>
  )
}


