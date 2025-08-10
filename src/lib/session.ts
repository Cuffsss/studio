
import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const secretKey = process.env.SESSION_SECRET || 'fallback-secret-for-local-dev';
const key = new TextEncoder().encode(secretKey);

// --- JWT Creation ---
export async function createSession(email: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await new SignJWT({ email, expiresAt })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(key);

  cookies().set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

// --- JWT Verification ---
export async function verifySession() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(sessionCookie, key, {
      algorithms: ['HS256'],
    });
    return payload as { email: string; expiresAt: Date };
  } catch (error) {
    console.error('Failed to verify session:', error);
    return null;
  }
}

// --- Session Deletion ---
export function deleteSession() {
  cookies().delete('session');
}

// --- Get Current User ---
export async function getCurrentUser() {
    const session = await verifySession();
    if (!session) {
      redirect('/login');
    }
    return session;
}
