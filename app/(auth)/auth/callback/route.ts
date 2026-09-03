import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const raw = searchParams.get('next') ?? '/panel'
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/panel'

  const denied = searchParams.get('error')
  if (denied) {
    const detail = `${searchParams.get('error_code') ?? ''} ${searchParams.get('error_description') ?? ''}`
    // signup is closed, so an unknown google account lands here instead of getting an account
    const unknown = /signup_disabled|signups not allowed/i.test(detail)
    return NextResponse.redirect(`${origin}/login?error=${unknown ? 'sin_cuenta' : 'google'}`)
  }

  if (!code) return NextResponse.redirect(`${origin}/login?error=link`)

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return NextResponse.redirect(`${origin}/login?error=link`)

  return NextResponse.redirect(`${origin}${next}`)
}
