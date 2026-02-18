import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  // Verify the webhook signature
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── Handle events ──────────────────────────────────────────────────────────

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    const email = email_addresses[0]?.email_address
    if (!email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 })
    }

    try {
      // Create the user and bootstrap related records in one transaction
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            clerkId: id,
            email,
            firstName: first_name ?? null,
            lastName: last_name ?? null,
            imageUrl: image_url ?? null,
          },
        })

        // Create UserProfile with default gamification values
        await tx.userProfile.create({
          data: { userId: user.id },
        })

        // Create empty Portfolio with $100,000 virtual cash
        await tx.portfolio.create({
          data: { userId: user.id },
        })
      })

      console.log(`✅ User created in DB: ${email}`)
      return NextResponse.json({ success: true }, { status: 201 })
    } catch (error) {
      console.error('Error creating user in DB:', error)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }
  }

  if (evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data
    const email = email_addresses[0]?.email_address

    try {
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email ?? undefined,
          firstName: first_name ?? null,
          lastName: last_name ?? null,
          imageUrl: image_url ?? null,
        },
      })

      console.log(`✅ User updated in DB: ${id}`)
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error updating user in DB:', error)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
  }

  if (evt.type === 'user.deleted') {
    const { id } = evt.data
    if (!id) return NextResponse.json({ success: true })

    try {
      // Cascade deletes all related records (UserProfile, Portfolio, etc.)
      await prisma.user.delete({ where: { clerkId: id } })

      console.log(`✅ User deleted from DB: ${id}`)
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error deleting user from DB:', error)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }
  }

  // Unhandled event type — acknowledge receipt
  return NextResponse.json({ received: true })
}


