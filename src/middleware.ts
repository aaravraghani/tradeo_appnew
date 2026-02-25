import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/onboarding(.*)',
])

const isDashboardRoute = createRouteMatcher([
  '/home(.*)',
  '/learn(.*)',
  '/simulate(.*)',
  '/track(.*)',
  '/social(.*)',
  '/profile(.*)',
  '/settings(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // 1. Public routes — let through immediately, no auth needed
  if (isPublicRoute(request)) return

  // 2. All other routes require authentication
  //    Clerk will redirect to /sign-in automatically if not signed in
  const { userId, sessionClaims } = await auth.protect()

  // 3. If signed in and hitting a dashboard route, check onboarding
  //    We read from a cookie set by the onboarding API after completion
  //    instead of making an internal fetch (which breaks Clerk auth detection)
  if (isDashboardRoute(request)) {
    const onboardingCookie = request.cookies.get('tradeo_onboarding_complete')

    // Cookie not present means we haven't confirmed onboarding status yet.
    // Redirect to onboarding — it will redirect straight to /home if already done.
    if (!onboardingCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}


