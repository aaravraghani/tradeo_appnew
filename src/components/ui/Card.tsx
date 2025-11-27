import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export const Card: React.FC<CardProps> = ({ children, className, hover = false }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-card p-6',
        hover && 'transition-transform duration-300 hover:scale-105 hover:shadow-xl',
        className
      )}
    >
      {children}
    </div>
  )
}


