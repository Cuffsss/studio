
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('firebaseIdToken')?.value;

  const publicPaths = ['/login', '/signup', '/pricing', '/'];

  // If accessing a public path
  if (publicPaths.includes(pathname)) {
    if (token) {
      try {
        await adminAuth.verifyIdToken(token);
        // If token is valid and user is on a public page, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (error) {
        // Invalid token, clear it and let them proceed to public page
        const response = NextResponse.next();
        response.cookies.delete('firebaseIdToken');
        return response;
      }
    }
    return NextResponse.next();
  }

  // If accessing a protected path
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await adminAuth.verifyIdToken(token);
    // Token is valid, proceed
    return NextResponse.next();
  } catch (error) {
    console.error("Auth token verification failed:", error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('firebaseIdToken');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.png (logo file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)',
  ],
};
