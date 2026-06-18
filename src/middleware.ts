import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getSession() reads the JWT from the cookie — no network call, runs in <10ms.
  // (getUser() makes a round-trip to Supabase to verify the token server-side
  // and is the cause of MIDDLEWARE_INVOCATION_TIMEOUT on Vercel free tier.)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

// Only run middleware on protected routes — never on public pages,
// API routes, static files, or the auth callback.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/checklist/:path*',
    '/chat/:path*',
    '/community/:path*',
  ],
}
