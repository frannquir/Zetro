import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(list) {
          for (const { name, value } of list) request.cookies.set(name, value)
          response = NextResponse.next({ request })
          for (const { name, value, options } of list) response.cookies.set(name, value, options)
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const guarded = path.startsWith('/panel') || path.startsWith('/admin')

  if (guarded && !user) {
    const login = request.nextUrl.clone()
    login.pathname = '/login'
    login.search = ''
    login.searchParams.set('next', path)
    return NextResponse.redirect(login)
  }

  if (user && path === '/login') {
    const home = request.nextUrl.clone()
    home.pathname = '/panel'
    home.search = ''
    return NextResponse.redirect(home)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|api|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)'],
}
