'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { Container } from '@/components/ui/Container'
import { BookOpen, Clock, Zap, Lock, CheckCircle, ChevronRight, Star } from 'lucide-react'

interface Module {
  id: string
  title: string
  description: string
  icon: string
  order: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  xpReward: number
  lessonCount: number
  isPublished: boolean
  userProgress?: {
    status: string
    progress: number
    lessonsCompleted: number
  }
}

const difficultyConfig = {
  beginner:     { label: 'Beginner',     color: 'text-primary bg-primary/10' },
  intermediate: { label: 'Intermediate', color: 'text-accent-blue bg-accent-blue/10' },
  advanced:     { label: 'Advanced',     color: 'text-accent-orange bg-accent-orange/10' },
}

function ModuleSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 animate-pulse shadow-card">
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
        <div className="w-16 h-5 bg-gray-200 rounded-full" />
      </div>
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-full mb-1" />
      <div className="h-3 bg-gray-100 rounded w-2/3 mb-4" />
      <div className="h-2 bg-gray-100 rounded-full" />
    </div>
  )
}

export default function LearnPage() {
  const router = useRouter()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    fetch('/api/learn/modules')
      .then(r => r.json())
      .then(d => {
        setModules(d.modules ?? [])
        setUserName(d.userName ?? '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? modules : modules.filter(m => m.difficulty === filter)
  const totalCompleted = modules.filter(m => m.userProgress?.status === 'completed').length
  const inProgress = modules.filter(m => m.userProgress?.status === 'in_progress').length

  return (
    <div className="min-h-screen bg-background-gray pb-24">
      <DashboardHeader userName={userName} />

      {/* Hero */}
      <div className="bg-white border-b border-divider">
        <Container className="py-6 max-w-2xl">
          <h1 className="text-2xl font-bold text-text-primary mb-1">Learning Hub</h1>
          <p className="text-sm text-text-secondary mb-5">
            Master investing one module at a time
          </p>

          {/* Stats row */}
          <div className="flex gap-3">
            <div className="flex-1 bg-primary/5 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-primary">{modules.length}</p>
              <p className="text-xs text-text-secondary mt-0.5">Modules</p>
            </div>
            <div className="flex-1 bg-accent-blue/5 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-accent-blue">{inProgress}</p>
              <p className="text-xs text-text-secondary mt-0.5">In Progress</p>
            </div>
            <div className="flex-1 bg-primary/5 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-primary">{totalCompleted}</p>
              <p className="text-xs text-text-secondary mt-0.5">Completed</p>
            </div>
          </div>
        </Container>

        {/* Filter pills */}
        <Container className="pb-0 max-w-2xl">
          <div className="flex gap-2 pb-0 overflow-x-auto">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                  filter === f
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {f === 'all' ? 'All' : difficultyConfig[f].label}
              </button>
            ))}
          </div>
        </Container>
      </div>

      <Container className="py-5 max-w-2xl">
        {loading ? (
          <div className="grid gap-4">
            {[1,2,3].map(i => <ModuleSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-10 text-center">
            <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-text-primary">No modules yet</p>
            <p className="text-sm text-text-secondary mt-1">Check back soon — new content is being added.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((mod, idx) => {
              const prog = mod.userProgress
              const pct = prog?.progress ?? 0
              const isCompleted = prog?.status === 'completed'
              const isLocked = idx > 0 && !modules[idx - 1]?.userProgress

              return (
                <button
                  key={mod.id}
                  onClick={() => router.push(`/learn/${mod.id}`)}
                  className="bg-white rounded-2xl shadow-card p-5 text-left hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 w-full"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                        {mod.icon || '📚'}
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Module {mod.order}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyConfig[mod.difficulty]?.color ?? 'text-text-secondary bg-gray-100'}`}>
                          {difficultyConfig[mod.difficulty]?.label ?? mod.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isCompleted && <CheckCircle size={18} className="text-primary" />}
                      <ChevronRight size={18} className="text-text-secondary" />
                    </div>
                  </div>

                  <h3 className="font-bold text-text-primary mb-1">{mod.title}</h3>
                  <p className="text-sm text-text-secondary mb-4 line-clamp-2">{mod.description}</p>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 text-xs text-text-secondary mb-3">
                    <span className="flex items-center gap-1">
                      <BookOpen size={12} />
                      {mod.lessonCount} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {mod.estimatedTime} min
                    </span>
                    <span className="flex items-center gap-1 text-primary font-semibold">
                      <Zap size={12} />
                      +{mod.xpReward} XP
                    </span>
                  </div>

                  {/* Progress bar */}
                  {prog ? (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text-secondary">
                          {prog.lessonsCompleted}/{mod.lessonCount} lessons
                        </span>
                        <span className={isCompleted ? 'text-primary font-semibold' : 'text-text-secondary'}>
                          {isCompleted ? '✓ Completed' : `${pct}%`}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-1.5 bg-gray-100 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </Container>

      <BottomNav />
    </div>
  )
}


