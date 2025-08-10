
import { NextRequest, NextResponse } from 'next/server';
import { getUserData, updateUserData } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import type { UserData } from '@/lib/types';


export async function GET() {
  try {
    const user = await getCurrentUser();
    const data = await getUserData(user.email);
    if (!data) {
        return NextResponse.json({ message: 'User data not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    // getCurrentUser redirects, so this will mostly catch db errors
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        const body = (await request.json()) as Partial<Omit<UserData, 'user'>>;

        await updateUserData(user.email, body);
        
        return NextResponse.json({ message: 'Data updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Data update error:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
