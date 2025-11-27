'use client'

import React from 'react'
import { SignUpButton } from '@clerk/nextjs'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { FadeIn } from '@/components/animations/FadeIn'
import { TRUST_BADGES } from '@/lib/constants'
import { ArrowRight, Sparkles } from 'lucide-react'

export const CTASection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <FadeIn>
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium mb-4">
              <Sparkles size={16} className="mr-2" />
              Join Thousands of Young Investors
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h2 className="text-h2-mobile md:text-h2 text-white">
              Ready to Start Your Investing Journey?
            </h2>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Take the first step towards financial freedom. Start learning today with zero risk.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  variant="secondary"
                  className="group bg-white text-primary hover:bg-gray-100 hover:text-primary-dark border-0"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Button>
              </SignUpButton>
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="flex flex-wrap justify-center items-center gap-6 pt-8">
              {TRUST_BADGES.map((badge, index) => (
                <div key={index} className="flex items-center text-white/90">
                  <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-sm font-medium">{badge}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div className="pt-8 text-white/70 text-sm">
              <p>No credit card required • Start learning in minutes</p>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  )
}


