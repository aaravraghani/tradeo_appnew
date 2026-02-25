// src/app/api/onboarding/route.ts
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const onboardingSchema = z.object({
  location:           z.enum(['indonesia', 'southeast_asia', 'outside_sea']),
  experience:         z.enum(['never', 'little', 'invested', 'regular']),
  goal:               z.enum(['grow_money', 'learning', 'independence', 'curious']),
  riskTolerance:      z.enum(['no_loss', 'small_risk', 'ups_downs', 'high_risk']),
  investmentHorizon:  z.enum(['less_1y', '1_3y', '3_5y', 'more_5y']),
  learningStyle:      z.enum(['quick_tips', 'step_by_step', 'practice', 'videos']),
  appUsageFrequency:  z.enum(['daily', 'few_week', 'once_week', 'occasional']),
})

// ─── POST — save onboarding answers ──────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = onboardingSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid answers', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const answers = result.data
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress
    if (!email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 })
    }

    await prisma.user.upsert({
      where: { clerkId },
      update: {
        onboardingCompleted: true,
        ...answers,
      },
      create: {
        clerkId,
        email,
        firstName: clerkUser.firstName ?? null,
        lastName:  clerkUser.lastName  ?? null,
        imageUrl:  clerkUser.imageUrl  ?? null,
        onboardingCompleted: true,
        ...answers,
        profile:   { create: {} },
        portfolio: { create: {} },
      },
    })

    // ✅ Set a cookie so middleware can detect onboarding is done
    //    without making an internal API fetch (which breaks Clerk auth)
    const response = NextResponse.json({
      success: true,
      message: 'Onboarding completed',
    })
    response.cookies.set('tradeo_onboarding_complete', '1', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      // Expire in 1 year — user only onboards once
      maxAge: 60 * 60 * 24 * 365,
    })
    return response

  } catch (error) {
    console.error('POST /api/onboarding error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── GET — check onboarding status + set cookie if already done ──────────────
export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { onboardingCompleted: true },
    })

    const completed = user?.onboardingCompleted ?? false

    const response = NextResponse.json({
      onboardingCompleted: completed,
    })

    // ✅ If already completed, set the cookie so middleware stops redirecting
    if (completed) {
      response.cookies.set('tradeo_onboarding_complete', '1', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
      })
    }

    return response

  } catch (error) {
    console.error('GET /api/onboarding error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


