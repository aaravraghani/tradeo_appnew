// src/app/api/social/route.ts
// Full replacement — adds followingIds set so frontend knows who you follow

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const me = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profile: { select: { totalXP: true, level: true, currentStreak: true } },
      },
    })

    if (!me) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // ── Who I already follow (needed to render correct button state) ──────────
    const myFollowing = await prisma.userFollow.findMany({
      where: { followerId: me.id },
      select: { followingId: true },
    })
    const followingIds = new Set(myFollowing.map(f => f.followingId))

    // ── Leaderboard ──────────────────────────────────────────────────────────
    let leaderboard: object[] = []
    let myRank = 1

    try {
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

      const rankIdx = topProfiles.findIndex(p => p.user.clerkId === clerkId)
      if (rankIdx !== -1) {
        myRank = rankIdx + 1
      } else {
        const myXP = me.profile?.totalXP ?? 0
        const ahead = await prisma.userProfile.count({ where: { totalXP: { gt: myXP } } })
        myRank = ahead + 1
      }

      leaderboard = topProfiles.map((p, i) => ({
        rank: i + 1,
        userId: p.user.clerkId,
        dbId: p.user.id,                          // ← needed for follow API
        name: [p.user.firstName, p.user.lastName].filter(Boolean).join(' ') || 'Anonymous',
        username: p.user.username ?? p.user.firstName?.toLowerCase() ?? 'user',
        imageUrl: p.user.imageUrl,
        xp: p.totalXP,
        level: p.level,
        streak: p.currentStreak,
        isCurrentUser: p.user.clerkId === clerkId,
        isFollowing: followingIds.has(p.user.id),  // ← new field
      }))
    } catch (e) {
      console.warn('Leaderboard query failed:', e)
    }

    // ── Activity Feed ────────────────────────────────────────────────────────
    let feed: object[] = []

    try {
      const recentBadges = await prisma.userBadge.findMany({
        orderBy: { earnedAt: 'desc' },
        take: 15,
        select: {
          id: true,
          earnedAt: true,
          badge: { select: { name: true, icon: true, description: true } },
          user: {
            select: {
              clerkId: true, firstName: true, lastName: true,
              username: true, imageUrl: true,
            },
          },
        },
      })

      feed = recentBadges.map(b => ({
        id: `badge-${b.id}`,
        userId: b.user.clerkId,
        name: [b.user.firstName, b.user.lastName].filter(Boolean).join(' ') || 'Anonymous',
        username: b.user.username ?? b.user.firstName?.toLowerCase() ?? 'user',
        imageUrl: b.user.imageUrl,
        type: 'badge',
        title: b.badge.name,
        description: b.badge.description,
        icon: b.badge.icon,
        createdAt: b.earnedAt.toISOString(),
        likes: 0,
        liked: false,
      }))
    } catch (e) {
      console.warn('Badge feed query failed:', e)
    }

    try {
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
                  clerkId: true, firstName: true, lastName: true,
                  username: true, imageUrl: true,
                },
              },
            },
          },
        },
      })

      const feedFromLessons = recentLessons
        .filter(l => l.completedAt)
        .map(l => ({
          id: `lesson-${l.id}`,
          userId: l.learningProgress.user.clerkId,
          name: [l.learningProgress.user.firstName, l.learningProgress.user.lastName].filter(Boolean).join(' ') || 'Anonymous',
          username: l.learningProgress.user.username ?? l.learningProgress.user.firstName?.toLowerCase() ?? 'user',
          imageUrl: l.learningProgress.user.imageUrl,
          type: 'lesson',
          title: l.lesson.title,
          description: 'Completed a lesson',
          xpEarned: l.xpEarned,
          icon: '📚',
          createdAt: l.completedAt!.toISOString(),
          likes: 0,
          liked: false,
        }))

      feed = [...feed, ...feedFromLessons]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20)
    } catch (e) {
      console.warn('Lesson feed query failed:', e)
    }

    // ── Challenges ───────────────────────────────────────────────────────────
    let challenges: object[] = []

    try {
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
                  firstName: true, lastName: true, imageUrl: true,
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

      const myMissions = await prisma.userMission.findMany({
        where: { user: { clerkId }, mission: { isActive: true } },
        select: { missionId: true, progress: true, isCompleted: true },
      })
      const myMissionMap = new Map(myMissions.map(m => [m.missionId, m]))

      const challengeTypeMap: Record<string, string> = {
        daily: 'lessons', weekly: 'xp', achievement: 'streak',
      }

      challenges = activeMissions.map(m => {
        const myM = myMissionMap.get(m.id)
        const topParticipants = m.userMissions.slice(0, 3).map(um => ({
          name: [um.user.firstName, um.user.lastName].filter(Boolean).join(' ') || 'Anonymous',
          imageUrl: um.user.imageUrl,
          value: um.progress,
        }))
        const endsIn = m.endDate
          ? `${Math.max(0, Math.ceil((m.endDate.getTime() - Date.now()) / 86400000))}d`
          : m.type === 'daily' ? '1d' : '7d'
        const sorted = [...m.userMissions].sort((a, b) => b.progress - a.progress)
        const myRankInChallenge = myM ? sorted.findIndex(u => u.userId === me.id) + 1 : null

        return {
          id: m.id,
          title: m.title,
          description: m.description,
          type: challengeTypeMap[m.type] ?? 'xp',
          icon: m.type === 'daily' ? '🎯' : m.type === 'weekly' ? '🏆' : '🌟',
          participants: m.userMissions.length,
          endsIn,
          myRank: myRankInChallenge || null,
          myProgress: myM?.progress ?? 0,
          target: m.xpReward > 100 ? 5 : 2,
          xpReward: m.xpReward,
          topParticipants,
        }
      })
    } catch (e) {
      console.warn('Challenges query failed:', e)
    }

    return NextResponse.json({
      userName: me.firstName ?? 'there',
      leaderboard,
      feed,
      challenges,
      myStats: {
        rank: myRank,
        xp: me.profile?.totalXP ?? 0,
        streak: me.profile?.currentStreak ?? 0,
        level: me.profile?.level ?? 1,
      },
    })
  } catch (error) {
    console.error('GET /api/social error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


