'use client'

import React from 'react'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { FadeIn } from '@/components/animations/FadeIn'
import { PAIN_POINTS } from '@/lib/constants'

export const ProblemStatement: React.FC = () => {
  return (
    <section className="py-20 bg-background-gray">
      <Container>
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-h2-mobile md:text-h2 text-text-primary mb-4">
              Investing Shouldn't Feel Overwhelming
            </h2>
            <p className="text-body-mobile md:text-body text-text-secondary max-w-2xl mx-auto">
              We understand the challenges young investors face
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PAIN_POINTS.map((point, index) => (
            <FadeIn key={point.id} delay={index * 0.1}>
              <Card hover className="text-center h-full">
                <div className="text-6xl mb-4">{point.emoji}</div>
                <p className="text-lg text-text-primary font-medium">
                  {point.text}
                </p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  )
}


