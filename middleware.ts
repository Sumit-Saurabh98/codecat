import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Handle Better Auth API routes
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return auth.handler(request);
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check for session cookie (better-auth.session_token)
    const sessionToken = request.cookies.get('better-auth.session_token')?.value;

    if (!sessionToken) {
      // Redirect to login with the current path as redirect
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Optional: Validate session token exists (basic check)
    // You could add more validation here if needed
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
