import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    let username = cookieStore.get('basic-auth-user')?.value;

    // Fallback: if no cookie, try to extract from Authorization header
    // This handles the case where the cookie hasn't been set yet but auth is valid
    if (!username) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Basic ')) {
        try {
          const base64Credentials = authHeader.split(' ')[1];
          const credentials = atob(base64Credentials);
          const [user] = credentials.split(':');

          // Only use this if it's a valid user (mariete or faal)
          if (user === 'mariete' || user === 'faal') {
            username = user;
          }
        } catch (error) {
          console.error('Error parsing Authorization header:', error);
        }
      }
    }

    console.log('User config API called, username from cookie:', cookieStore.get('basic-auth-user')?.value);
    console.log('Final username:', username);

    return NextResponse.json({ username: username || null });
  } catch (error) {
    console.error('Error getting user config:', error);
    return NextResponse.json({ username: null }, { status: 500 });
  }
}