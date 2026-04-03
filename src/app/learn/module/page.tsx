'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { Container } from '@/components/ui/Container'
import { ChevronLeft, ChevronRight, CheckCircle, Zap, Clock, BookOpen, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface LessonBlock {
  type: 'core_idea' | 'highlight' | 'sea_example' | 'concept' | 'key_takeaway' | 'quiz' | 'interactive_chart' | 'ownership_grid' | 'timeline'
  label?: string
  text?: string
  icon?: string
  title?: string
  description?: string
  // for quiz
  question?: QuizQuestion
  // for chart — JSON string of config
  chartConfig?: string
  // for ownership grid
  items?: { icon: string; title: string; description: string; type: 'consume' | 'own' }[]
  // for timeline
  events?: { age: string; title: string; subtitle: string }[]
}

interface Lesson {
  id: string
  title: string
  subtitle: string
  quote: string
  order: number
  duration: number
  xpReward: number
  blocks: LessonBlock[]
  isCompleted?: boolean
}

interface ModuleData {
  id: string
  title: string
  icon: string
  order: number
  lessons: Lesson[]
  userProgress?: { progress: number; lessonsCompleted: number }
}

// ─── Block Renderers ──────────────────────────────────────────────────────────

function CoreIdeaBlock({ block }: { block: LessonBlock }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">{block.label || 'The core idea'}</p>
      <p className="text-sm text-text-primary leading-relaxed">{block.text}</p>
    </div>
  )
}

function HighlightBlock({ block }: { block: LessonBlock }) {
  return (
    <div className="bg-primary/8 border-l-4 border-primary rounded-r-xl px-4 py-3 my-4 text-sm text-primary/90 leading-relaxed"
         style={{ backgroundColor: 'rgba(0,200,83,0.06)' }}>
      {block.text}
    </div>
  )
}

function SeaExampleBlock({ block }: { block: LessonBlock }) {
  return (
    <div className="bg-primary/5 rounded-xl p-4 my-4 flex gap-3 items-start">
      <span className="text-xl flex-shrink-0 mt-0.5">{block.icon || '🌏'}</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">SEA Example</p>
        <p className="text-sm text-text-primary leading-relaxed">{block.text}</p>
      </div>
    </div>
  )
}

function ConceptBlock({ block }: { block: LessonBlock }) {
  return (
    <div className="mb-5">
      {block.label && (
        <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">{block.label}</p>
      )}
      <p className="text-sm text-text-primary leading-relaxed">{block.text}</p>
    </div>
  )
}

function KeyTakeawayBlock({ block }: { block: LessonBlock }) {
  return (
    <div className="flex gap-3 items-center bg-text-primary rounded-xl px-4 py-3.5 mt-5">
      <span className="text-lg flex-shrink-0">💡</span>
      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
        <span className="text-primary font-semibold">Key takeaway: </span>
        {block.text}
      </p>
    </div>
  )
}

function QuizBlock({ block }: { block: LessonBlock }) {
  const [selected, setSelected] = useState<number | null>(null)
  const q = block.question
  if (!q) return null

  const answered = selected !== null
  const isCorrect = selected === q.correctAnswer

  return (
    <div className="border border-divider rounded-xl p-4 my-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Quick Check</p>
      <p className="text-sm font-semibold text-text-primary mb-3">{q.question}</p>
      <div className="flex flex-col gap-2">
        {q.options.map((opt, i) => {
          let cls = 'text-sm px-4 py-2.5 rounded-lg border text-left transition-all '
          if (!answered) {
            cls += 'border-divider hover:border-primary hover:text-primary cursor-pointer bg-white'
          } else if (i === q.correctAnswer) {
            cls += 'border-primary bg-primary/5 text-primary font-medium'
          } else if (i === selected && !isCorrect) {
            cls += 'border-red-300 bg-red-50 text-red-600'
          } else {
            cls += 'border-divider bg-gray-50 text-text-secondary opacity-60'
          }
          return (
            <button key={i} className={cls} disabled={answered} onClick={() => setSelected(i)}>
              {answered && i === q.correctAnswer && '✓ '}
              {answered && i === selected && !isCorrect && '✗ '}
              {opt}
            </button>
          )
        })}
      </div>
      {answered && (
        <p className={`text-xs mt-3 leading-relaxed ${isCorrect ? 'text-primary' : 'text-red-500'}`}>
          {isCorrect ? '✓ ' : '✗ '}{q.explanation}
        </p>
      )}
    </div>
  )
}

