// src/app/api/social/route.ts
// GET /api/social  → leaderboard + activity feed + challenges

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current user's DB record
    const me = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profile: {
          select: { totalXP: true, level: true, currentStreak: true },
        },
      },
    })

    if (!me) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // ── Leaderboard ─────────────────────────────────────────────────────────
    // Fetch top 20 profiles ordered by XP
    const topProfiles = await prisma.userProfile.findMany({
      orderBy: { totalXP: 'desc' },
      take: 20,
      select: {
        totalXP: true,
        level: true,
        currentStreak: true,
        user: {
          select: {
            id: true,
            clerkId: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            username: true,
          },
        },
      },
    })

    // Determine current user's rank (might be outside top 20)
    let myRank = topProfiles.findIndex((p) => p.user.clerkId === clerkId) + 1
    if (myRank === 0) {
      // Count how many users have more XP
      const myXP = me.profile?.totalXP ?? 0
      const ahead = await prisma.userProfile.count({
        where: { totalXP: { gt: myXP } },
      })
      myRank = ahead + 1
    }

    const leaderboard = topProfiles.map((p, i) => ({
      rank: i + 1,
      userId: p.user.clerkId,
      name: [p.user.firstName, p.user.lastName].filter(Boolean).join(' ') || 'Anonymous',
      username: p.user.username ?? p.user.firstName?.toLowerCase() ?? 'user',
      imageUrl: p.user.imageUrl,
      xp: p.totalXP,
      level: p.level,
      streak: p.currentStreak,
      isCurrentUser: p.user.clerkId === clerkId,
    }))

    // ── Activity Feed ────────────────────────────────────────────────────────
    // Pull recent lesson completions, badges, and level-ups from all users
    // We'll union badge earns + lesson completions as the feed

    const recentBadges = await prisma.userBadge.findMany({
      orderBy: { earnedAt: 'desc' },
      take: 15,
      select: {
        id: true,
        earnedAt: true,
        badge: { select: { name: true, icon: true, description: true } },
        user: {
          select: {
            clerkId: true,
            firstName: true,
            lastName: true,
            username: true,
            imageUrl: true,
          },
        },
      },
    })

    const recentLessons = await prisma.lessonProgress.findMany({
      where: { isCompleted: true },
      orderBy: { completedAt: 'desc' },
      take: 15,
      select: {
        id: true,
        completedAt: true,
        xpEarned: true,
        lesson: { select: { title: true } },
        learningProgress: {
          select: {
            user: {
              select: {
                clerkId: true,
                firstName: true,
                lastName: true,
                username: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    })

    // Shape and merge feed items
    const feedFromBadges = recentBadges.map((b) => ({
      id: `badge-${b.id}`,
      userId: b.user.clerkId,
      name: [b.user.firstName, b.user.lastName].filter(Boolean).join(' ') || 'Anonymous',
      username: b.user.username ?? b.user.firstName?.toLowerCase() ?? 'user',
      imageUrl: b.user.imageUrl,
      type: 'badge' as const,
      title: b.badge.name,
      description: b.badge.description,
      xpEarned: undefined,
      icon: b.badge.icon,
      createdAt: b.earnedAt.toISOString(),
      likes: 0,
      liked: false,
    }))

    const feedFromLessons = recentLessons
      .filter((l) => l.completedAt)
      .map((l) => ({
        id: `lesson-${l.id}`,
        userId: l.learningProgress.user.clerkId,
        name: [l.learningProgress.user.firstName, l.learningProgress.user.lastName].filter(Boolean).join(' ') || 'Anonymous',
        username: l.learningProgress.user.username ?? l.learningProgress.user.firstName?.toLowerCase() ?? 'user',
        imageUrl: l.learningProgress.user.imageUrl,
        type: 'lesson' as const,
        title: l.lesson.title,
        description: 'Completed a lesson',
        xpEarned: l.xpEarned,
        icon: '📚',
        createdAt: l.completedAt!.toISOString(),
        likes: 0,
        liked: false,
      }))

    // Merge and sort by date descending, take top 20
    const feed = [...feedFromBadges, ...feedFromLessons]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)

    // ── Challenges ───────────────────────────────────────────────────────────
    // Load active missions and augment with community participant counts
    const activeMissions = await prisma.mission.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        xpReward: true,
        endDate: true,
        userMissions: {
          select: {
            userId: true,
            progress: true,
            isCompleted: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                imageUrl: true,
                profile: { select: { totalXP: true } },
              },
            },
          },
          orderBy: { progress: 'desc' },
          take: 50,
        },
      },
      take: 5,
    })

    // Find my UserMission records
    const myMissions = await prisma.userMission.findMany({
      where: {
        user: { clerkId },
        mission: { isActive: true },
      },
      select: { missionId: true, progress: true, isCompleted: true },
    })
    const myMissionMap = new Map(myMissions.map((m) => [m.missionId, m]))

    const challengeTypeMap: Record<string, 'xp' | 'streak' | 'lessons' | 'portfolio'> = {
      daily: 'lessons',
      weekly: 'xp',
      achievement: 'streak',
    }

    const challenges = activeMissions.map((m) => {
      const myM = myMissionMap.get(m.id)
      const participants = m.userMissions.length

      // Parse requirements for target value
      let target = 1
      try {
        const req = JSON.parse(m.description)
        target = Object.values(req)[0] as number || 1
      } catch {
        target = m.xpReward > 100 ? 5 : 2
      }

      const topParticipants = m.userMissions.slice(0, 3).map((um) => ({
        name: [um.user.firstName, um.user.lastName].filter(Boolean).join(' ') || 'Anonymous',
        imageUrl: um.user.imageUrl,
        value: um.progress,
      }))

      // Estimate days until end
      const endsIn = m.endDate
        ? `${Math.max(0, Math.ceil((m.endDate.getTime() - Date.now()) / 86400000))}d`
        : m.type === 'daily' ? '1d' : '7d'

      // My rank among participants
      const sortedByProgress = [...m.userMissions].sort((a, b) => b.progress - a.progress)
      const myRankInChallenge = myM
        ? sortedByProgress.findIndex((u) => u.userId === me.id) + 1
        : null

      return {
        id: m.id,
        title: m.title,
        description: m.description,
        type: challengeTypeMap[m.type] ?? 'xp',
        icon: m.type === 'daily' ? '🎯' : m.type === 'weekly' ? '🏆' : '🌟',
        participants,
        endsIn,
        myRank: myRankInChallenge || null,
        myProgress: myM?.progress ?? 0,
        target,
        xpReward: m.xpReward,
        topParticipants,
      }
    })

    // ── My Stats ─────────────────────────────────────────────────────────────
    const myStats = {
      rank: myRank,
      xp: me.profile?.totalXP ?? 0,
      streak: me.profile?.currentStreak ?? 0,
      level: me.profile?.level ?? 1,
    }

    return NextResponse.json({
      userName: me.firstName ?? 'there',
      leaderboard,
      feed,
      challenges,
      myStats,
    })
  } catch (error) {
    console.error('GET /api/social error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


