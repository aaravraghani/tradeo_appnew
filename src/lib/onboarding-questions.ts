
export interface OnboardingQuestion {
  id: string
  question: string
  options: {
    value: string
    label: string
    icon?: string
  }[]
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'location',
    question: 'Where are you from?',
    options: [
      { value: 'indonesia', label: 'Indonesia', icon: '🇮🇩' },
      { value: 'southeast_asia', label: 'Southeast Asia (outside Indonesia)', icon: '🌏' },
      { value: 'outside_sea', label: 'Outside Southeast Asia', icon: '🌍' },
    ],
  },
  {
    id: 'experience',
    question: "What's your investing experience?",
    options: [
      { value: 'never', label: "I've never invested before", icon: '🌱' },
      { value: 'little', label: 'I know a little about investing', icon: '📚' },
      { value: 'invested', label: "I've invested before", icon: '📈' },
      { value: 'regular', label: 'I invest regularly', icon: '💼' },
    ],
  },
  {
    id: 'goal',
    question: 'Why do you want to learn investing?',
    options: [
      { value: 'grow_money', label: 'To grow my money in the future', icon: '💰' },
      { value: 'learning', label: 'For school or personal learning', icon: '🎓' },
      { value: 'independence', label: 'To prepare for financial independence', icon: '🚀' },
      { value: 'curious', label: 'Just curious', icon: '🤔' },
    ],
  },
  {
    id: 'riskTolerance',
    question: 'How comfortable are you with risk?',
    options: [
      { value: 'no_loss', label: "I don't want to lose money", icon: '🛡️' },
      { value: 'small_risk', label: 'Small risks are okay', icon: '⚖️' },
      { value: 'ups_downs', label: "I'm okay with ups and downs", icon: '📊' },
      { value: 'high_risk', label: 'I like high-risk, high-reward', icon: '🎲' },
    ],
  },
  {
    id: 'investmentHorizon',
    question: 'How long would you invest for?',
    options: [
      { value: 'less_1y', label: 'Less than 1 year', icon: '⏱️' },
      { value: '1_3y', label: '1–3 years', icon: '📅' },
      { value: '3_5y', label: '3–5 years', icon: '🗓️' },
      { value: 'more_5y', label: 'More than 5 years', icon: '🌳' },
    ],
  },
  {
    id: 'learningStyle',
    question: 'How do you prefer learning?',
    options: [
      { value: 'quick_tips', label: 'Quick tips', icon: '⚡' },
      { value: 'step_by_step', label: 'Step-by-step lessons', icon: '📖' },
      { value: 'practice', label: 'Practice simulations', icon: '🎮' },
      { value: 'videos', label: 'Videos and examples', icon: '🎥' },
    ],
  },
  {
    id: 'appUsageFrequency',
    question: 'How often do you want to use the app?',
    options: [
      { value: 'daily', label: 'Every day', icon: '🔥' },
      { value: 'few_week', label: 'A few times a week', icon: '📆' },
      { value: 'once_week', label: 'Once a week', icon: '📌' },
      { value: 'occasional', label: 'Occasionally', icon: '🌙' },
    ],
  },
]

export const getTotalQuestions = () => ONBOARDING_QUESTIONS.length

export const getQuestionById = (id: string) => 
  ONBOARDING_QUESTIONS.find(q => q.id === id)

export const getNextQuestionId = (currentId: string): string | null => {
  const currentIndex = ONBOARDING_QUESTIONS.findIndex(q => q.id === currentId)
  if (currentIndex === -1 || currentIndex === ONBOARDING_QUESTIONS.length - 1) {
    return null
  }
  return ONBOARDING_QUESTIONS[currentIndex + 1].id
}

export const getPreviousQuestionId = (currentId: string): string | null => {
  const currentIndex = ONBOARDING_QUESTIONS.findIndex(q => q.id === currentId)
  if (currentIndex <= 0) {
    return null
  }
  return ONBOARDING_QUESTIONS[currentIndex - 1].id
}

export const getProgressPercentage = (currentId: string): number => {
  const currentIndex = ONBOARDING_QUESTIONS.findIndex(q => q.id === currentId)
  if (currentIndex === -1) return 0
  return Math.round(((currentIndex + 1) / ONBOARDING_QUESTIONS.length) * 100)
}


