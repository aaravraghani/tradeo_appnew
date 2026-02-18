import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// ── Validation schema ──────────────────────────────────────────────────────

const onboardingSchema = z.object({
  location:           z.enum(['indonesia', 'southeast_asia', 'outside_sea']),
  experience:         z.enum(['never', 'little', 'invested', 'regular']),
  goal:               z.enum(['grow_money', 'learning', 'independence', 'curious']),
  riskTolerance:      z.enum(['no_loss', 'small_risk', 'ups_downs', 'high_risk']),
  investmentHorizon:  z.enum(['less_1y', '1_3y', '3_5y', 'more_5y']),
  learningStyle:      z.enum(['quick_tips', 'step_by_step', 'practice', 'videos']),
  appUsageFrequency:  z.enum(['daily', 'few_week', 'once_week', 'occasional']),
})

// ── POST /api/onboarding — save answers ───────────────────────────────────

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Validate with Zod
    const result = onboardingSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid answers', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const answers = result.data

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingCompleted: true,
        ...answers,
      },
      select: { onboardingCompleted: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed',
      user: updatedUser,
    })
  } catch (error) {
    console.error('POST /api/onboarding error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── GET /api/onboarding — check status ────────────────────────────────────

export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        onboardingCompleted: true,
        location:           true,
        experience:         true,
        goal:               true,
        riskTolerance:      true,
        investmentHorizon:  true,
        learningStyle:      true,
        appUsageFrequency:  true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      onboardingCompleted: user.onboardingCompleted,
      responses: user.onboardingCompleted
        ? {
            location:          user.location,
            experience:        user.experience,
            goal:              user.goal,
            riskTolerance:     user.riskTolerance,
            investmentHorizon: user.investmentHorizon,
            learningStyle:     user.learningStyle,
            appUsageFrequency: user.appUsageFrequency,
          }
        : null,
    })
  } catch (error) {
    console.error('GET /api/onboarding error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


