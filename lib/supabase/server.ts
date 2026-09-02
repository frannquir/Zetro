import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from './types'

export async function createClient() {
  const store = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll()
        },
        setAll(list) {
          try {
            for (const { name, value, options } of list) store.set(name, value, options)
          } catch {
            // server components can't set cookies; middleware already refreshed the session
          }
        },
      },
    },
  )
}
