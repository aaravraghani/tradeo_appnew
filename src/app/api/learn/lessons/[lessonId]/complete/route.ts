// ============================================================
// src/app/api/learn/lessons/[lessonId]/complete/route.ts
// ============================================================
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { lessonId: string } }) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const me = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } })
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId },
      select: { id: true, moduleId: true, xpReward: true },
    })
    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

    const lp = await prisma.learningProgress.upsert({
      where: { userId_moduleId: { userId: me.id, moduleId: lesson.moduleId } },
      update: {},
      create: { userId: me.id, moduleId: lesson.moduleId },
    })

    await prisma.lessonProgress.upsert({
      where: { learningProgressId_lessonId: { learningProgressId: lp.id, lessonId: lesson.id } },
      update: { isCompleted: true, completedAt: new Date(), xpEarned: lesson.xpReward },
      create: { learningProgressId: lp.id, lessonId: lesson.id, isCompleted: true, completedAt: new Date(), xpEarned: lesson.xpReward },
    })

    const allLessons = await prisma.lesson.count({ where: { moduleId: lesson.moduleId, isPublished: true } })
    const done = await prisma.lessonProgress.count({ where: { learningProgressId: lp.id, isCompleted: true } })
    const pct = allLessons > 0 ? Math.round((done / allLessons) * 100) : 0

    await prisma.learningProgress.update({
      where: { id: lp.id },
      data: { progress: pct, status: pct === 100 ? 'completed' : 'in_progress', completedAt: pct === 100 ? new Date() : null },
    })

    await prisma.userProfile.updateMany({
      where: { user: { clerkId } },
      data: { totalXP: { increment: lesson.xpReward }, totalLessonsCompleted: { increment: 1 } },
    })

    return NextResponse.json({ success: true, xpEarned: lesson.xpReward, moduleProgress: pct })
  } catch (error) {
    console.error('POST /api/learn/lessons/[lessonId]/complete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


