'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BookOpen, ChevronRight } from 'lucide-react'

interface LearningProgressProps {
  currentModule: string
  progress: number
  lessonsCompleted: number
  totalLessons: number
}

export const LearningProgress: React.FC<LearningProgressProps> = ({
  currentModule,
  progress,
  lessonsCompleted,
  totalLessons,
}) => {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent-blue/10 rounded-lg flex items-center justify-center">
            <BookOpen className="text-accent-blue" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">Learning Progress</h3>
            <p className="text-sm text-text-secondary">{currentModule}</p>
          </div>
        </div>
      </div>

      {/* Progress Circle and Stats */}
      <div className="flex items-center justify-between mb-4">
        {/* Progress Ring */}
        <div className="relative w-24 h-24">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#E0E0E0"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#42A5F5"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-text-primary">{progress}%</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 ml-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Lessons Completed</span>
            <span className="font-semibold text-text-primary">
              {lessonsCompleted}/{totalLessons}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Next Lesson</span>
            <span className="font-semibold text-text-primary text-sm">
              Understanding P/E Ratio
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Est. Time</span>
            <span className="font-semibold text-accent-blue">5 min</span>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <Button 
        className="w-full group"
        onClick={() => console.log('Continue learning')}
      >
        Continue Learning
        <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
      </Button>

      {/* Module List Preview */}
      <div className="mt-4 pt-4 border-t border-divider">
        <p className="text-xs text-text-secondary mb-2">Next Modules</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">📊 Financial Terminology</span>
            <span className="text-xs text-text-secondary">Locked</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">📈 Reading Charts</span>
            <span className="text-xs text-text-secondary">Locked</span>
          </div>
        </div>
      </div>
    </Card>
  )
}


