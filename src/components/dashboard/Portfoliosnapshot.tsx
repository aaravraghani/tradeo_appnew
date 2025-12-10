'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'

interface PortfolioSnapshotProps {
  portfolioValue: number
  dailyChange: number
  topGainer: { name: string; change: number }
  topLoser: { name: string; change: number }
}

export const PortfolioSnapshot: React.FC<PortfolioSnapshotProps> = ({
  portfolioValue,
  dailyChange,
  topGainer,
  topLoser,
}) => {
  const isPositive = dailyChange >= 0

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isPositive ? 'bg-primary/10' : 'bg-accent-red/10'
          }`}>
            {isPositive ? (
              <TrendingUp className="text-primary" size={20} />
            ) : (
              <TrendingDown className="text-accent-red" size={20} />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">Portfolio Simulation</h3>
            <p className="text-sm text-text-secondary">Virtual Trading</p>
          </div>
        </div>
      </div>

      {/* Portfolio Value */}
      <div className="mb-4">
        <p className="text-sm text-text-secondary mb-1">Total Value</p>
        <div className="flex items-baseline space-x-2">
          <p className="text-3xl font-bold text-text-primary">
            ${portfolioValue.toLocaleString()}
          </p>
          <div className={`flex items-center text-sm font-semibold ${
            isPositive ? 'text-primary' : 'text-accent-red'
          }`}>
            {isPositive ? '+' : ''}{dailyChange}%
            {isPositive ? '↑' : '↓'}
          </div>
        </div>
        <p className="text-xs text-text-secondary mt-1">
          {isPositive ? '+' : ''}{((portfolioValue * dailyChange) / 100).toLocaleString('en-US', { 
            style: 'currency', 
            currency: 'USD' 
          })} today
        </p>
      </div>

      {/* Top Gainer/Loser */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Top Gainer */}
        <div className="bg-primary/5 rounded-lg p-3">
          <p className="text-xs text-text-secondary mb-1">Top Gainer</p>
          <p className="font-semibold text-text-primary text-sm">{topGainer.name}</p>
          <p className="text-primary font-bold text-lg">+{topGainer.change}%</p>
        </div>

        {/* Top Loser */}
        <div className="bg-accent-red/5 rounded-lg p-3">
          <p className="text-xs text-text-secondary mb-1">Top Loser</p>
          <p className="font-semibold text-text-primary text-sm">{topLoser.name}</p>
          <p className="text-accent-red font-bold text-lg">{topLoser.change}%</p>
        </div>
      </div>

      {/* Mini Chart Placeholder */}
      <div className="mb-4 h-24 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg flex items-end justify-around p-2">
        {[40, 55, 45, 70, 60, 85, 75].map((height, index) => (
          <div 
            key={index} 
            className="bg-primary rounded-t"
            style={{ width: '10%', height: `${height}%` }}
          />
        ))}
      </div>

      {/* View Portfolio Button */}
      <Button 
        variant="secondary" 
        className="w-full group"
        onClick={() => console.log('View portfolio')}
      >
        View Full Portfolio
        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
      </Button>
    </Card>
  )
}


