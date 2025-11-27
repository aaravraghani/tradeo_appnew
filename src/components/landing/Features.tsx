'use client'

import React from 'react'
import { Container } from '@/components/ui/Container'
import { FadeIn } from '@/components/animations/FadeIn'
import { FEATURES } from '@/lib/constants'

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <Container>
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-h2-mobile md:text-h2 text-text-primary mb-4">
              Your Personal Investment Gym
            </h2>
            <p className="text-body-mobile md:text-body text-text-secondary max-w-2xl mx-auto">
              Everything you need to become a confident investor
            </p>
          </div>
        </FadeIn>

        <div className="space-y-24">
          {FEATURES.map((feature, index) => (
            <FadeIn key={feature.id} delay={index * 0.1}>
              <div
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="inline-block text-6xl mb-4">{feature.icon}</div>
                  <h3 className="text-h3-mobile md:text-h3 text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-xl text-text-primary font-medium">
                    {feature.description}
                  </p>
                  <p className="text-body-mobile md:text-body text-text-secondary">
                    {feature.subtitle}
                  </p>

                  {/* Feature-specific highlights */}
                  {feature.id === 1 && (
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span className="text-text-secondary">Complete micro-lessons in just 5 minutes</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span className="text-text-secondary">Earn XP and unlock achievements</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span className="text-text-secondary">Build daily streaks to stay motivated</span>
                      </li>
                    </ul>
                  )}

                  {feature.id === 2 && (
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span className="text-text-secondary">Practice with $100,000 virtual capital</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span className="text-text-secondary">Real-time data from major SEA exchanges</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span className="text-text-secondary">Learn from mistakes without losing money</span>
                      </li>
                    </ul>
                  )}

                  {feature.id === 3 && (
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span className="text-text-secondary">Ask questions anytime in your language</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span className="text-text-secondary">Get personalized portfolio recommendations</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span className="text-text-secondary">Learn at your own pace with AI support</span>
                      </li>
                    </ul>
                  )}

                  {feature.id === 4 && (
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span className="text-text-secondary">Compete on leaderboards with friends</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span className="text-text-secondary">Join weekly investment challenges</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span className="text-text-secondary">Share achievements and celebrate wins</span>
                      </li>
                    </ul>
                  )}
                </div>

                {/* Visual Mockup */}
                <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="bg-background-gray rounded-2xl p-8 shadow-xl">
                    {/* Feature-specific mockup */}
                    {feature.id === 1 && (
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border-l-4 border-primary">
                          <p className="text-sm font-semibold text-text-primary mb-2">Lesson 5: Understanding P/E Ratio</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-text-secondary">5 min read</span>
                            <span className="text-primary text-sm font-semibold">+50 XP</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-primary"></div>
                            <div className="w-8 h-8 rounded-full bg-accent-yellow"></div>
                            <div className="w-8 h-8 rounded-full bg-accent-blue"></div>
                          </div>
                          <p className="text-sm text-text-secondary">3 badges earned this week</p>
                        </div>
                      </div>
                    )}

                    {feature.id === 2 && (
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-text-secondary mb-1">Portfolio Value</p>
                          <p className="text-3xl font-bold text-primary">$112,450</p>
                          <p className="text-sm text-primary">+12.45% ↑</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-text-secondary">GoTo</p>
                            <p className="text-sm font-semibold text-primary">+8.3%</p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-text-secondary">Grab</p>
                            <p className="text-sm font-semibold text-primary">+15.7%</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {feature.id === 3 && (
                      <div className="space-y-3">
                        <div className="bg-primary/10 rounded-lg p-3 ml-auto max-w-[80%]">
                          <p className="text-sm text-text-primary">What is a dividend?</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 max-w-[80%]">
                          <p className="text-sm text-text-primary">A dividend is a payment made by a company to its shareholders, usually from profits. Think of it as a reward for owning the stock! 💰</p>
                        </div>
                      </div>
                    )}

                    {feature.id === 4 && (
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm font-semibold text-text-primary mb-3">Weekly Leaderboard</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-accent-yellow text-xl">🥇</span>
                                <span className="text-sm">Sarah K.</span>
                              </div>
                              <span className="text-sm font-semibold text-primary">+24.5%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-text-secondary text-xl">🥈</span>
                                <span className="text-sm">You</span>
                              </div>
                              <span className="text-sm font-semibold text-primary">+18.2%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-accent-orange text-xl">🥉</span>
                                <span className="text-sm">Mike R.</span>
                              </div>
                              <span className="text-sm font-semibold text-primary">+15.8%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  )
}


