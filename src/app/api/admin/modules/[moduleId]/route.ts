// src/app/api/admin/modules/[moduleId]/route.ts

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function isAdmin(clerkId: string): Promise<boolean> {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
  if (adminEmails.length === 0 || adminEmails[0] === '') return false
  const user = await prisma.user.findUnique({ where: { clerkId }, select: { email: true } })
  return adminEmails.includes(user?.email?.toLowerCase() ?? '')
}

export async function PUT(req: Request, { params }: { params: { moduleId: string } }) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId || !(await isAdmin(clerkId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { lessons = [], ...moduleFields } = body

    await prisma.module.update({
      where: { id: params.moduleId },
      data: {
        title: moduleFields.title,
        description: moduleFields.description ?? '',
        icon: moduleFields.icon ?? '📚',
        order: moduleFields.order ?? 1,
        difficulty: moduleFields.difficulty ?? 'beginner',
        estimatedTime: moduleFields.estimatedTime ?? 30,
        xpReward: moduleFields.xpReward ?? 200,
        isPublished: moduleFields.isPublished ?? false,
      },
    })

    // Replace lessons: upsert existing by id, delete removed
    const incomingIds = lessons.filter((l: any) => l.id).map((l: any) => l.id)
    await prisma.lesson.deleteMany({
      where: { moduleId: params.moduleId, id: { notIn: incomingIds } },
    })

    for (const [i, l] of lessons.entries()) {
      const content = JSON.stringify({
        subtitle: l.subtitle ?? '',
        quote: l.quote ?? '',
        blocks: l.blocks ?? [],
      })
      if (l.id) {
        await prisma.lesson.update({
          where: { id: l.id },
          data: {
            title: l.title, order: l.order ?? i + 1,
            duration: l.duration ?? 5, xpReward: l.xpReward ?? 50,
            isPublished: l.isPublished ?? false, content,
          },
        })
      } else {
        await prisma.lesson.create({
          data: {
            moduleId: params.moduleId, title: l.title,
            order: l.order ?? i + 1, duration: l.duration ?? 5,
            xpReward: l.xpReward ?? 50, isPublished: l.isPublished ?? false,
            type: 'rich', content,
          },
        })
      }
    }

    const updated = await prisma.module.findUnique({
      where: { id: params.moduleId },
      include: { lessons: { orderBy: { order: 'asc' } } },
    })
    return NextResponse.json({ module: updated })
  } catch (error) {
    console.error('PUT /api/admin/modules/[moduleId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { moduleId: string } }) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId || !(await isAdmin(clerkId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    await prisma.module.delete({ where: { id: params.moduleId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/modules/[moduleId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


