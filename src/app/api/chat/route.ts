// src/app/api/chat/route.ts
// POST /api/chat — GPT-4 chat with user context + persistent history

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { message, context } = await req.json()
    if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    // ── Get user profile for personalisation ─────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        firstName: true,
        profile: { select: { totalXP: true, level: true, currentStreak: true } },
        progress: {
          where: { status: 'in_progress' },
          select: {
            module: { select: { title: true } },
            progress: true,
          },
          take: 1,
          orderBy: { updatedAt: 'desc' },
        },
      },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // ── Fetch last 10 messages for conversation memory ────────────────────────
    const history = await prisma.aIChatHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { question: true, answer: true, createdAt: true },
    })
    // Reverse so oldest is first (chronological order for GPT)
    const recentHistory = history.reverse()

    // ── Build system prompt ───────────────────────────────────────────────────
    const currentModule = user.progress[0]
    const systemPrompt = `You are InnoG, an AI investing coach inside Tradeo — a gamified investing education app built for young people (18–25) in Southeast Asia.

Your personality:
- Friendly, encouraging, and clear. Never condescending.
- You use simple language and real SEA examples (GoTo, Grab, Sea Limited, BCA, DBS, Maybank etc.)
- You make investing feel approachable, not scary.
- You're brief by default — 2-4 sentences unless the user asks for more detail.
- You use the occasional emoji to stay warm, but don't overdo it.

User context:
- Name: ${user.firstName ?? 'there'}
- Level: ${user.profile?.level ?? 1}
- Total XP: ${user.profile?.totalXP ?? 0}
- Current streak: ${user.profile?.currentStreak ?? 0} days
- Currently studying: ${currentModule ? `${currentModule.module.title} (${currentModule.progress}% complete)` : 'No active module'}
${context?.lessonTitle ? `- Current lesson: ${context.lessonTitle}` : ''}
${context?.lessonContent ? `- Lesson content summary: ${context.lessonContent.slice(0, 400)}` : ''}

Rules:
- Focus on investing, trading, personal finance, and stock market topics relevant to SEA.
- If asked about something unrelated to finance or the app, gently redirect.
- Never give specific financial advice or tell users to buy/sell specific stocks.
- Always encourage the growth mindset: it's okay to start small, it's okay to make mistakes early.
- Reference their current lesson or module if relevant to the question.
- If they seem confused or frustrated, be extra encouraging.
- Keep responses concise. Use short paragraphs or bullet points for clarity.`

    // ── Build messages array for GPT-4 ───────────────────────────────────────
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ]

    // Inject conversation history
    for (const h of recentHistory) {
      messages.push({ role: 'user', content: h.question })
      messages.push({ role: 'assistant', content: h.answer })
    }

    // Add current message
    messages.push({ role: 'user', content: message })

    // ── Call GPT-4 ────────────────────────────────────────────────────────────
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })

    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!gptRes.ok) {
      const err = await gptRes.text()
      console.error('OpenAI error:', err)
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 })
    }

    const gptData = await gptRes.json()
    const answer = gptData.choices?.[0]?.message?.content?.trim()
    if (!answer) return NextResponse.json({ error: 'No response from AI' }, { status: 502 })

    // ── Save to AIChatHistory ─────────────────────────────────────────────────
    await prisma.aIChatHistory.create({
      data: {
        userId: user.id,
        question: message,
        answer,
        context: context ? JSON.stringify(context) : null,
      },
    })

    return NextResponse.json({ answer })
  } catch (error) {
    console.error('POST /api/chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── GET /api/chat — fetch chat history ───────────────────────────────────────
export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const history = await prisma.aIChatHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
      select: {
        id: true,
        question: true,
        answer: true,
        helpful: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ history })
  } catch (error) {
    console.error('GET /api/chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


