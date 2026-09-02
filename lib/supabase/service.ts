import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

if (typeof window !== 'undefined') {
  throw new Error('lib/supabase/service is server only')
}

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) throw new Error('missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL')

  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
