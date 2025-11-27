'use client'

import React from 'react'
import { Container } from '@/components/ui/Container'
import { FadeIn } from '@/components/animations/FadeIn'
import { STATS, COUNTRIES } from '@/lib/constants'

export const Stats: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <Container>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {STATS.map((stat, index) => (
            <FadeIn key={stat.id} delay={index * 0.1}>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </p>
                <p className="text-text-secondary text-sm md:text-base">
                  {stat.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Localization Section */}
        <FadeIn delay={0.3}>
          <div className="text-center mb-12">
            <h2 className="text-h2-mobile md:text-h2 text-text-primary mb-4">
              Built for Southeast Asia
            </h2>
            <p className="text-body-mobile md:text-body text-text-secondary max-w-2xl mx-auto mb-8">
              Learn in your language with local examples from GoTo, Grab, Sea Limited & more
            </p>
          </div>
        </FadeIn>

        {/* Countries */}
        <FadeIn delay={0.4}>
          <div className="flex flex-wrap justify-center items-center gap-6">
            {COUNTRIES.map((country, index) => (
              <div
                key={country.code}
                className="flex items-center space-x-2 px-4 py-2 bg-background-gray rounded-lg hover:bg-primary/10 transition-colors"
              >
                <span className="text-3xl">{country.flag}</span>
                <span className="text-text-primary font-medium">{country.name}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Map Visual (Simplified) */}
        <FadeIn delay={0.5}>
          <div className="mt-16 relative">
            <div className="bg-gradient-to-br from-primary/5 to-primary/20 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">🌏</div>
              <p className="text-text-primary font-semibold text-lg">
                Supporting 6 countries across Southeast Asia
              </p>
              <p className="text-text-secondary mt-2">
                With more coming soon!
              </p>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  )
}


