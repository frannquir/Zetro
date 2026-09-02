'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Radio } from 'lucide-react'
import { formatNumber } from '@/lib/format'

// realtime is off in v1, so the tile just refetches on an interval
export function LiveVisitors({ count, intervalMs = 30_000 }: { count: number; intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs)
    return () => clearInterval(id)
  }, [router, intervalMs])

  return (
    <div className="rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">Personas ahora</span>
        <Radio className={count > 0 ? 'size-4 animate-pulse text-success' : 'size-4 text-muted-foreground'} />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{formatNumber(count)}</p>
      <p className="mt-1 text-xs text-muted-foreground">En tu sitio en los últimos 30 minutos</p>
    </div>
  )
}