function OwnershipGridBlock({ block }: { block: LessonBlock }) {
  const items = block.items ?? []
  return (
    <div className="grid grid-cols-2 gap-3 my-4">
      {items.map((item, i) => (
        <div key={i} className={`rounded-xl p-4 text-center ${item.type === 'consume' ? 'bg-red-50 border border-red-100' : 'bg-primary/5 border border-primary/20'}`}>
          <div className="text-2xl mb-1.5">{item.icon}</div>
          <p className={`text-sm font-semibold mb-1 ${item.type === 'consume' ? 'text-red-700' : 'text-primary'}`}>{item.title}</p>
          <p className={`text-xs leading-relaxed ${item.type === 'consume' ? 'text-red-600' : 'text-primary/70'}`}>{item.description}</p>
        </div>
      ))}
    </div>
  )
}

function TimelineBlock({ block }: { block: LessonBlock }) {
  const events = block.events ?? []
  return (
    <div className="relative pl-6 my-4">
      <div className="absolute left-2 top-2 bottom-2 w-px bg-divider" />
      {events.map((ev, i) => (
        <div key={i} className="relative mb-4">
          <div className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-primary" />
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">{ev.age}</p>
          <p className="text-sm text-text-primary">{ev.title}</p>
          <p className="text-xs text-text-secondary mt-0.5">{ev.subtitle}</p>
        </div>
      ))}
    </div>
  )
}

