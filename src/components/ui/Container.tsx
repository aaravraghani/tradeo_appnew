import React from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div className={cn('max-w-7xl mx-auto px-6 sm:px-8 lg:px-12', className)}>
      {children}
    </div>
  )
}


