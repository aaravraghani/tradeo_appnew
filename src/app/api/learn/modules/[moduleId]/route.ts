// src/app/api/learn/modules/[moduleId]/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { moduleId: string } }) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const me = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } })
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const mod = await prisma.module.findUnique({
      where: { id: params.moduleId },
      select: {
        id: true, title: true, icon: true, order: true,
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          select: {
            id: true, title: true, content: true, order: true, duration: true, xpReward: true,
            progress: {
              where: { learningProgress: { userId: me.id } },
              select: { isCompleted: true },
            },
          },
        },
        progress: {
          where: { userId: me.id },
          select: { progress: true, status: true, lessons: { select: { isCompleted: true } } },
        },
      },
    })

    if (!mod) return NextResponse.json({ error: 'Module not found' }, { status: 404 })

    // Ensure LearningProgress row exists
    await prisma.learningProgress.upsert({
      where: { userId_moduleId: { userId: me.id, moduleId: params.moduleId } },
      update: {},
      create: { userId: me.id, moduleId: params.moduleId },
    })

    const shaped = {
      id: mod.id,
      title: mod.title,
      icon: mod.icon ?? '📚',
      order: mod.order,
      userProgress: mod.progress[0] ? {
        progress: mod.progress[0].progress,
        lessonsCompleted: mod.progress[0].lessons.filter((l: { isCompleted: boolean }) => l.isCompleted).length,
      } : undefined,
      lessons: mod.lessons.map(l => {
        let subtitle = '', quote = '', blocks: object[] = []
        try {
          const parsed = JSON.parse(l.content)
          if (Array.isArray(parsed)) {
            blocks = parsed
          } else if (parsed && typeof parsed === 'object') {
            subtitle = parsed.subtitle ?? ''
            quote    = parsed.quote    ?? ''
            blocks   = parsed.blocks   ?? []
          }
        } catch {
          blocks = []
        }
        return {
          id: l.id,
          title: l.title,
          subtitle,
          quote,
          order: l.order,
          duration: l.duration,
          xpReward: l.xpReward,
          blocks,
          isCompleted: l.progress[0]?.isCompleted ?? false,
        }
      }),
    }

    return NextResponse.json(shaped)
  } catch (error) {
    console.error('GET /api/learn/modules/[moduleId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


