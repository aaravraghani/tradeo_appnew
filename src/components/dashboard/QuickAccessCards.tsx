'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { BookOpen, TrendingUp, MessageCircle, Users, ChevronRight } from 'lucide-react'

export const QuickAccessCards: React.FC = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Learning Modules',
      description: 'Continue your lessons',
      color: 'bg-accent-blue/10 text-accent-blue',
      badge: 'In Progress',
      badgeColor: 'bg-accent-blue text-white',
    },
    {
      icon: TrendingUp,
      title: 'Stock Simulation',
      description: 'Practice trading',
      color: 'bg-primary/10 text-primary',
      badge: '+2.5% Today',
      badgeColor: 'bg-primary text-white',
    },
    {
      icon: MessageCircle,
      title: 'AI Coach',
      description: 'Ask investment questions',
      color: 'bg-accent-yellow/10 text-accent-yellow',
      badge: 'New',
      badgeColor: 'bg-accent-yellow text-white',
    },
    {
      icon: Users,
      title: 'Leaderboard',
      description: 'Compete with friends',
      color: 'bg-accent-orange/10 text-accent-orange',
      badge: 'Rank #12',
      badgeColor: 'bg-accent-orange text-white',
    },
  ]

  return (
    <div>
      <h3 className="font-semibold text-text-primary mb-3">Quick Access</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Card 
              key={index} 
              hover 
              className="cursor-pointer"
              onClick={() => console.log(`Navigate to ${feature.title}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${feature.color.split(' ')[0]}`}>
                    <Icon className={feature.color.split(' ')[1]} size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-text-primary mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {feature.description}
                    </p>
                    <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${feature.badgeColor}`}>
                      {feature.badge}
                    </span>
                  </div>
                </div>
                <ChevronRight className="text-text-secondary flex-shrink-0 mt-1" size={20} />
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}


