'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp,
  BookOpen, Layers, Eye, EyeOff, GripVertical, ArrowLeft,
  AlertCircle, CheckCircle, Zap
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Block {
  type: string
  label?: string
  text?: string
  icon?: string
  title?: string
  question?: {
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
  }
  items?: { icon: string; title: string; description: string; type: 'consume' | 'own' }[]
  events?: { age: string; title: string; subtitle: string }[]
}

interface LessonDraft {
  id?: string
  title: string
  subtitle: string
  quote: string
  order: number
  duration: number
  xpReward: number
  isPublished: boolean
  blocks: Block[]
}

interface ModuleDraft {
  id?: string
  title: string
  description: string
  icon: string
  order: number
  difficulty: string
  estimatedTime: number
  xpReward: number
  isPublished: boolean
  lessons: LessonDraft[]
}

const BLOCK_TYPES = [
  { value: 'core_idea',         label: '📖 Core Idea' },
  { value: 'highlight',         label: '💡 Highlight Box' },
  { value: 'sea_example',       label: '🌏 SEA Example' },
  { value: 'concept',           label: '📝 Concept' },
  { value: 'key_takeaway',      label: '🔑 Key Takeaway' },
  { value: 'quiz',              label: '❓ Quick Check Quiz' },
  { value: 'interactive_chart', label: '📊 Interactive Chart' },
  { value: 'ownership_grid',    label: '⚖️ Ownership Grid' },
  { value: 'timeline',          label: '📅 Timeline' },
]

const emptyLesson = (): LessonDraft => ({
  title: '', subtitle: '', quote: '', order: 1,
  duration: 5, xpReward: 50, isPublished: false, blocks: [],
})

const emptyModule = (): ModuleDraft => ({
  title: '', description: '', icon: '📚', order: 1, difficulty: 'beginner',
  estimatedTime: 30, xpReward: 200, isPublished: false, lessons: [],
})

// ─── Block Editor ─────────────────────────────────────────────────────────────

