import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  console.log('🔥 MIDDLEWARE IS RUNNING!', request.nextUrl.pathname)

  // Basic HTTP Authentication
  const basicAuth = request.headers.get('authorization')
  const url = request.nextUrl.clone()

  // Get credentials from environment variables or use defaults
  const validUsername = process.env.BASIC_AUTH_USERNAME || 'admin'
  const validPassword = process.env.BASIC_AUTH_PASSWORD || 'password'

  if (!basicAuth) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  const authValue = basicAuth.split(' ')[1]
  const [username, password] = atob(authValue).split(':')

  if (username !== validUsername || password !== validPassword) {
    return new NextResponse('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  // If we're here, basic auth passed. Now handle Supabase session and routing
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check if user is authenticated with Supabase
  const { data: { user } } = await supabase.auth.getUser()

  // Handle root path routing
  if (request.nextUrl.pathname === '/') {
    if (user) {
      // User is authenticated, redirect to dashboard
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    } else {
      // User is not authenticated, redirect to auth
      url.pathname = '/auth'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}