function InteractiveChartBlock({ block }: { block: LessonBlock }) {
  // Simple compound growth calculator — rendered from chartConfig JSON
  const [principal, setPrincipal] = useState(1000)
  const [rate, setRate] = useState(10)
  const [years, setYears] = useState(20)

  const final = principal * Math.pow(1 + rate / 100, years)
  const simple = principal + principal * (rate / 100) * years
  const gain = final - principal

  const fmt = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K'
    return Math.round(n).toString()
  }

  const points = [0, Math.round(years * 0.25), Math.round(years * 0.5), Math.round(years * 0.75), years]
  const vals = points.map(yr => principal * Math.pow(1 + rate / 100, yr))
  const maxV = vals[vals.length - 1]

  return (
    <div className="bg-background-gray rounded-xl p-4 my-4">
      <p className="text-sm font-semibold text-text-primary mb-3">{block.title || 'Compound Growth Calculator'}</p>

      <div className="space-y-3 mb-4">
        {[
          { label: 'Start', id: 'p', min: 100, max: 10000, step: 100, val: principal, set: setPrincipal, fmt: (v: number) => `$${v.toLocaleString()}` },
          { label: 'Return %', id: 'r', min: 2, max: 20, step: 1, val: rate, set: setRate, fmt: (v: number) => `${v}%` },
          { label: 'Years', id: 'y', min: 5, max: 40, step: 1, val: years, set: setYears, fmt: (v: number) => `${v}yr` },
        ].map(s => (
          <div key={s.id} className="flex items-center gap-3">
            <span className="text-xs text-text-secondary w-14 flex-shrink-0">{s.label}</span>
            <input
              type="range" min={s.min} max={s.max} step={s.step} value={s.val}
              onChange={e => s.set(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="text-xs font-semibold text-text-primary w-12 text-right">{s.fmt(s.val)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Final (compound)', val: `$${fmt(final)}`, color: 'text-primary' },
          { label: 'Simple interest', val: `$${fmt(simple)}`, color: 'text-accent-blue' },
          { label: 'Extra gained', val: `+$${fmt(gain)}`, color: 'text-primary' },
        ].map((r, i) => (
          <div key={i} className="bg-white rounded-lg p-2.5 text-center">
            <p className="text-xs text-text-secondary mb-1">{r.label}</p>
            <p className={`text-base font-bold ${r.color}`}>{r.val}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1.5 h-24">
        {points.map((yr, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <span className="text-xs text-text-secondary">${fmt(vals[i])}</span>
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: `${Math.round((vals[i] / maxV) * 72)}px`,
                backgroundColor: i === points.length - 1 ? '#00C853' : 'rgba(0,200,83,0.25)',
                minHeight: '4px',
              }}
            />
            <span className="text-xs text-text-secondary">yr{yr}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function renderBlock(block: LessonBlock, idx: number) {
  switch (block.type) {
    case 'core_idea':      return <CoreIdeaBlock key={idx} block={block} />
    case 'highlight':      return <HighlightBlock key={idx} block={block} />
    case 'sea_example':    return <SeaExampleBlock key={idx} block={block} />
    case 'concept':        return <ConceptBlock key={idx} block={block} />
    case 'key_takeaway':   return <KeyTakeawayBlock key={idx} block={block} />
    case 'quiz':           return <QuizBlock key={idx} block={block} />
    case 'ownership_grid': return <OwnershipGridBlock key={idx} block={block} />
    case 'timeline':       return <TimelineBlock key={idx} block={block} />
    case 'interactive_chart': return <InteractiveChartBlock key={idx} block={block} />
    default:               return null
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ModuleLessonPage() {
  const router = useRouter()
  const params = useParams()
  const moduleId = params?.moduleId as string

  const [data, setData] = useState<ModuleData | null>(null)
  const [currentLesson, setCurrentLesson] = useState(0)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!moduleId) return
    fetch(`/api/learn/modules/${moduleId}`)
      .then(r => r.json())
      .then(d => {
        setData(d)
        // Start on first incomplete lesson
        const firstIncomplete = d.lessons?.findIndex((l: Lesson) => !l.isCompleted) ?? 0
        setCurrentLesson(Math.max(0, firstIncomplete))
        const completed = new Set<string>(d.lessons?.filter((l: Lesson) => l.isCompleted).map((l: Lesson) => l.id) ?? [])
        setCompletedIds(completed)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [moduleId])

  const lesson = data?.lessons?.[currentLesson]
  const totalLessons = data?.lessons?.length ?? 0

  const goTo = (idx: number) => {
    setCurrentLesson(idx)
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const markComplete = async () => {
    if (!lesson || completing) return
    setCompleting(true)
    try {
      await fetch(`/api/learn/lessons/${lesson.id}/complete`, { method: 'POST' })
      setCompletedIds(prev => new Set([...prev, lesson.id]))
      if (currentLesson < totalLessons - 1) {
        setTimeout(() => { goTo(currentLesson + 1); setCompleting(false) }, 400)
      } else {
        setCompleting(false)
      }
    } catch {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-gray flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data || !lesson) {
    return (
      <div className="min-h-screen bg-background-gray flex items-center justify-center">
        <div className="text-center">
          <p className="font-semibold text-text-primary mb-2">Module not found</p>
          <button onClick={() => router.push('/learn')} className="text-primary text-sm underline">Back to Learn</button>
        </div>
      </div>
    )
  }

  const isCompleted = completedIds.has(lesson.id)
  const progressPct = totalLessons > 0 ? Math.round((completedIds.size / totalLessons) * 100) : 0

  return (
    <div className="min-h-screen bg-background-gray pb-24" ref={topRef}>
      <DashboardHeader userName="" />

      {/* Module header */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 60%, #0A3D2B 100%)' }}
      >
        {/* Decorative circle */}
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-10" style={{ background: '#00C853' }} />

        <Container className="py-5 max-w-2xl relative z-10">
          <button
            onClick={() => router.push('/learn')}
            className="flex items-center gap-1.5 text-sm mb-4 transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#00C853')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          >
            <ChevronLeft size={16} />
            Back to modules
          </button>

          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#00C853' }}>
            Module {data.order} · Tradeo
          </p>
          <h1 className="text-2xl font-bold text-white mb-1">{data.title}</h1>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {totalLessons} lessons · {data.lessons?.reduce((s, l) => s + l.duration, 0)} min total
          </p>

          {/* Progress dots */}
          <div className="flex gap-1.5">
            {data.lessons?.map((l, i) => (
              <button
                key={l.id}
                onClick={() => goTo(i)}
                className="h-1 flex-1 rounded-full transition-all"
                style={{
                  background: completedIds.has(l.id)
                    ? 'rgba(0,200,83,0.5)'
                    : i === currentLesson
                    ? '#00C853'
                    : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>
        </Container>
      </div>

      {/* Lesson nav pills */}
      <div className="bg-white border-b border-divider overflow-x-auto">
        <Container className="max-w-2xl">
          <div className="flex gap-1.5 py-2.5 w-max min-w-full">
            {data.lessons?.map((l, i) => (
              <button
                key={l.id}
                onClick={() => goTo(i)}
                className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  i === currentLesson
                    ? 'bg-text-primary text-primary border-text-primary'
                    : completedIds.has(l.id)
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-white text-text-secondary border-divider hover:border-primary/40'
                }`}
              >
                {completedIds.has(l.id) ? '✓ ' : `${i + 1}. `}
                {l.title.split(' ').slice(0, 3).join(' ')}…
              </button>
            ))}
          </div>
        </Container>
      </div>

      <Container className="py-5 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {/* Lesson hero */}
          <div className="bg-background-gray px-6 py-5 border-b border-divider">
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
              Lesson {lesson.order} of {totalLessons}
            </p>
            <h2 className="text-xl font-bold text-text-primary mb-2">{lesson.title}</h2>
            {lesson.subtitle && (
              <p className="text-sm text-text-secondary italic mb-2">{lesson.subtitle}</p>
            )}
            {lesson.quote && (
              <p className="text-sm text-text-secondary italic border-l-2 border-primary/40 pl-3">
                "{lesson.quote}"
              </p>
            )}
            <div className="flex gap-4 mt-3 text-xs text-text-secondary">
              <span className="flex items-center gap-1"><Clock size={11} />{lesson.duration} min</span>
              <span className="flex items-center gap-1 text-primary font-semibold"><Zap size={11} />+{lesson.xpReward} XP</span>
            </div>
          </div>

          {/* Lesson blocks */}
          <div className="px-6 py-5">
            {(lesson.blocks ?? []).map((block, i) => renderBlock(block, i))}

            {/* Nav footer */}
            <div className="flex items-center justify-between pt-5 mt-5 border-t border-divider">
              <button
                onClick={() => goTo(currentLesson - 1)}
                disabled={currentLesson === 0}
                className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-divider text-text-secondary hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Prev
              </button>

              <span className="text-xs text-text-secondary">{currentLesson + 1} / {totalLessons}</span>

              {currentLesson < totalLessons - 1 ? (
                <button
                  onClick={isCompleted ? () => goTo(currentLesson + 1) : markComplete}
                  disabled={completing}
                  className="flex items-center gap-1.5 text-sm px-5 py-2 rounded-lg font-semibold transition-all"
                  style={{ background: '#1A1A2E', color: '#00C853' }}
                >
                  {completing ? 'Saving…' : isCompleted ? 'Next →' : 'Complete & Continue →'}
                </button>
              ) : (
                <button
                  onClick={isCompleted ? () => router.push('/learn') : markComplete}
                  disabled={completing}
                  className="flex items-center gap-1.5 text-sm px-5 py-2 rounded-lg font-semibold bg-primary text-white transition-all hover:bg-primary-dark"
                >
                  {completing ? 'Saving…' : isCompleted ? '← Back to modules' : '🎉 Complete Module'}
                </button>
              )}
            </div>
          </div>
        </div>
      </Container>

      <BottomNav />
    </div>
  )
}


