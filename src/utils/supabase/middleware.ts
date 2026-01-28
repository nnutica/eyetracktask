import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/database'

const publicRoutes = ['/login', '/auth']

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // If user is logged in and tries to access login page, redirect to dashboard
  if (user && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If user is NOT logged in and tries to access protected routes, redirect to login
  if (!user && !publicRoutes.includes(pathname) && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is NOT logged in and tries to access /, redirect to login
  if (!user && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}
