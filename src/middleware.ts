
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from './lib/firebase-admin';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('firebaseIdToken')?.value;

  // Pages that don't require authentication
  const publicPaths = ['/login', '/signup', '/pricing', '/'];
  if (publicPaths.includes(pathname)) {
    // If user is logged in and tries to access a public page, redirect to dashboard
    if (token) {
        try {
            // We quickly verify token to avoid redirect loops if token is invalid
            getFirebaseAdminApp();
            await getAuth().verifyIdToken(token);
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } catch (error) {
             // Token is invalid, let them proceed to the public page
            return NextResponse.next();
        }
    }
    return NextResponse.next();
  }

  // All other pages require authentication
  if (!token) {
    // If no token, redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there's a token, we must verify it server-side.
  try {
    getFirebaseAdminApp(); // Initialize admin app if not already done
    await getAuth().verifyIdToken(token);
    // Token is valid, allow request to proceed
    return NextResponse.next();
  } catch (error) {
    // Token is invalid (e.g., expired), redirect to login
    console.error("Auth token verification failed:", error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    // Clear the invalid cookie
    response.cookies.delete('firebaseIdToken');
    return response;
  }
}

// See "Matching Paths" below to learn more
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
