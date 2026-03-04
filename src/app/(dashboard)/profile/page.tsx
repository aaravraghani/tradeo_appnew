'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { Award, BookOpen, TrendingUp, Zap, Flame, Trophy } from 'lucide-react'

interface ProfileData {
  firstName: string
  lastName: string
  username: string
  imageUrl: string | null
  country: string
  bio: string
  joinedAt: string
  profile: {
    totalXP: number
    level: number
    currentStreak: number
    longestStreak: number
    totalLessonsCompleted: number
    totalTradesMade: number
  }
  portfolio: {
    virtualBalance: number
    totalReturn: number
    totalReturnAmount: number
  } | null
  badges: {
    id: string
    name: string
    icon: string
    description: string
    rarity: string
    earnedAt: string
  }[]
  learningProgress: {
    moduleTitle: string
    icon: string
    percentComplete: number
    xpEarned: number
  }[]
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.replace('/sign-in')
      return
    }

    async function fetchProfile() {
      try {
        const res = await fetch('/api/users/profile')
        if (!res.ok) throw new Error('Failed to load profile')
        const data = await res.json()
        setProfile(data)
      } catch (err) {
        setError('Could not load profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [isLoaded, user, router])

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background-gray flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background-gray flex items-center justify-center px-4">
        <Card className="text-center max-w-sm w-full">
          <p className="text-text-secondary mb-4">{error ?? 'Profile not found.'}</p>
          <button
            onClick={() => router.push('/home')}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
          >
            Back to Home
          </button>
        </Card>
      </div>
    )
  }

  const rarityColor: Record<string, string> = {
    common: 'bg-gray-100 text-gray-600',
    rare: 'bg-accent-blue/10 text-accent-blue',
    epic: 'bg-purple-100 text-purple-600',
    legendary: 'bg-accent-yellow/20 text-accent-yellow',
  }

  return (
    <div className="min-h-screen bg-background-gray pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-dark h-32 relative" />

      <Container className="relative -mt-16 pb-6 space-y-5">
        {/* Avatar + Name */}
        <div className="flex items-end space-x-4">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-card overflow-hidden bg-gray-200 flex items-center justify-center">
            {user?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-primary">
                {profile.firstName?.[0] ?? '?'}
              </span>
            )}
          </div>
          <div className="pb-2">
            <h1 className="text-xl font-bold text-text-primary">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-sm text-text-secondary">@{profile.username}</p>
          </div>
        </div>

        {/* Level + XP */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wide">Level</p>
              <p className="text-3xl font-bold text-primary">{profile.profile.level}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-secondary uppercase tracking-wide">Total XP</p>
              <p className="text-3xl font-bold text-accent-yellow">{profile.profile.totalXP.toLocaleString()}</p>
            </div>
          </div>
          {/* XP Progress bar (simple) */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent-yellow rounded-full"
              style={{ width: `${Math.min((profile.profile.totalXP % 1000) / 10, 100)}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary mt-1 text-right">
            {profile.profile.totalXP % 1000} / 1000 XP to next level
          </p>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Flame, label: 'Current Streak', value: `${profile.profile.currentStreak}d`, color: 'text-accent-orange bg-accent-orange/10' },
            { icon: Trophy, label: 'Longest Streak', value: `${profile.profile.longestStreak}d`, color: 'text-accent-yellow bg-accent-yellow/10' },
            { icon: BookOpen, label: 'Lessons Done', value: profile.profile.totalLessonsCompleted, color: 'text-accent-blue bg-accent-blue/10' },
            { icon: TrendingUp, label: 'Trades Made', value: profile.profile.totalTradesMade, color: 'text-primary bg-primary/10' },
          ].map((stat, i) => {
            const Icon = stat.icon
            const [iconColor, bgColor] = stat.color.split(' ')
            return (
              <Card key={i} className="flex items-center space-x-3 p-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}>
                  <Icon size={20} className={iconColor} />
                </div>
                <div>
                  <p className="text-xs text-text-secondary">{stat.label}</p>
                  <p className="text-lg font-bold text-text-primary">{stat.value}</p>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Portfolio */}
        {profile.portfolio && (
          <Card>
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" /> Portfolio
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-secondary">Virtual Balance</p>
                <p className="text-2xl font-bold text-text-primary">
                  ${profile.portfolio.virtualBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-secondary">Total Return</p>
                <p className={`text-2xl font-bold ${profile.portfolio.totalReturn >= 0 ? 'text-primary' : 'text-accent-red'}`}>
                  {profile.portfolio.totalReturn >= 0 ? '+' : ''}{profile.portfolio.totalReturn.toFixed(2)}%
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Learning Progress */}
        {profile.learningProgress.length > 0 && (
          <div>
            <h3 className="font-semibold text-text-primary mb-3">Learning Progress</h3>
            <div className="space-y-3">
              {profile.learningProgress.map((lp, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{lp.icon}</span>
                      <p className="text-sm font-medium text-text-primary">{lp.moduleTitle}</p>
                    </div>
                    <span className="text-xs text-accent-yellow font-semibold">+{lp.xpEarned} XP</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${lp.percentComplete}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-secondary mt-1">{lp.percentComplete}% complete</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Award size={18} className="text-primary" /> Badges ({profile.badges.length})
          </h3>
          {profile.badges.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-4xl mb-2">🎯</p>
              <p className="text-text-secondary text-sm">Complete lessons and missions to earn badges!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {profile.badges.map((badge) => (
                <Card key={badge.id} className="p-4 flex items-center space-x-3">
                  <span className="text-3xl">{badge.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{badge.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rarityColor[badge.rarity] ?? 'bg-gray-100 text-gray-500'}`}>
                      {badge.rarity}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Container>

      <BottomNav />
    </div>
  )
}


