'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ONBOARDING_QUESTIONS,
  getProgressPercentage,
  getNextQuestionId,
  getPreviousQuestionId,
} from '@/lib/onboarding-questions'

export default function OnboardingPage() {
  const router = useRouter()
  const [currentId, setCurrentId] = useState(ONBOARDING_QUESTIONS[0].id)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentQuestion = ONBOARDING_QUESTIONS.find((q) => q.id === currentId)!
  const progress = getProgressPercentage(currentId)
  const nextId = getNextQuestionId(currentId)
  const prevId = getPreviousQuestionId(currentId)
  const isLast = nextId === null

  const selectAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentId]: value }))
  }

  const handleNext = () => {
    if (!answers[currentId]) return
    if (nextId) setCurrentId(nextId)
  }

  const handleBack = () => {
    if (prevId) setCurrentId(prevId)
  }

  const handleSubmit = async () => {
    if (!answers[currentId]) return
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Something went wrong')
      }

      router.push('/home')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-gray flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
            T
          </div>
          <span className="text-2xl font-bold text-text-primary">Tradeo</span>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-text-secondary mb-2">
            <span>Setting up your profile</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const selected = answers[currentId] === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => selectAnswer(option.value)}
                  className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    selected
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-gray-200 hover:border-primary/40 text-text-primary'
                  }`}
                >
                  {option.icon && (
                    <span className="text-2xl flex-shrink-0">{option.icon}</span>
                  )}
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={!prevId}
              className="px-5 py-2 rounded-lg border border-gray-200 text-text-secondary hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Back
            </button>

            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={!answers[currentId] || saving}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : 'Finish & Start Learning 🚀'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!answers[currentId]}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Step counter */}
        <p className="text-center text-sm text-text-secondary mt-4">
          Question{' '}
          {ONBOARDING_QUESTIONS.findIndex((q) => q.id === currentId) + 1} of{' '}
          {ONBOARDING_QUESTIONS.length}
        </p>
      </div>
    </div>
  )
}


