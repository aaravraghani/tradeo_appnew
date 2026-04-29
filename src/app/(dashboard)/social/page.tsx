'use client'

import { useState, useEffect, useCallback } from 'react'
import { Container } from '@/components/ui/Container'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { BottomNav } from '@/components/dashboard/BottomNav'
import {
  Trophy, Flame, Zap, Users, Heart, Share2,
  Crown, Medal, Target, BookOpen, BarChart2, Swords,
  UserPlus, UserCheck, Loader2,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeaderboardEntry {
  rank: number
  userId: string      // clerkId — used for follow API
  name: string
  username: string
  imageUrl: string | null
  xp: number
  level: number
  streak: number
  isCurrentUser: boolean
  isFollowing: boolean  // ← new
}

interface FeedItem {
  id: string
  userId: string
  name: string
  username: string
  imageUrl: string | null
  type: 'badge' | 'lesson' | 'trade' | 'streak' | 'level_up'
  title: string
  description: string
  xpEarned?: number
  icon: string
  createdAt: string
  likes: number
  liked: boolean
}

interface Challenge {
  id: string
  title: string
  description: string
  type: 'xp' | 'streak' | 'lessons' | 'portfolio'
  icon: string
  participants: number
  endsIn: string
  myRank: number | null
  myProgress: number
  target: number
  xpReward: number
  topParticipants: { name: string; imageUrl: string | null; value: number }[]
}

interface SocialData {
  userName: string
  leaderboard: LeaderboardEntry[]
  feed: FeedItem[]
  challenges: Challenge[]
  myStats: { rank: number; xp: number; streak: number; level: number }
}

// ─── FollowButton ─────────────────────────────────────────────────────────────

function FollowButton({
  userId,
  initialFollowing,
  onToggle,
}: {
  userId: string
  initialFollowing: boolean
  onToggle: (userId: string, nowFollowing: boolean) => void
}) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const [hovered, setHovered] = useState(false)

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    try {
      const method = following ? 'DELETE' : 'POST'
      const res = await fetch(`/api/social/follow/${userId}`, { method })
      if (res.ok) {
        const newState = !following
        setFollowing(newState)
        onToggle(userId, newState)
      }
    } catch {
      // fail silently — button snaps back
    } finally {
      setLoading(false)
    }
  }

  if (following) {
    return (
      <button
        onClick={toggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        disabled={loading}
        className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all flex-shrink-0 ${
          hovered
            ? 'border-red-300 bg-red-50 text-red-500'
            : 'border-primary/30 bg-primary/5 text-primary'
        }`}
      >
        {loading ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <UserCheck size={11} />
        )}
        {hovered ? 'Unfollow' : 'Following'}
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-all flex-shrink-0"
    >
      {loading ? (
        <Loader2 size={11} className="animate-spin" />
      ) : (
        <UserPlus size={11} />
      )}
      Follow
    </button>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  src,
  name,
  size = 'md',
}: {
  src: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const dims = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' }
  if (src)
    return (
      <img
        src={src}
        alt={name}
        className={`${dims[size]} rounded-full object-cover flex-shrink-0`}
      />
    )
  return (
    <div
      className={`${dims[size]} rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={18} className="text-yellow-400" />
  if (rank === 2) return <Medal size={18} className="text-gray-400" />
  if (rank === 3) return <Medal size={18} className="text-amber-600" />
  return (
    <span className="text-sm font-bold text-text-secondary w-5 text-center">
      #{rank}
    </span>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-card p-5 animate-pulse">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-2 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ─── Leaderboard Tab ──────────────────────────────────────────────────────────

function LeaderboardTab({
  entries,
  myStats,
  onFollowToggle,
}: {
  entries: LeaderboardEntry[]
  myStats: SocialData['myStats']
  onFollowToggle: (userId: string, nowFollowing: boolean) => void
}) {
  const [subTab, setSubTab] = useState<'global' | 'friends'>('global')
  const [friends, setFriends] = useState<LeaderboardEntry[]>([])
  const [loadingFriends, setLoadingFriends] = useState(false)
  const [friendsLoaded, setFriendsLoaded] = useState(false)

  const loadFriends = useCallback(async () => {
    if (friendsLoaded) return
    setLoadingFriends(true)
    try {
      const res = await fetch('/api/social/following')
      const data = await res.json()
      setFriends(data.following ?? [])
      setFriendsLoaded(true)
    } catch {
      // ignore
    } finally {
      setLoadingFriends(false)
    }
  }, [friendsLoaded])

  // When unfollowing from Friends tab, remove them from the list immediately
  const handleFriendsToggle = (userId: string, nowFollowing: boolean) => {
    if (!nowFollowing) {
      setFriends(prev =>
        prev
          .filter(f => f.userId !== userId)
          .map((f, i) => ({ ...f, rank: i + 1 }))
      )
    }
    onFollowToggle(userId, nowFollowing)
  }

  useEffect(() => {
    if (subTab === 'friends') loadFriends()
  }, [subTab, loadFriends])

  const displayed = subTab === 'global' ? entries : friends
  const top3 = displayed.slice(0, 3)

  return (
    <div className="space-y-4">
      {/* Sub-tab: Global / Friends */}
      <div className="flex bg-white rounded-xl shadow-card p-1">
        <button
          onClick={() => setSubTab('global')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            subTab === 'global'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-primary'
          }`}
        >
          🌍 Global
        </button>
        <button
          onClick={() => setSubTab('friends')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            subTab === 'friends'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-primary'
          }`}
        >
          👥 Friends
        </button>
      </div>

      {/* My rank banner */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-4 text-white flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">Your Rank</p>
          <p className="text-3xl font-bold">#{myStats.rank}</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-80">Total XP</p>
          <p className="text-2xl font-bold">{myStats.xp.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-80">Level</p>
          <p className="text-2xl font-bold">{myStats.level}</p>
        </div>
      </div>

      {/* Friends empty state */}
      {subTab === 'friends' && !loadingFriends && friends.length === 0 && (
        <div className="bg-white rounded-xl shadow-card p-10 text-center">
          <Users size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-text-primary mb-1">No friends yet</p>
          <p className="text-sm text-text-secondary">
            Follow people from the Global leaderboard to see them here.
          </p>
        </div>
      )}

      {loadingFriends && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Top 3 podium */}
      {top3.length >= 3 && (
        <div className="bg-white rounded-xl shadow-card p-5">
          <p className="text-sm font-semibold text-text-secondary mb-4 text-center">
            {subTab === 'global' ? 'Top Investors' : 'Top Friends'}
          </p>
          <div className="flex items-end justify-center space-x-3">
            {/* 2nd */}
            <div className="flex flex-col items-center flex-1">
              <Avatar src={top3[1].imageUrl} name={top3[1].name} size="md" />
              <p className="text-xs font-semibold text-text-primary mt-1 truncate w-full text-center">
                {top3[1].name.split(' ')[0]}
              </p>
              <p className="text-xs text-text-secondary">{top3[1].xp.toLocaleString()} XP</p>
              <div className="w-full bg-gray-200 rounded-t-lg mt-2 flex items-center justify-center h-12 text-lg">
                🥈
              </div>
            </div>
            {/* 1st */}
            <div className="flex flex-col items-center flex-1">
              <div className="relative">
                <Avatar src={top3[0].imageUrl} name={top3[0].name} size="lg" />
                <Crown
                  size={16}
                  className="absolute -top-2 left-1/2 -translate-x-1/2 text-yellow-400"
                />
              </div>
              <p className="text-xs font-bold text-text-primary mt-1 truncate w-full text-center">
                {top3[0].name.split(' ')[0]}
              </p>
              <p className="text-xs text-primary font-semibold">
                {top3[0].xp.toLocaleString()} XP
              </p>
              <div className="w-full bg-yellow-100 rounded-t-lg mt-2 flex items-center justify-center h-16 text-xl">
                🥇
              </div>
            </div>
            {/* 3rd */}
            <div className="flex flex-col items-center flex-1">
              <Avatar src={top3[2].imageUrl} name={top3[2].name} size="md" />
              <p className="text-xs font-semibold text-text-primary mt-1 truncate w-full text-center">
                {top3[2].name.split(' ')[0]}
              </p>
              <p className="text-xs text-text-secondary">{top3[2].xp.toLocaleString()} XP</p>
              <div className="w-full bg-amber-50 rounded-t-lg mt-2 flex items-center justify-center h-10 text-base">
                🥉
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rankings list */}
      {displayed.length > 0 && (
        <div className="bg-white rounded-xl shadow-card divide-y divide-divider">
          {displayed.map(entry => (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 px-4 py-3 ${
                entry.isCurrentUser ? 'bg-primary/5' : ''
              }`}
            >
              {/* Rank */}
              <div className="w-7 flex items-center justify-center flex-shrink-0">
                <RankBadge rank={entry.rank} />
              </div>

              {/* Avatar */}
              <Avatar src={entry.imageUrl} name={entry.name} size="sm" />

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold truncate ${
                    entry.isCurrentUser ? 'text-primary' : 'text-text-primary'
                  }`}
                >
                  {entry.name}
                  {entry.isCurrentUser && (
                    <span className="text-xs font-normal ml-1">(you)</span>
                  )}
                </p>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <span>Lv.{entry.level}</span>
                  <span>·</span>
                  <Flame size={10} className="text-accent-orange" />
                  <span>{entry.streak}d</span>
                </div>
              </div>

              {/* XP */}
              <div className="text-right flex-shrink-0 mr-2">
                <p className="text-sm font-bold text-primary">{entry.xp.toLocaleString()}</p>
                <p className="text-xs text-text-secondary">XP</p>
              </div>

              {/* Follow button — hidden for self */}
              {!entry.isCurrentUser && (
                <FollowButton
                  userId={entry.userId}
                  initialFollowing={entry.isFollowing}
                  onToggle={subTab === 'friends' ? handleFriendsToggle : onFollowToggle}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Feed Tab ─────────────────────────────────────────────────────────────────

function FeedTab({
  items,
  onLike,
}: {
  items: FeedItem[]
  onLike: (id: string) => void
}) {
  const typeConfig: Record<FeedItem['type'], { bg: string; label: string }> = {
    badge: { bg: 'bg-accent-yellow/10 text-accent-yellow', label: 'Badge Earned' },
    lesson: { bg: 'bg-accent-blue/10 text-accent-blue', label: 'Lesson Done' },
    trade: { bg: 'bg-primary/10 text-primary', label: 'Trade Made' },
    streak: { bg: 'bg-accent-orange/10 text-accent-orange', label: 'Streak!' },
    level_up: { bg: 'bg-purple-100 text-purple-600', label: 'Level Up!' },
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-card p-10 text-center">
        <Users size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-text-primary font-semibold">Nothing here yet</p>
        <p className="text-sm text-text-secondary mt-1">
          Activity from the community will show up here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map(item => {
        const cfg = typeConfig[item.type]
        return (
          <div key={item.id} className="bg-white rounded-xl shadow-card p-4">
            <div className="flex items-start space-x-3">
              <Avatar src={item.imageUrl} name={item.name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-0.5">
                  <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mb-2">
                  @{item.username} · {timeAgo(item.createdAt)}
                </p>
                <div className="flex items-center space-x-2 bg-background-gray rounded-lg px-3 py-2">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                    <p className="text-xs text-text-secondary">{item.description}</p>
                  </div>
                  {item.xpEarned && (
                    <span className="ml-auto text-xs font-bold text-primary flex-shrink-0">
                      +{item.xpEarned} XP
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 mt-3">
                  <button
                    onClick={() => onLike(item.id)}
                    className={`flex items-center space-x-1 text-xs transition-colors ${
                      item.liked
                        ? 'text-red-500'
                        : 'text-text-secondary hover:text-red-400'
                    }`}
                  >
                    <Heart size={14} fill={item.liked ? 'currentColor' : 'none'} />
                    <span>{item.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-xs text-text-secondary hover:text-primary transition-colors">
                    <Share2 size={14} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Challenges Tab ───────────────────────────────────────────────────────────

function ChallengesTab({ challenges }: { challenges: Challenge[] }) {
  const iconMap: Record<Challenge['type'], React.ReactNode> = {
    xp: <Zap size={20} className="text-accent-yellow" />,
    streak: <Flame size={20} className="text-accent-orange" />,
    lessons: <BookOpen size={20} className="text-accent-blue" />,
    portfolio: <BarChart2 size={20} className="text-primary" />,
  }
  const bgMap: Record<Challenge['type'], string> = {
    xp: 'bg-accent-yellow/10',
    streak: 'bg-accent-orange/10',
    lessons: 'bg-accent-blue/10',
    portfolio: 'bg-primary/10',
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-accent-orange to-accent-red rounded-xl p-4 text-white">
        <div className="flex items-center space-x-2 mb-1">
          <Swords size={20} />
          <p className="font-bold text-lg">Weekly Challenges</p>
        </div>
        <p className="text-sm opacity-90">
          Compete with the community. New challenges every Monday.
        </p>
      </div>

      {challenges.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-10 text-center">
          <Target size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-text-primary font-semibold">No active challenges</p>
          <p className="text-sm text-text-secondary mt-1">Check back soon.</p>
        </div>
      ) : (
        challenges.map(c => {
          const pct = Math.min(100, Math.round((c.myProgress / c.target) * 100))
          return (
            <div key={c.id} className="bg-white rounded-xl shadow-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgMap[c.type]}`}
                  >
                    {iconMap[c.type]}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{c.title}</p>
                    <p className="text-xs text-text-secondary">{c.description}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-xs font-bold text-primary">+{c.xpReward} XP</p>
                  <p className="text-xs text-text-secondary">Ends {c.endsIn}</p>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-text-secondary mb-1">
                  <span>Your progress</span>
                  <span className="font-semibold text-text-primary">
                    {c.myProgress} / {c.target}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-text-secondary">
                  <Users size={12} />
                  <span>{c.participants.toLocaleString()} participants</span>
                </div>
                {c.myRank && (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Rank #{c.myRank}
                  </span>
                )}
              </div>
              {c.topParticipants.length > 0 && (
                <div className="mt-3 pt-3 border-t border-divider">
                  <p className="text-xs text-text-secondary mb-2">Top participants</p>
                  <div className="space-y-1.5">
                    {c.topParticipants.slice(0, 3).map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="text-text-secondary w-4">{i + 1}.</span>
                          <Avatar src={p.imageUrl} name={p.name} size="sm" />
                          <span className="font-medium text-text-primary">{p.name}</span>
                        </div>
                        <span className="font-bold text-primary">{p.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SocialPage() {
  const [tab, setTab] = useState<'leaderboard' | 'feed' | 'challenges'>('leaderboard')
  const [data, setData] = useState<SocialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/social')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Failed to load. Please try again.'); setLoading(false) })
  }, [])

  const handleLike = (id: string) => {
    if (!data) return
    setData(prev =>
      prev
        ? {
            ...prev,
            feed: prev.feed.map(item =>
              item.id === id
                ? { ...item, liked: !item.liked, likes: item.liked ? item.likes - 1 : item.likes + 1 }
                : item
            ),
          }
        : prev
    )
  }

  // Optimistically update follow state in leaderboard
  const handleFollowToggle = (userId: string, nowFollowing: boolean) => {
    if (!data) return
    setData(prev =>
      prev
        ? {
            ...prev,
            leaderboard: prev.leaderboard.map(entry =>
              entry.userId === userId ? { ...entry, isFollowing: nowFollowing } : entry
            ),
          }
        : prev
    )
  }

  const tabs = [
    { id: 'leaderboard' as const, label: 'Leaderboard', icon: Trophy },
    { id: 'feed' as const,        label: 'Feed',        icon: Users },
    { id: 'challenges' as const,  label: 'Challenges',  icon: Swords },
  ]

  return (
    <div className="min-h-screen bg-background-gray pb-24">
      <DashboardHeader userName={data?.userName ?? ''} />

      {/* Page header + tab bar */}
      <div className="bg-white border-b border-divider px-4 pt-5 pb-0">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-text-primary mb-4">Social</h1>
          <div className="flex space-x-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center space-x-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                  tab === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon size={15} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Container className="py-5 max-w-lg">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center mb-4">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-red-500 text-xs underline mt-1"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : data ? (
          <>
            {tab === 'leaderboard' && (
              <LeaderboardTab
                entries={data.leaderboard ?? []}
                myStats={data.myStats ?? { rank: 1, xp: 0, streak: 0, level: 1 }}
                onFollowToggle={handleFollowToggle}
              />
            )}
            {tab === 'feed' && (
              <FeedTab items={data.feed ?? []} onLike={handleLike} />
            )}
            {tab === 'challenges' && (
              <ChallengesTab challenges={data.challenges ?? []} />
            )}
          </>
        ) : null}
      </Container>

      <BottomNav />
    </div>
  )
}


