'use client'

import React from 'react'
import { Container } from '@/components/ui/Container'
import { FadeIn } from '@/components/animations/FadeIn'
import { HOW_IT_WORKS } from '@/lib/constants'

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background-gray">
      <Container>
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-h2-mobile md:text-h2 text-text-primary mb-4">
              Start Your Investing Journey in 3 Steps
            </h2>
            <p className="text-body-mobile md:text-body text-text-secondary max-w-2xl mx-auto">
              Getting started is simple and free
            </p>
          </div>
        </FadeIn>

        {/* Desktop Timeline */}
        <div className="hidden md:block relative">
          {/* Connection Line */}
          <div className="absolute top-24 left-0 right-0 h-1 bg-divider">
            <div className="h-full bg-primary w-2/3"></div>
          </div>

          <div className="grid grid-cols-3 gap-8 relative">
            {HOW_IT_WORKS.map((step, index) => (
              <FadeIn key={step.id} delay={index * 0.15}>
                <div className="text-center">
                  {/* Step Number Circle */}
                  <div className="relative inline-block mb-8">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg relative z-10">
                      {step.id}
                    </div>
                    <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20"></div>
                  </div>

                  {/* Icon */}
                  <div className="text-5xl mb-4">{step.icon}</div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary">
                    {step.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="md:hidden space-y-8">
          {HOW_IT_WORKS.map((step, index) => (
            <FadeIn key={step.id} delay={index * 0.15}>
              <div className="flex items-start space-x-4">
                {/* Step Number and Line */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {step.id}
                  </div>
                  {index < HOW_IT_WORKS.length - 1 && (
                    <div className="w-1 h-16 bg-divider mt-2"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="text-4xl mb-3">{step.icon}</div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  )
}


