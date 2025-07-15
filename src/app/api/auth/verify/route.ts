
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Malformed token' }, { status: 401 });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    // You can also fetch additional user data from Firestore here if needed
    const { uid, email, name } = decodedToken;
    return NextResponse.json({ uid, email, name });
  } catch (error) {
    console.error('API Token Verification Error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
