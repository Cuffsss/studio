import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

const PUBLIC_PATHS = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.includes(path);
  const sessionCookie = request.cookies.get('session');

  // If the user is on a public path AND has a session, redirect to the dashboard.
  if (isPublicPath && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If the user is on a protected path AND does NOT have a session, redirect to login.
  if (!isPublicPath && !sessionCookie && path !== '/dashboard') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (path === '/dashboard' && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
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
     * - logo.png (logo file)
     * - public (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|public).*)',
  ],
};
