// src/app/api/user/profile/route.ts
// GET  /api/user/profile         → own profile
// GET  /api/user/profile?userId=xxx → another user's public profile
// PATCH /api/user/profile        → update own profile

import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// ─── GET ─────────────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Optional: viewing another user's public profile
    const { searchParams } = new URL(req.url)
    const targetClerkId = searchParams.get('userId') ?? clerkId
    const isOwnProfile = targetClerkId === clerkId

    const user = await prisma.user.findUnique({
      where: { clerkId: targetClerkId },
      select: {
        id: true,
        clerkId: true,
        firstName: true,
        lastName: true,
        username: true,
        imageUrl: true,
        country: true,
        bio: true,
        createdAt: true,

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

        // Only return portfolio for own profile or make it public — adjust as needed
        portfolio: isOwnProfile
          ? {
              select: {
                totalValue: true,
                cashBalance: true,
                totalPnL: true,
                totalPnLPercent: true,
              },
            }
          : false,

        // Learning progress with module info
        progress: {
          select: {
            status: true,
            progress: true,
            module: {
              select: {
                title: true,
                icon: true,
              },
            },
            lessons: {
              select: {
                xpEarned: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },

        // Earned badges
        badges: {
          select: {
            earnedAt: true,
            badge: {
              select: {
                name: true,
                icon: true,
                description: true,
                rarity: true,
              },
            },
          },
          orderBy: { earnedAt: 'asc' },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Shape the response to match what the frontend expects
    const responseData = {
      id: user.clerkId,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      username: user.username ?? user.firstName?.toLowerCase() ?? 'user',
      imageUrl: user.imageUrl,
      country: user.country ?? 'SG',
      bio: user.bio ?? '',
      joinedAt: user.createdAt.toISOString(),
      isOwnProfile,

      profile: {
        totalXP: user.profile?.totalXP ?? 0,
        level: user.profile?.level ?? 1,
        currentStreak: user.profile?.currentStreak ?? 0,
        longestStreak: user.profile?.longestStreak ?? 0,
        totalLessonsCompleted: user.profile?.totalLessonsCompleted ?? 0,
        totalTradesMade: user.profile?.totalTradesMade ?? 0,
      },

      portfolio: isOwnProfile && user.portfolio
        ? {
            virtualBalance: user.portfolio.totalValue,
            cashBalance: user.portfolio.cashBalance,
            totalReturn: user.portfolio.totalPnLPercent,
            totalReturnAmount: user.portfolio.totalPnL,
          }
        : null,

      learningProgress: user.progress.map((p) => ({
        moduleTitle: p.module.title,
        icon: p.module.icon ?? '📚',
        percentComplete: p.progress,
        xpEarned: p.lessons.reduce((sum, l) => sum + l.xpEarned, 0),
      })),

      badges: user.badges.map((ub) => ({
        id: ub.badge.name,
        name: ub.badge.name,
        icon: ub.badge.icon,
        description: ub.badge.description,
        rarity: ub.badge.rarity,
        earnedAt: ub.earnedAt.toISOString(),
      })),
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('GET /api/user/profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── PATCH ────────────────────────────────────────────────────────────────────
const updateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers and underscores').optional(),
  bio: z.string().max(120).optional(),
  country: z.enum(['SG', 'MY', 'ID', 'TH', 'VN', 'PH']).optional(),
})

export async function PATCH(req: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = updateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const updates = result.data

    // Check username uniqueness if being changed
    if (updates.username) {
      const existing = await prisma.user.findFirst({
        where: {
          username: updates.username,
          NOT: { clerkId },
        },
      })
      if (existing) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { clerkId },
      data: updates,
      select: {
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        country: true,
      },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('PATCH /api/user/profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


