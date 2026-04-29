// src/app/api/social/follow/[userId]/route.ts
// POST   → follow a user
// DELETE → unfollow a user
// GET    → check if you follow this user

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ── helpers ──────────────────────────────────────────────────────────────────

async function getMe(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  })
}

async function getTarget(targetClerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId: targetClerkId },
    select: { id: true, firstName: true },
  })
}

// ── POST /api/social/follow/:userId  → follow ─────────────────────────────────

export async function POST(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (clerkId === params.userId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    const [me, target] = await Promise.all([
      getMe(clerkId),
      getTarget(params.userId),
    ])
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (!target) return NextResponse.json({ error: 'Target user not found' }, { status: 404 })

    // Upsert — safe to call multiple times
    await prisma.userFollow.upsert({
      where: {
        followerId_followingId: {
          followerId: me.id,
          followingId: target.id,
        },
      },
      update: {},
      create: {
        followerId: me.id,
        followingId: target.id,
      },
    })

    // Create a notification for the followed user
    await prisma.notification.create({
      data: {
        userId: target.id,
        type: 'new_follower',
        fromUserId: me.id,
        data: JSON.stringify({ message: 'started following you' }),
      },
    })

    // Return updated follower count
    const followerCount = await prisma.userFollow.count({
      where: { followingId: target.id },
    })

    return NextResponse.json({ success: true, following: true, followerCount })
  } catch (error) {
    console.error('POST /api/social/follow error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── DELETE /api/social/follow/:userId  → unfollow ────────────────────────────

export async function DELETE(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [me, target] = await Promise.all([
      getMe(clerkId),
      getTarget(params.userId),
    ])
    if (!me || !target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    await prisma.userFollow.deleteMany({
      where: {
        followerId: me.id,
        followingId: target.id,
      },
    })

    const followerCount = await prisma.userFollow.count({
      where: { followingId: target.id },
    })

    return NextResponse.json({ success: true, following: false, followerCount })
  } catch (error) {
    console.error('DELETE /api/social/follow error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── GET /api/social/follow/:userId  → check follow status ────────────────────

export async function GET(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [me, target] = await Promise.all([
      getMe(clerkId),
      getTarget(params.userId),
    ])
    if (!me || !target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const follow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: me.id,
          followingId: target.id,
        },
      },
    })

    const [followerCount, followingCount] = await Promise.all([
      prisma.userFollow.count({ where: { followingId: target.id } }),
      prisma.userFollow.count({ where: { followerId: target.id } }),
    ])

    return NextResponse.json({
      following: !!follow,
      followerCount,
      followingCount,
    })
  } catch (error) {
    console.error('GET /api/social/follow error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


