// src/app/api/home/dashboard/route.ts
// GET /api/home/dashboard — single endpoint powering the home page
// Returns: streak, XP, level, missions, learning progress, portfolio snapshot, rank, badges

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        firstName: true,

        // Gamification
        profile: {
          select: {
            totalXP: true,
            level: true,
            currentStreak: true,
            longestStreak: true,
            totalLessonsCompleted: true,
            totalTradesMade: true,
          },
        },

        // Portfolio
        portfolio: {
          select: {
            cashBalance: true,
            totalValue: true,
            totalPnL: true,
            totalPnLPercent: true,
            holdings: {
              orderBy: { pnlPercent: 'desc' },
              select: {
                symbol: true,
                companyName: true,
                pnl: true,
                pnlPercent: true,
                totalValue: true,
              },
            },
          },
        },

        // Current learning module (most recently updated in-progress)
        progress: {
          where: { status: 'in_progress' },
          orderBy: { updatedAt: 'desc' },
          take: 1,
          select: {
            progress: true,
            module: {
              select: {
                title: true,
                icon: true,
                lessons: {
                  where: { isPublished: true },
                  select: { id: true },
                },
              },
            },
            lessons: {
              where: { isCompleted: true },
              select: { id: true },
            },
          },
        },

        // Daily missions
        missions: {
          where: {
            mission: { isActive: true, type: 'daily' },
          },
          select: {
            progress: true,
            isCompleted: true,
            mission: {
              select: {
                id: true,
                title: true,
                xpReward: true,
                requirements: true,
              },
            },
          },
          take: 3,
        },

        // Badge count
        badges: {
          select: { id: true },
        },
      },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Leaderboard rank — how many users have more XP than me
    const myXP = user.profile?.totalXP ?? 0
    const usersAhead = await prisma.userProfile.count({
      where: { totalXP: { gt: myXP } },
    })
    const rank = usersAhead + 1

    // Active module info
    const activeProgress = user.progress[0]
    const activeModule = activeProgress
      ? {
          title: activeProgress.module.title,
          icon: activeProgress.module.icon ?? '📚',
          progress: activeProgress.progress,
          lessonsCompleted: activeProgress.lessons.length,
          totalLessons: activeProgress.module.lessons.length,
        }
      : null

    // Portfolio snapshot
    const portfolio = user.portfolio
    const holdings = portfolio?.holdings ?? []
    const topGainer = holdings.length > 0
      ? { name: holdings[0].companyName, change: holdings[0].pnlPercent }
      : null
    // Loser = sort ascending by pnlPercent
    const losersSorted = [...holdings].sort((a, b) => a.pnlPercent - b.pnlPercent)
    const topLoser = losersSorted.length > 0
      ? { name: losersSorted[0].companyName, change: losersSorted[0].pnlPercent }
      : null

    // Shape missions for DailyMission component
    const dailyMissions = user.missions.map(m => {
      let target = 1
      try {
        const req = JSON.parse(m.mission.requirements)
        target = Object.values(req)[0] as number ?? 1
      } catch {}
      return {
        id: m.mission.id,
        task: m.mission.title,
        xpReward: m.mission.xpReward,
        progress: m.progress,
        target,
        completed: m.isCompleted,
      }
    })

    // Total XP reward for completing all daily missions
    const totalMissionXP = dailyMissions.reduce((sum, m) => sum + m.xpReward, 0)

    return NextResponse.json({
      // Streak
      currentStreak: user.profile?.currentStreak ?? 0,
      longestStreak: user.profile?.longestStreak ?? 0,

      // Daily missions
      missions: dailyMissions,
      totalMissionXP,

      // Learning
      activeModule,

      // Portfolio
      portfolio: portfolio
        ? {
            totalValue:      portfolio.totalValue,
            cashBalance:     portfolio.cashBalance,
            totalPnL:        portfolio.totalPnL,
            totalPnLPercent: portfolio.totalPnLPercent,
            topGainer,
            topLoser,
            holdingsCount:   holdings.length,
          }
        : null,

      // Quick stats
      stats: {
        totalLessons: user.profile?.totalLessonsCompleted ?? 0,
        xpPoints:     myXP,
        level:        user.profile?.level ?? 1,
        rank,
        badges:       user.badges.length,
        totalTrades:  user.profile?.totalTradesMade ?? 0,
      },
    })
  } catch (error) {
    console.error('GET /api/home/dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

