
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const
   token = request.cookies.get('firebaseIdToken');

  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if ((pathname === '/' || pathname === '/signup') && token) {
     return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/signup'],
}
