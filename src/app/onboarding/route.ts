import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const answers = await req.json()

    // Validate answers
    const requiredFields = [
      'location',
      'experience',
      'goal',
      'riskTolerance',
      'investmentHorizon',
      'learningStyle',
      'appUsageFrequency',
    ]

    const missingFields = requiredFields.filter(field => !answers[field])
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Find user by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user with onboarding responses
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingCompleted: true,
        location: answers.location,
        experience: answers.experience,
        goal: answers.goal,
        riskTolerance: answers.riskTolerance,
        investmentHorizon: answers.investmentHorizon,
        learningStyle: answers.learningStyle,
        appUsageFrequency: answers.appUsageFrequency,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        onboardingCompleted: updatedUser.onboardingCompleted,
      },
    })
  } catch (error) {
    console.error('Error saving onboarding:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check onboarding status
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        onboardingCompleted: true,
        location: true,
        experience: true,
        goal: true,
        riskTolerance: true,
        investmentHorizon: true,
        learningStyle: true,
        appUsageFrequency: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      onboardingCompleted: user.onboardingCompleted,
      responses: user.onboardingCompleted ? {
        location: user.location,
        experience: user.experience,
        goal: user.goal,
        riskTolerance: user.riskTolerance,
        investmentHorizon: user.investmentHorizon,
        learningStyle: user.learningStyle,
        appUsageFrequency: user.appUsageFrequency,
      } : null,
    })
  } catch (error) {
    console.error('Error fetching onboarding status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


