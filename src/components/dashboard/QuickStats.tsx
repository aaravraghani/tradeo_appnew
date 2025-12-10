'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { BookOpen, Zap, Trophy, Award } from 'lucide-react'

interface QuickStatsProps {
  totalLessons: number
  xpPoints: number
  rank: number
  badges: number
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  totalLessons,
  xpPoints,
  rank,
  badges,
}) => {
  const stats = [
    {
      icon: BookOpen,
      label: 'Lessons',
      value: totalLessons,
      color: 'bg-accent-blue/10 text-accent-blue',
    },
    {
      icon: Zap,
      label: 'XP Points',
      value: xpPoints,
      color: 'bg-accent-yellow/10 text-accent-yellow',
    },
    {
      icon: Trophy,
      label: 'Rank',
      value: `#${rank}`,
      color: 'bg-accent-orange/10 text-accent-orange',
    },
    {
      icon: Award,
      label: 'Badges',
      value: badges,
      color: 'bg-primary/10 text-primary',
    },
  ]

  return (
    <div>
      <h3 className="font-semibold text-text-primary mb-3">Quick Stats</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="text-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2 ${stat.color.split(' ')[0]}`}>
                <Icon className={stat.color.split(' ')[1]} size={24} />
              </div>
              <p className="text-2xl font-bold text-text-primary mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-text-secondary">{stat.label}</p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}


