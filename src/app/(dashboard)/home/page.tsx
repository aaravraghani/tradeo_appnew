'use client'

// src/app/(dashboard)/home/page.tsx
// Fully live — pulls all data from /api/home/dashboard

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { QuickAccessCards } from '@/components/dashboard/QuickAccessCards'
import {
  Flame, BookOpen, TrendingUp, TrendingDown, Zap,
  Trophy, Award, CheckCircle, Target, ChevronRight,
  Loader2, BarChart2,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Mission {
  id: string
  task: string
  xpReward: number
  progress: number
  target: number
  completed: boolean
}

interface ActiveModule {
  title: string
  icon: string
  progress: number
  lessonsCompleted: number
  totalLessons: number
}

interface Portfolio {
  totalValue: number
  cashBalance: number
  totalPnL: number
  totalPnLPercent: number
  topGainer: { name: string; change: number } | null
  topLoser: { name: string; change: number } | null
  holdingsCount: number
}

interface Stats {
  totalLessons: number
  xpPoints: number
  level: number
  rank: number
  badges: number
  totalTrades: number
}

interface DashboardData {
  currentStreak: number
  longestStreak: number
  missions: Mission[]
  totalMissionXP: number
  activeModule: ActiveModule | null
  portfolio: Portfolio | null
  stats: Stats
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />
}

// ─── Streak Card ──────────────────────────────────────────────────────────────

function StreakCard({ streak, longest }: { streak: number; longest: number }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  // Mark last `streak` days as completed (right-aligned)
  const completed = days.map((_, i) => i >= 7 - Math.min(streak, 7))

  return (
    <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #FF7043, #EF5350)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Flame className="text-white" size={24} />
          </div>
          <div>
            <p className="text-sm text-white/80">Current Streak</p>
            <p className="text-3xl font-bold text-white">{streak} Days 🔥</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/60">Best</p>
          <p className="text-lg font-bold text-white">{longest}d</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {days.map((day, i) => (
          <div key={i} className="flex-1 text-center">
            <p className="text-xs text-white/60 mb-1">{day}</p>
            <div className={`h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
              completed[i] ? 'bg-white text-orange-500' : 'bg-white/20 text-white/40'
            }`}>
              {completed[i] ? '✓' : ''}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-white/70 mt-3">
        {streak >= 7
          ? `🎉 ${streak}-day streak — keep it going!`
          : `${7 - streak} more days to reach a 7-day streak!`}
      </p>
    </div>
  )
}

// ─── Daily Mission ────────────────────────────────────────────────────────────

function DailyMissionCard({ missions, totalXP }: { missions: Mission[]; totalXP: number }) {
  const completedCount = missions.filter(m => m.completed).length
  const pct = missions.length > 0 ? Math.round((completedCount / missions.length) * 100) : 0
  const allDone = completedCount === missions.length && missions.length > 0

  if (missions.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Target className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-text-primary">Daily Mission</h3>
            <p className="text-sm text-text-secondary">{completedCount} of {missions.length} completed</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-primary">+{totalXP} XP</p>
          <p className="text-xs text-text-secondary">total reward</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {missions.map(m => (
          <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-background-gray">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              m.completed ? 'bg-primary' : 'bg-gray-200'
            }`}>
              {m.completed && <CheckCircle size={14} className="text-white" />}
            </div>
            <span className={`flex-1 text-sm ${m.completed ? 'line-through text-text-secondary' : 'text-text-primary font-medium'}`}>
              {m.task}
            </span>
            <span className="text-xs text-primary font-semibold">+{m.xpReward}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">Progress</span>
          <span className="text-primary font-semibold">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {allDone && (
        <div className="mt-4 p-3 bg-primary/10 rounded-xl text-center">
          <p className="text-primary font-semibold text-sm">🎉 Mission Complete! +{totalXP} XP earned</p>
        </div>
      )}
    </div>
  )
}

// ─── Learning Progress ────────────────────────────────────────────────────────

function LearningProgressCard({ module: mod }: { module: ActiveModule | null }) {
  const router = useRouter()

  if (!mod) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-accent-blue/10 rounded-xl flex items-center justify-center">
            <BookOpen className="text-accent-blue" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-text-primary">Learning Hub</h3>
            <p className="text-sm text-text-secondary">No module started yet</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/learn')}
          className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Start Learning →
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-blue/10 rounded-xl flex items-center justify-center text-xl">
            {mod.icon}
          </div>
          <div>
            <h3 className="font-bold text-text-primary">Learning Progress</h3>
            <p className="text-sm text-text-secondary">{mod.title}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-4">
        {/* Progress ring */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-20 h-20 -rotate-90">
            <circle cx="40" cy="40" r="32" stroke="#E0E0E0" strokeWidth="7" fill="none" />
            <circle
              cx="40" cy="40" r="32"
              stroke="#42A5F5" strokeWidth="7" fill="none"
              strokeDasharray={`${2 * Math.PI * 32}`}
              strokeDashoffset={`${2 * Math.PI * 32 * (1 - mod.progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-text-primary">{mod.progress}%</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Lessons</span>
            <span className="font-semibold text-text-primary">{mod.lessonsCompleted}/{mod.totalLessons}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Remaining</span>
            <span className="font-semibold text-accent-blue">{mod.totalLessons - mod.lessonsCompleted} left</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push('/learn')}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-text-primary text-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Continue Learning
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

// ─── Portfolio Snapshot ───────────────────────────────────────────────────────

function PortfolioCard({ portfolio }: { portfolio: Portfolio | null }) {
  const router = useRouter()

  if (!portfolio) return null

  const isUp = portfolio.totalPnLPercent >= 0

  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isUp ? 'bg-primary/10' : 'bg-red-50'}`}>
            {isUp
              ? <TrendingUp className="text-primary" size={20} />
              : <TrendingDown className="text-red-500" size={20} />}
          </div>
          <div>
            <h3 className="font-bold text-text-primary">Portfolio</h3>
            <p className="text-sm text-text-secondary">Paper Trading</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-text-secondary mb-1">Total Value</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-text-primary">
            ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className={`text-sm font-semibold ${isUp ? 'text-primary' : 'text-red-500'}`}>
            {isUp ? '+' : ''}{portfolio.totalPnLPercent.toFixed(2)}%
          </p>
        </div>
        <p className="text-xs text-text-secondary mt-1">
          {isUp ? '+' : ''}${portfolio.totalPnL.toFixed(2)} total P&L
        </p>
      </div>

      {(portfolio.topGainer || portfolio.topLoser) && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {portfolio.topGainer && (
            <div className="bg-primary/5 rounded-xl p-3">
              <p className="text-xs text-text-secondary mb-0.5">Top Gainer</p>
              <p className="font-semibold text-text-primary text-sm truncate">{portfolio.topGainer.name}</p>
              <p className="text-primary font-bold">+{portfolio.topGainer.change.toFixed(1)}%</p>
            </div>
          )}
          {portfolio.topLoser && (
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-xs text-text-secondary mb-0.5">Top Loser</p>
              <p className="font-semibold text-text-primary text-sm truncate">{portfolio.topLoser.name}</p>
              <p className="text-red-500 font-bold">{portfolio.topLoser.change.toFixed(1)}%</p>
            </div>
          )}
        </div>
      )}

      {portfolio.holdingsCount === 0 && (
        <p className="text-sm text-text-secondary mb-4">No positions yet — start trading!</p>
      )}

      <button
        onClick={() => router.push('/simulate')}
        className="w-full flex items-center justify-center gap-2 py-2.5 border border-divider text-text-primary rounded-xl text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
      >
        <BarChart2 size={16} />
        View Portfolio
      </button>
    </div>
  )
}

// ─── Quick Stats ──────────────────────────────────────────────────────────────

function QuickStatsCard({ stats }: { stats: Stats }) {
  const items = [
    { icon: BookOpen, label: 'Lessons',  value: stats.totalLessons, color: 'text-accent-blue bg-accent-blue/10' },
    { icon: Zap,      label: 'XP',       value: stats.xpPoints.toLocaleString(), color: 'text-accent-yellow bg-accent-yellow/10' },
    { icon: Trophy,   label: 'Rank',     value: `#${stats.rank}`, color: 'text-accent-orange bg-accent-orange/10' },
    { icon: Award,    label: 'Badges',   value: stats.badges, color: 'text-primary bg-primary/10' },
  ]

  return (
    <div>
      <h3 className="font-bold text-text-primary mb-3">Quick Stats</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => {
          const Icon = item.icon
          const [iconColor, bgColor] = item.color.split(' ')
          return (
            <div key={i} className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor}`}>
                <Icon size={20} className={iconColor} />
              </div>
              <div>
                <p className="text-xs text-text-secondary">{item.label}</p>
                <p className="text-lg font-bold text-text-primary">{item.value}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user, isLoaded } = useUser()
  const [data, setData]   = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/home/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const firstName = user?.firstName ?? 'there'

  return (
    <div className="min-h-screen bg-background-gray pb-24">
      <DashboardHeader userName={firstName} />

      <Container className="py-5 space-y-5">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Welcome back, {isLoaded ? firstName : ''}! 👋
          </h1>
          {!loading && data && (
            <p className="text-sm text-text-secondary mt-1">
              Level {data.stats.level} · {data.stats.xpPoints.toLocaleString()} XP
            </p>
          )}
        </div>

        {/* Streak */}
        {loading ? (
          <Skeleton className="h-36 w-full" />
        ) : data ? (
          <StreakCard streak={data.currentStreak} longest={data.longestStreak} />
        ) : null}

        {/* Daily Mission */}
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : data ? (
          <DailyMissionCard missions={data.missions} totalXP={data.totalMissionXP} />
        ) : null}

        {/* Learning Progress */}
        {loading ? (
          <Skeleton className="h-44 w-full" />
        ) : data ? (
          <LearningProgressCard module={data.activeModule} />
        ) : null}

        {/* Portfolio Snapshot */}
        {loading ? (
          <Skeleton className="h-52 w-full" />
        ) : data?.portfolio ? (
          <PortfolioCard portfolio={data.portfolio} />
        ) : null}

        {/* Quick Stats */}
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : data ? (
          <QuickStatsCard stats={data.stats} />
        ) : null}

        {/* Quick Access */}
        <QuickAccessCards />

      </Container>

      <BottomNav />
    </div>
  )
}

