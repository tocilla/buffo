import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const username = cookieStore.get('basic-auth-user')?.value;

    console.log('User config API called, username from cookie:', username);

    return NextResponse.json({ username: username || null });
  } catch (error) {
    console.error('Error getting user config:', error);
    return NextResponse.json({ username: null }, { status: 500 });
  }
}