function BlockEditor({ block, onChange, onDelete, idx }: {
  block: Block; onChange: (b: Block) => void; onDelete: () => void; idx: number
}) {
  const [open, setOpen] = useState(idx === 0)

  return (
    <div className="border border-divider rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-background-gray cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-text-secondary" />
          <span className="text-sm font-medium text-text-primary">
            {BLOCK_TYPES.find(t => t.value === block.type)?.label ?? block.type}
          </span>
          {block.text && (
            <span className="text-xs text-text-secondary truncate max-w-[160px]">— {block.text.slice(0, 40)}…</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); onDelete() }} className="text-text-secondary hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
          {open ? <ChevronUp size={16} className="text-text-secondary" /> : <ChevronDown size={16} className="text-text-secondary" />}
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-3">
          {/* Type selector */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">Block Type</label>
            <select
              value={block.type}
              onChange={e => onChange({ ...block, type: e.target.value })}
              className="w-full text-sm border border-divider rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-primary"
            >
              {BLOCK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Text/label for most blocks */}
          {['core_idea', 'highlight', 'sea_example', 'concept', 'key_takeaway'].includes(block.type) && (
            <>
              {['core_idea', 'concept'].includes(block.type) && (
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1 block">Label (optional)</label>
                  <input
                    type="text" value={block.label ?? ''} placeholder="e.g. The core idea"
                    onChange={e => onChange({ ...block, label: e.target.value })}
                    className="w-full text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                  />
                </div>
              )}
              {block.type === 'sea_example' && (
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1 block">Icon (emoji)</label>
                  <input
                    type="text" value={block.icon ?? '🌏'} maxLength={4}
                    onChange={e => onChange({ ...block, icon: e.target.value })}
                    className="w-24 text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Content</label>
                <textarea
                  value={block.text ?? ''} rows={3}
                  placeholder="Write the content for this block…"
                  onChange={e => onChange({ ...block, text: e.target.value })}
                  className="w-full text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </>
          )}

          {/* Interactive chart */}
          {block.type === 'interactive_chart' && (
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">Chart Title</label>
              <input
                type="text" value={block.title ?? ''} placeholder="e.g. Compound Growth Calculator"
                onChange={e => onChange({ ...block, title: e.target.value })}
                className="w-full text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-text-secondary mt-2">
                The interactive compound growth chart will be auto-rendered with sliders.
              </p>
            </div>
          )}

          {/* Quiz */}
          {block.type === 'quiz' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Question</label>
                <textarea
                  value={block.question?.question ?? ''} rows={2}
                  placeholder="Ask a question to check understanding…"
                  onChange={e => onChange({ ...block, question: { ...block.question!, question: e.target.value } })}
                  className="w-full text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary resize-none"
                />
              </div>
              {[0,1,2].map(i => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="radio"
                    name={`correct-${idx}`}
                    checked={(block.question?.correctAnswer ?? 0) === i}
                    onChange={() => onChange({ ...block, question: { ...block.question!, correctAnswer: i } })}
                    className="accent-primary flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={block.question?.options?.[i] ?? ''}
                    placeholder={`Option ${i + 1}${(block.question?.correctAnswer ?? 0) === i ? ' ✓ correct' : ''}`}
                    onChange={e => {
                      const opts = [...(block.question?.options ?? ['','',''])]
                      opts[i] = e.target.value
                      onChange({ ...block, question: { ...block.question!, options: opts } })
                    }}
                    className="flex-1 text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
              <p className="text-xs text-text-secondary">Select the radio button next to the correct answer.</p>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Explanation (shown after answer)</label>
                <textarea
                  value={block.question?.explanation ?? ''} rows={2}
                  placeholder="Explain why the correct answer is right…"
                  onChange={e => onChange({ ...block, question: { ...block.question!, explanation: e.target.value } })}
                  className="w-full text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
          )}

          {/* Ownership grid */}
          {block.type === 'ownership_grid' && (
            <div className="space-y-3">
              {(block.items ?? [{icon:'🎮',title:'Consumption',description:'',type:'consume'},{icon:'📈',title:'Ownership',description:'',type:'own'}]).map((item, i) => (
                <div key={i} className="border border-divider rounded-lg p-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text" value={item.icon} maxLength={4}
                      onChange={e => {
                        const items = [...(block.items ?? [])]
                        items[i] = { ...items[i], icon: e.target.value }
                        onChange({ ...block, items })
                      }}
                      className="w-16 text-sm border border-divider rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text" value={item.title} placeholder="Title"
                      onChange={e => {
                        const items = [...(block.items ?? [])]
                        items[i] = { ...items[i], title: e.target.value }
                        onChange({ ...block, items })
                      }}
                      className="flex-1 text-sm border border-divider rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
                    />
                    <select
                      value={item.type}
                      onChange={e => {
                        const items = [...(block.items ?? [])]
                        items[i] = { ...items[i], type: e.target.value as 'consume'|'own' }
                        onChange({ ...block, items })
                      }}
                      className="text-sm border border-divider rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
                    >
                      <option value="consume">Consume (red)</option>
                      <option value="own">Own (green)</option>
                    </select>
                  </div>
                  <textarea
                    value={item.description} rows={2} placeholder="Description…"
                    onChange={e => {
                      const items = [...(block.items ?? [])]
                      items[i] = { ...items[i], description: e.target.value }
                      onChange({ ...block, items })
                    }}
                    className="w-full text-sm border border-divider rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Timeline */}
          {block.type === 'timeline' && (
            <div className="space-y-2">
              {(block.events ?? [{age:'',title:'',subtitle:''}]).map((ev, i) => (
                <div key={i} className="border border-divider rounded-lg p-3 space-y-2">
                  <input
                    type="text" value={ev.age} placeholder="Age / label (e.g. Age 22)"
                    onChange={e => {
                      const events = [...(block.events ?? [])]
                      events[i] = { ...events[i], age: e.target.value }
                      onChange({ ...block, events })
                    }}
                    className="w-full text-sm border border-divider rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text" value={ev.title} placeholder="Main text"
                    onChange={e => {
                      const events = [...(block.events ?? [])]
                      events[i] = { ...events[i], title: e.target.value }
                      onChange({ ...block, events })
                    }}
                    className="w-full text-sm border border-divider rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text" value={ev.subtitle} placeholder="Sub-text"
                    onChange={e => {
                      const events = [...(block.events ?? [])]
                      events[i] = { ...events[i], subtitle: e.target.value }
                      onChange({ ...block, events })
                    }}
                    className="w-full text-sm border border-divider rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => {
                      const events = (block.events ?? []).filter((_, j) => j !== i)
                      onChange({ ...block, events })
                    }}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Remove event
                  </button>
                </div>
              ))}
              <button
                onClick={() => onChange({ ...block, events: [...(block.events ?? []), { age: '', title: '', subtitle: '' }] })}
                className="text-xs text-primary hover:text-primary-dark font-medium"
              >
                + Add event
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Lesson Editor ────────────────────────────────────────────────────────────

function LessonEditor({ lesson, idx, onChange, onDelete }: {
  lesson: LessonDraft; idx: number; onChange: (l: LessonDraft) => void; onDelete: () => void
}) {
  const [open, setOpen] = useState(false)

  const addBlock = (type: string) => {
    const base: Block = { type }
    if (type === 'quiz') base.question = { question: '', options: ['', '', ''], correctAnswer: 0, explanation: '' }
    if (type === 'ownership_grid') base.items = [
      { icon: '🎮', title: 'Consumption', description: '', type: 'consume' },
      { icon: '📈', title: 'Ownership', description: '', type: 'own' },
    ]
    if (type === 'timeline') base.events = [{ age: '', title: '', subtitle: '' }]
    onChange({ ...lesson, blocks: [...lesson.blocks, base] })
  }

  return (
    <div className="border border-divider rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3.5 bg-background-gray cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
            {idx + 1}
          </span>
          <span className="text-sm font-semibold text-text-primary">
            {lesson.title || <span className="text-text-secondary font-normal italic">Untitled lesson</span>}
          </span>
          <span className="text-xs text-text-secondary">{lesson.blocks.length} blocks</span>
          {lesson.isPublished && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Published</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); onDelete() }} className="text-text-secondary hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
          {open ? <ChevronUp size={16} className="text-text-secondary" /> : <ChevronDown size={16} className="text-text-secondary" />}
        </div>
      </div>

      {open && (
        <div className="p-5 space-y-4 border-t border-divider">
          {/* Lesson meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-text-secondary mb-1 block">Lesson Title *</label>
              <input
                type="text" value={lesson.title} placeholder="e.g. What money actually represents"
                onChange={e => onChange({ ...lesson, title: e.target.value })}
                className="w-full text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-text-secondary mb-1 block">Subtitle / Hook line</label>
              <input
                type="text" value={lesson.subtitle} placeholder="e.g. A question that challenges assumptions"
                onChange={e => onChange({ ...lesson, subtitle: e.target.value })}
                className="w-full text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-text-secondary mb-1 block">Opening Quote</label>
              <input
                type="text" value={lesson.quote} placeholder='"Money is just paper" — but is it?'
                onChange={e => onChange({ ...lesson, quote: e.target.value })}
                className="w-full text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">Duration (min)</label>
              <input
                type="number" value={lesson.duration} min={1} max={60}
                onChange={e => onChange({ ...lesson, duration: Number(e.target.value) })}
                className="w-full text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">XP Reward</label>
              <input
                type="number" value={lesson.xpReward} min={10} step={10}
                onChange={e => onChange({ ...lesson, xpReward: Number(e.target.value) })}
                className="w-full text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox" id={`pub-${idx}`} checked={lesson.isPublished}
                onChange={e => onChange({ ...lesson, isPublished: e.target.checked })}
                className="accent-primary"
              />
              <label htmlFor={`pub-${idx}`} className="text-sm text-text-primary">Publish this lesson</label>
            </div>
          </div>

          {/* Blocks */}
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Content Blocks</p>
            <div className="space-y-2 mb-3">
              {lesson.blocks.map((block, bi) => (
                <BlockEditor
                  key={bi} block={block} idx={bi}
                  onChange={b => {
                    const blocks = [...lesson.blocks]
                    blocks[bi] = b
                    onChange({ ...lesson, blocks })
                  }}
                  onDelete={() => onChange({ ...lesson, blocks: lesson.blocks.filter((_, j) => j !== bi) })}
                />
              ))}
            </div>

            {/* Add block */}
            <div className="flex flex-wrap gap-1.5">
              {BLOCK_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => addBlock(t.value)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-dashed border-divider text-text-secondary hover:border-primary hover:text-primary transition-colors"
                >
                  + {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminLearnPage() {
  const router = useRouter()
  const [modules, setModules] = useState<ModuleDraft[]>([])
  const [editing, setEditing] = useState<ModuleDraft | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [loading, setLoading] = useState(true)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch('/api/admin/modules')
      .then(r => r.json())
      .then(d => { setModules(d.modules ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const saveModule = async () => {
    if (!editing) return
    setSaving(true)
    try {
      const method = editing.id ? 'PUT' : 'POST'
      const url = editing.id ? `/api/admin/modules/${editing.id}` : '/api/admin/modules'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      if (!res.ok) throw new Error('Save failed')
      const saved = await res.json()
      setModules(prev =>
        editing.id
          ? prev.map(m => m.id === editing.id ? saved.module : m)
          : [...prev, saved.module]
      )
      setEditing(null)
      showToast(editing.id ? 'Module updated!' : 'Module created!')
    } catch {
      showToast('Failed to save. Please try again.', false)
    }
    setSaving(false)
  }

  const deleteModule = async (id: string) => {
    if (!confirm('Delete this module and all its lessons?')) return
    await fetch(`/api/admin/modules/${id}`, { method: 'DELETE' })
    setModules(prev => prev.filter(m => m.id !== id))
    showToast('Module deleted.')
  }

  const togglePublish = async (mod: ModuleDraft) => {
    const updated = { ...mod, isPublished: !mod.isPublished }
    await fetch(`/api/admin/modules/${mod.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setModules(prev => prev.map(m => m.id === mod.id ? updated : m))
    showToast(updated.isPublished ? 'Module published' : 'Module unpublished')
  }

  return (
    <div className="min-h-screen bg-background-gray">
      {/* Header */}
      <div className="bg-white border-b border-divider sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/home')}
              className="text-text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="text-sm font-bold text-text-primary">Admin — Learn Content</span>
          </div>
          <button
            onClick={() => setEditing({ ...emptyModule(), order: modules.length + 1 })}
            className="flex items-center gap-1.5 text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus size={16} />
            New Module
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-16 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${toast.ok ? 'bg-primary' : 'bg-red-500'}`}>
          {toast.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Module list */}
        {!editing && (
          <>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              {modules.length} Module{modules.length !== 1 ? 's' : ''}
            </p>

            {loading ? (
              <div className="space-y-3">
                {[1,2].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-5 animate-pulse shadow-card">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : modules.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-card p-10 text-center">
                <Layers size={36} className="mx-auto text-gray-300 mb-3" />
                <p className="font-semibold text-text-primary mb-1">No modules yet</p>
                <p className="text-sm text-text-secondary">Click "New Module" to create your first one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {modules.map(mod => (
                  <div key={mod.id} className="bg-white rounded-2xl shadow-card p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{mod.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-text-primary">{mod.title}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${mod.isPublished ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-text-secondary'}`}>
                              {mod.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary mt-0.5">{mod.description}</p>
                          <div className="flex gap-3 mt-1.5 text-xs text-text-secondary">
                            <span>Module {mod.order}</span>
                            <span>{mod.difficulty}</span>
                            <span>{(mod.lessons ?? []).length} lessons</span>
                            <span className="text-primary font-semibold">+{mod.xpReward} XP</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePublish(mod)}
                          className="p-2 rounded-lg hover:bg-background-gray transition-colors text-text-secondary hover:text-primary"
                          title={mod.isPublished ? 'Unpublish' : 'Publish'}
                        >
                          {mod.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => setEditing(mod)}
                          className="p-2 rounded-lg hover:bg-background-gray transition-colors text-text-secondary hover:text-primary"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => mod.id && deleteModule(mod.id)}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors text-text-secondary hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Module editor */}
        {editing && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-text-primary">{editing.id ? 'Edit Module' : 'New Module'}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(null)}
                  className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-divider text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X size={15} />
                  Cancel
                </button>
                <button
                  onClick={saveModule}
                  disabled={saving || !editing.title}
                  className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-40"
                >
                  <Save size={15} />
                  {saving ? 'Saving…' : 'Save Module'}
                </button>
              </div>
            </div>

            {/* Module meta */}
            <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Module Details</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-text-secondary mb-1 block">Module Title *</label>
                  <input
                    type="text" value={editing.title} placeholder="e.g. Money & Wealth Foundations"
                    onChange={e => setEditing({ ...editing, title: e.target.value })}
                    className="w-full text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-text-secondary mb-1 block">Description</label>
                  <textarea
                    value={editing.description} rows={2} placeholder="Brief description of what students will learn…"
                    onChange={e => setEditing({ ...editing, description: e.target.value })}
                    className="w-full text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1 block">Icon (emoji)</label>
                  <input
                    type="text" value={editing.icon} maxLength={4}
                    onChange={e => setEditing({ ...editing, icon: e.target.value })}
                    className="w-full text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1 block">Module Order</label>
                  <input
                    type="number" value={editing.order} min={1}
                    onChange={e => setEditing({ ...editing, order: Number(e.target.value) })}
                    className="w-full text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1 block">Difficulty</label>
                  <select
                    value={editing.difficulty}
                    onChange={e => setEditing({ ...editing, difficulty: e.target.value })}
                    className="w-full text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1 block">Est. Time (min)</label>
                  <input
                    type="number" value={editing.estimatedTime} min={5}
                    onChange={e => setEditing({ ...editing, estimatedTime: Number(e.target.value) })}
                    className="w-full text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1 block">XP Reward</label>
                  <input
                    type="number" value={editing.xpReward} min={50} step={50}
                    onChange={e => setEditing({ ...editing, xpReward: Number(e.target.value) })}
                    className="w-full text-sm border border-divider rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <input
                    type="checkbox" id="mod-pub" checked={editing.isPublished}
                    onChange={e => setEditing({ ...editing, isPublished: e.target.checked })}
                    className="accent-primary"
                  />
                  <label htmlFor="mod-pub" className="text-sm text-text-primary">Publish module (visible to students)</label>
                </div>
              </div>
            </div>

            {/* Lessons */}
            <div className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Lessons ({editing.lessons.length})
                </p>
                <button
                  onClick={() => setEditing({ ...editing, lessons: [...editing.lessons, { ...emptyLesson(), order: editing.lessons.length + 1 }] })}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  <Plus size={14} />
                  Add Lesson
                </button>
              </div>

              {editing.lessons.length === 0 ? (
                <div className="text-center py-6 text-text-secondary text-sm">
                  No lessons yet. Click "Add Lesson" to start building.
                </div>
              ) : (
                <div className="space-y-3">
                  {editing.lessons.map((lesson, i) => (
                    <LessonEditor
                      key={i} lesson={lesson} idx={i}
                      onChange={l => {
                        const lessons = [...editing.lessons]
                        lessons[i] = l
                        setEditing({ ...editing, lessons })
                      }}
                      onDelete={() => setEditing({ ...editing, lessons: editing.lessons.filter((_, j) => j !== i) })}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


