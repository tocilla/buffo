import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  console.log('🔥 MIDDLEWARE IS RUNNING!', request.nextUrl.pathname)

  // Basic HTTP Authentication
  const basicAuth = request.headers.get('authorization')
  const url = request.nextUrl.clone()

  // Define valid users with their credentials
  const validUsers = {
    mariete: process.env.MARIETE_PASSWORD || 'password',
    faal: process.env.FAAL_PASSWORD || 'password'
  }

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

  // Check if the username exists and password matches
  if (!validUsers[username as keyof typeof validUsers] ||
      validUsers[username as keyof typeof validUsers] !== password) {
    return new NextResponse('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  // If we're here, basic auth passed. Store the username in a cookie
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Set the username in a cookie for later use
  response.cookies.set('basic-auth-user', username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
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
          // Also set the basic auth user cookie
          response.cookies.set('basic-auth-user', username, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
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
          // Also set the basic auth user cookie
          response.cookies.set('basic-auth-user', username, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
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
      const redirectResponse = NextResponse.redirect(url)
      redirectResponse.cookies.set('basic-auth-user', username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      return redirectResponse
    } else {
      // User is not authenticated, redirect to auth
      url.pathname = '/auth'
      const redirectResponse = NextResponse.redirect(url)
      redirectResponse.cookies.set('basic-auth-user', username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      return redirectResponse
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}