import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/supabase/middleware';

/**
 * Middleware to handle:
 * 1. Basic HTTP authentication for the entire site
 * 2. Redirect root path (/) to dashboard or auth based on authentication status
 * 3. Session validation for protected routes
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Basic HTTP Authentication for the entire site
  const basicAuth = request.headers.get('authorization');
  const url = request.nextUrl;

  if (!basicAuth) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  const authValue = basicAuth.split(' ')[1];
  const [user, pwd] = atob(authValue).split(':');

  // Check basic auth credentials (you should use environment variables for these)
  const validUser = process.env.BASIC_AUTH_USER || 'admin';
  const validPassword = process.env.BASIC_AUTH_PASSWORD || 'password';

  if (user !== validUser || pwd !== validPassword) {
    return new NextResponse('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  // Redirect root path to dashboard or auth
  if (pathname === '/') {
    // Use the existing validateSession to check if user is authenticated
    const sessionResponse = await validateSession(request);

    // If validateSession returns a redirect (user not authenticated), redirect to auth
    if (sessionResponse.status === 307 || sessionResponse.status === 302) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    // If user is authenticated, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For all other routes, use the existing session validation
  return validateSession(request);
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