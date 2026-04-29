// src/app/api/social/following/route.ts
// GET → list of users I follow, with their XP (for Friends leaderboard)

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const me = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const following = await prisma.userFollow.findMany({
      where: { followerId: me.id },
      select: {
        following: {
          select: {
            id: true,
            clerkId: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            username: true,
            profile: {
              select: {
                totalXP: true,
                level: true,
                currentStreak: true,
              },
            },
          },
        },
      },
      orderBy: {
        following: {
          profile: {
            totalXP: 'desc',
          },
        },
      },
    })

    const shaped = following.map((f, i) => ({
      rank: i + 1,
      userId: f.following.clerkId,
      name: [f.following.firstName, f.following.lastName].filter(Boolean).join(' ') || 'Anonymous',
      username: f.following.username ?? f.following.firstName?.toLowerCase() ?? 'user',
      imageUrl: f.following.imageUrl,
      xp: f.following.profile?.totalXP ?? 0,
      level: f.following.profile?.level ?? 1,
      streak: f.following.profile?.currentStreak ?? 0,
      isCurrentUser: false,
      isFollowing: true,  // ← always true — this IS the following list
    }))

    return NextResponse.json({ following: shaped })
  } catch (error) {
    console.error('GET /api/social/following error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


