import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/landing/Hero'
import { ProblemStatement } from '@/components/landing/ProblemStatement'
import { Features } from '@/components/landing/Features'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Stats } from '@/components/landing/Stats'
import { CTASection } from '@/components/landing/CTASection'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <ProblemStatement />
      <Features />
      <HowItWorks />
      <Stats />
      <CTASection />
      <Footer />
    </main>
  )
}


