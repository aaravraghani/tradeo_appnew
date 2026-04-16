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
  '/admin(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // 1. Public routes — let through immediately, no auth needed
  if (isPublicRoute(request)) return

  // 2. Protect all non-public routes — Clerk v5 syntax
  const { userId } = await auth()
  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect_url', request.url)
    return NextResponse.redirect(signInUrl)
  }

  // 3. Dashboard routes — check onboarding via cookie
  //    Cookie is set by /api/onboarding after completion
  //    This avoids making an internal fetch (which breaks Clerk auth detection)
  if (isDashboardRoute(request)) {
    const onboardingCookie = request.cookies.get('tradeo_onboarding_complete')
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


