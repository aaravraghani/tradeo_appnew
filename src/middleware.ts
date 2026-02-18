import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/onboarding(.*)',   // allow onboarding page without loop
])

export default clerkMiddleware(async (auth, request) => {
  // Let public routes through immediately
  if (isPublicRoute(request)) return

  const { userId } = await auth()

  // Not signed in — Clerk will redirect to /sign-in automatically
  if (!userId) {
    auth().protect()
    return
  }

  // Signed in — check onboarding status before allowing dashboard access
  // We call our own API to avoid importing Prisma into middleware (Edge runtime)
  const url = request.nextUrl.clone()
  const isDashboard = url.pathname.startsWith('/home') ||
                      url.pathname.startsWith('/learn') ||
                      url.pathname.startsWith('/trade') ||
                      url.pathname.startsWith('/profile')

  if (isDashboard) {
    try {
      const onboardingRes = await fetch(
        new URL('/api/onboarding', request.url),
        {
          headers: { cookie: request.headers.get('cookie') ?? '' },
        }
      )
      if (onboardingRes.ok) {
        const data = await onboardingRes.json()
        if (!data.onboardingCompleted) {
          url.pathname = '/onboarding'
          return NextResponse.redirect(url)
        }
      }
    } catch {
      // If check fails, let the request through — better UX than an infinite loop
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}


