import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const me = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, firstName: true },
    })
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const modules = await prisma.module.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
      select: {
        id: true, title: true, description: true, icon: true,
        order: true, difficulty: true, estimatedTime: true,
        xpReward: true, isPublished: true,
        lessons: {
          where: { isPublished: true },
          select: { id: true },
        },
        progress: {
          where: { userId: me.id },
          select: {
            status: true, progress: true,
            lessons: { where: { isCompleted: true }, select: { id: true } },
          },
        },
      },
    })

    const shaped = modules.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      icon: m.icon ?? '📚',
      order: m.order,
      difficulty: m.difficulty,
      estimatedTime: m.estimatedTime,
      xpReward: m.xpReward,
      lessonCount: m.lessons.length,
      isPublished: m.isPublished,
      userProgress: m.progress[0] ? {
        status: m.progress[0].status,
        progress: m.progress[0].progress,
        lessonsCompleted: m.progress[0].lessons.length,
      } : undefined,
    }))

    return NextResponse.json({ modules: shaped, userName: me.firstName ?? 'there' })
  } catch (error) {
    console.error('GET /api/learn/modules error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


