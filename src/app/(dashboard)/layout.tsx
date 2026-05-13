// src/app/(dashboard)/layout.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AIChat } from '@/components/chat/AIChat'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
      {/* AI Coach floats above BottomNav on every dashboard page */}
      <AIChat />
    </div>
  )
}


