import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tradeo - Learn to Invest Like Playing a Game',
  description: 'Master the stock market with bite-sized lessons, risk-free simulation, and compete with friends. Built for Southeast Asian youth aged 18-25.',
  keywords: ['investing', 'stock market', 'financial literacy', 'Southeast Asia', 'gamified learning', 'trading simulator'],
  authors: [{ name: 'Tradeo' }],
  openGraph: {
    title: 'Tradeo - Learn to Invest Like Playing a Game',
    description: 'Master the stock market with bite-sized lessons, risk-free simulation, and compete with friends.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tradeo - Learn to Invest Like Playing a Game',
    description: 'Master the stock market with bite-sized lessons, risk-free simulation, and compete with friends.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body className="min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}


