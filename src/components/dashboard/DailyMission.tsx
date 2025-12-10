'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Target, CheckCircle } from 'lucide-react'

export const DailyMission: React.FC = () => {
  const missions = [
    { id: 1, task: 'Complete 2 lessons', completed: true },
    { id: 2, task: 'Make 1 simulated trade', completed: true },
    { id: 3, task: 'Ask AI coach a question', completed: false },
  ]

  const completedCount = missions.filter(m => m.completed).length
  const totalCount = missions.length
  const progress = (completedCount / totalCount) * 100

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Target className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">Daily Mission</h3>
            <p className="text-sm text-text-secondary">
              {completedCount} of {totalCount} completed
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">+150 XP</p>
          <p className="text-xs text-text-secondary">Reward</p>
        </div>
      </div>

      {/* Mission List */}
      <div className="space-y-3 mb-4">
        {missions.map((mission) => (
          <div 
            key={mission.id}
            className="flex items-center space-x-3 p-3 rounded-lg bg-background-gray"
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              mission.completed ? 'bg-primary' : 'bg-gray-300'
            }`}>
              {mission.completed && (
                <CheckCircle size={16} className="text-white" />
              )}
            </div>
            <span className={`flex-1 ${
              mission.completed 
                ? 'text-text-secondary line-through' 
                : 'text-text-primary font-medium'
            }`}>
              {mission.task}
            </span>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Progress</span>
          <span className="text-primary font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {completedCount === totalCount && (
        <div className="mt-4 p-3 bg-primary/10 rounded-lg text-center">
          <p className="text-primary font-semibold text-sm">
            🎉 Mission Complete! +150 XP earned
          </p>
        </div>
      )}
    </Card>
  )
}


