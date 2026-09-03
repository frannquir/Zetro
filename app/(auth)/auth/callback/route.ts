import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const raw = searchParams.get('next') ?? '/panel'
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/panel'

  if (!code) return NextResponse.redirect(`${origin}/login?error=link`)

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return NextResponse.redirect(`${origin}/login?error=link`)

  return NextResponse.redirect(`${origin}${next}`)
}
