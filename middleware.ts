import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Get the pathname from the request
  const pathname = request.nextUrl.pathname

  // Protect all routes that start with /dashboard
  if (pathname.startsWith("/dashboard")) {
    // Check for session cookie or header
    const sessionCookie = request.cookies.get("better-auth.session_token")?.value
    const authorizationHeader = request.headers.get("authorization")

    // If no session cookie exists, redirect to login
    if (!sessionCookie && !authorizationHeader) {
      const loginUrl = new URL("/login", request.url)
      // Add the current path as a redirect parameter so user can be redirected back after login
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // For more thorough validation, you could make an API call to verify the session
    // But for performance, cookie presence is usually sufficient
  }

  // Allow the request to continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
}
