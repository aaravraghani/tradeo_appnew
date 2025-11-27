'use client'

import React from 'react'
import { SignUpButton } from '@clerk/nextjs'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { FadeIn } from '@/components/animations/FadeIn'
import { APP_TAGLINE, APP_DESCRIPTION } from '@/lib/constants'
import { ArrowRight, TrendingUp, Award, Zap } from 'lucide-react'

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-primary/5 via-white to-primary/10 pt-16">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
          {/* Left Content */}
          <div className="space-y-8">
            <FadeIn delay={0.1}>
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                <Zap size={16} className="mr-2" />
                Now Live in Southeast Asia
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="text-h1-mobile md:text-h1 text-text-primary">
                {APP_TAGLINE}
              </h1>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="text-body-mobile md:text-body text-text-secondary max-w-xl">
                {APP_DESCRIPTION}
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4">
                <SignUpButton mode="modal">
                  <Button size="lg" className="group">
                    Start Learning Free
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                  </Button>
                </SignUpButton>
                <Button variant="secondary" size="lg" href="#features">
                  See How It Works
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center text-sm text-text-secondary">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-2">
                    ✓
                  </div>
                  100% Free to Start
                </div>
                <div className="flex items-center text-sm text-text-secondary">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-2">
                    ✓
                  </div>
                  No Credit Card Required
                </div>
                <div className="flex items-center text-sm text-text-secondary">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-2">
                    ✓
                  </div>
                  Ages 18-25
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Content - Animated Elements */}
          <FadeIn delay={0.3} direction="left" className="relative">
            <div className="relative">
              {/* Main Phone Mockup Placeholder */}
              <div className="relative z-10 mx-auto w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl p-6 border-8 border-gray-800">
                  {/* Phone Screen Content */}
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary">Welcome back! 👋</p>
                        <h3 className="text-lg font-semibold text-text-primary">Your Progress</h3>
                      </div>
                      <div className="bg-accent-yellow/20 px-3 py-1 rounded-full">
                        <span className="text-sm font-bold">7🔥</span>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-primary/10 rounded-lg p-4">
                        <TrendingUp className="text-primary mb-2" size={24} />
                        <p className="text-2xl font-bold text-text-primary">+12.5%</p>
                        <p className="text-xs text-text-secondary">Portfolio</p>
                      </div>
                      <div className="bg-accent-blue/10 rounded-lg p-4">
                        <Award className="text-accent-blue mb-2" size={24} />
                        <p className="text-2xl font-bold text-text-primary">850</p>
                        <p className="text-xs text-text-secondary">XP Points</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Module Progress</span>
                        <span className="text-primary font-semibold">75%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>

                    {/* Daily Mission */}
                    <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg p-4 text-white">
                      <p className="text-sm font-semibold mb-1">Daily Mission</p>
                      <p className="text-xs opacity-90">Complete 2 lessons today</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-primary text-white px-4 py-2 rounded-lg shadow-lg animate-float">
                <p className="text-sm font-semibold">+50 XP</p>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-accent-yellow text-text-primary px-4 py-2 rounded-lg shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                <p className="text-sm font-semibold">🏆 Badge Earned!</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>

      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/30 rounded-full blur-3xl opacity-20"></div>
    </section>
  )
}


