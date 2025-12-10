import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StreakCard } from '@/components/dashboard/StreakCard'
import { DailyMission } from '@/components/dashboard/DailyMission'
import { LearningProgress } from '@/components/dashboard/LearningProgress'
import { PortfolioSnapshot } from '@/components/dashboard/PortfolioSnapshot'
import { QuickStats } from '@/components/dashboard/QuickStats'
import { QuickAccessCards } from '@/components/dashboard/QuickAccessCards'
import { BottomNav } from '@/components/dashboard/BottomNav'

export default async function HomePage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const user = await currentUser()
  const firstName = user?.firstName || 'there'

  return (
    <div className="min-h-screen bg-background-gray pb-20">
      <DashboardHeader userName={firstName} />
      
      <Container className="py-6 space-y-6">
        {/* Greeting & Streak */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-text-primary">
            Welcome back, {firstName}! 👋
          </h1>
          <StreakCard currentStreak={7} />
        </div>

        {/* Daily Mission */}
        <DailyMission />

        {/* Learning Progress */}
        <LearningProgress 
          currentModule="Stock Market Basics"
          progress={75}
          lessonsCompleted={8}
          totalLessons={10}
        />

        {/* Portfolio Snapshot */}
        <PortfolioSnapshot 
          portfolioValue={112450}
          dailyChange={2.5}
          topGainer={{ name: "GoTo", change: 8.3 }}
          topLoser={{ name: "Sea Ltd", change: -2.1 }}
        />

        {/* Quick Stats */}
        <QuickStats 
          totalLessons={28}
          xpPoints={850}
          rank={12}
          badges={8}
        />

        {/* Quick Access */}
        <QuickAccessCards />
      </Container>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}




