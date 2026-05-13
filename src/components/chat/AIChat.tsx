'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { X, Send, Loader2, MessageCircle, ThumbsUp, ThumbsDown, ChevronDown, Sparkles, RotateCcw } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  helpful?: boolean | null
  fromHistory?: boolean
}

interface ChatContext {
  lessonTitle?: string
  lessonContent?: string
}

// ─── Suggested prompts ────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  "What's the 50/30/20 rule?",
  "Why is diversification important?",
  "How do I start investing with a small amount?",
  "What is a P/E ratio?",
  "Explain index funds in simple terms",
  "What's the difference between investing and trading?",
]

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  onFeedback,
}: {
  msg: Message
  onFeedback: (id: string, helpful: boolean) => void
}) {
  const isUser = msg.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
          <Sparkles size={13} className="text-white" />
        </div>
      )}
      <div className={`max-w-[82%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-primary text-white rounded-br-sm'
              : 'bg-white text-text-primary rounded-bl-sm shadow-sm border border-divider'
          }`}
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {msg.content}
        </div>
        {/* Feedback buttons for assistant messages */}
        {!isUser && !msg.fromHistory && msg.helpful === undefined && (
          <div className="flex items-center gap-1 mt-1 ml-1">
            <button
              onClick={() => onFeedback(msg.id, true)}
              className="p-1 rounded-md text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors"
              title="Helpful"
            >
              <ThumbsUp size={11} />
            </button>
            <button
              onClick={() => onFeedback(msg.id, false)}
              className="p-1 rounded-md text-text-secondary hover:text-red-400 hover:bg-red-50 transition-colors"
              title="Not helpful"
            >
              <ThumbsDown size={11} />
            </button>
          </div>
        )}
        {msg.helpful === true && (
          <p className="text-xs text-primary ml-1 mt-1">👍 Glad that helped!</p>
        )}
        {msg.helpful === false && (
          <p className="text-xs text-text-secondary ml-1 mt-1">Thanks for the feedback.</p>
        )}
      </div>
    </div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
        <Sparkles size={13} className="text-white" />
      </div>
      <div className="bg-white border border-divider rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Chat Component ──────────────────────────────────────────────────────

export function AIChat({ context }: { context?: ChatContext }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Hide on auth/onboarding/admin pages
  const hiddenOn = ['/sign-in', '/sign-up', '/onboarding', '/admin']
  if (hiddenOn.some(p => pathname.startsWith(p))) return null

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (open) scrollToBottom()
  }, [messages, open, scrollToBottom])

  // Load history when first opened
  useEffect(() => {
    if (open && !historyLoaded) {
      loadHistory()
    }
    if (open) {
      setUnreadCount(0)
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/chat')
      const data = await res.json()
      if (data.history?.length) {
        const msgs: Message[] = []
        for (const h of data.history) {
          msgs.push({
            id: `h-user-${h.id}`,
            role: 'user',
            content: h.question,
            createdAt: new Date(h.createdAt),
            fromHistory: true,
          })
          msgs.push({
            id: `h-ai-${h.id}`,
            role: 'assistant',
            content: h.answer,
            createdAt: new Date(h.createdAt),
            helpful: h.helpful,
            fromHistory: true,
          })
        }
        setMessages(msgs)
      }
    } catch {
      // ignore
    } finally {
      setHistoryLoaded(true)
    }
  }

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: msg,
      createdAt: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, context }),
      })
      const data = await res.json()

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.answer ?? 'Sorry, I had trouble responding. Please try again.',
        createdAt: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])

      if (!open) setUnreadCount(c => c + 1)
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Something went wrong. Please check your connection and try again.',
        createdAt: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (msgId: string, helpful: boolean) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, helpful } : m))
    // Could wire up to PATCH /api/chat/:id if needed
  }

  const clearChat = () => {
    setMessages([])
    setHistoryLoaded(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const isEmpty = messages.length === 0 && historyLoaded

  return (
    <>
      {/* ── Floating button ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          open ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{ background: 'linear-gradient(135deg, #00C853, #00A043)' }}
        aria-label="Open AI Coach"
      >
        <MessageCircle size={24} className="text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* ── Chat drawer ─────────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxWidth: '480px', margin: '0 auto' }}
      >
        <div
          className="flex flex-col rounded-t-2xl overflow-hidden shadow-2xl"
          style={{ height: '82vh', background: '#F5F5F5' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1A1A2E, #0A3D2B)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">InnoG</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  AI Investing Coach · Powered by GPT-4
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                  title="Clear chat"
                >
                  <RotateCcw size={15} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
              >
                <ChevronDown size={20} />
              </button>
            </div>
          </div>

          {/* Context pill — shows if inside a lesson */}
          {context?.lessonTitle && (
            <div className="px-4 py-2 bg-primary/5 border-b border-divider flex-shrink-0">
              <p className="text-xs text-primary font-medium">
                📖 Asking about: {context.lessonTitle}
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {/* Empty state */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles size={28} className="text-primary" />
                </div>
                <p className="font-bold text-text-primary mb-1">Hi, I'm InnoG!</p>
                <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                  Your AI investing coach. Ask me anything about stocks, investing, or what you're learning.
                </p>
                {/* Suggested prompts */}
                <div className="w-full space-y-2">
                  {SUGGESTED_PROMPTS.slice(0, 4).map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="w-full text-left text-sm px-4 py-2.5 bg-white rounded-xl border border-divider text-text-primary hover:border-primary hover:text-primary transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading history */}
            {!historyLoaded && (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="text-primary animate-spin" />
              </div>
            )}

            {/* Messages */}
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} onFeedback={handleFeedback} />
            ))}

            {/* Typing indicator */}
            {loading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested prompts strip (when there are messages) */}
          {messages.length > 0 && !loading && (
            <div className="flex gap-2 px-3 pb-2 overflow-x-auto flex-shrink-0">
              {SUGGESTED_PROMPTS.slice(0, 3).map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 bg-white rounded-full border border-divider text-text-secondary hover:border-primary hover:text-primary transition-all whitespace-nowrap"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="px-3 pb-4 pt-2 bg-white border-t border-divider flex-shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about investing, stocks, or your lessons…"
                rows={1}
                disabled={loading}
                className="flex-1 resize-none text-sm px-3.5 py-2.5 rounded-xl border border-divider focus:outline-none focus:border-primary bg-background-gray disabled:opacity-50 transition-all"
                style={{ maxHeight: '100px', overflowY: 'auto' }}
                onInput={e => {
                  const t = e.target as HTMLTextAreaElement
                  t.style.height = 'auto'
                  t.style.height = Math.min(t.scrollHeight, 100) + 'px'
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 transition-all hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={16} className="text-white animate-spin" />
                ) : (
                  <Send size={16} className="text-white" />
                )}
              </button>
            </div>
            <p className="text-xs text-text-secondary mt-1.5 text-center">
              InnoG can make mistakes. Don't treat responses as financial advice.
            </p>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}


