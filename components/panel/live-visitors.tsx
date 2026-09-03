'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

// realtime is off in v1, so the tile just refetches on an interval
export function LiveVisitors({ count, intervalMs = 30_000 }: { count: number; intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs)
    return () => clearInterval(id)
  }, [router, intervalMs])

  return (
    <div className="flex flex-col gap-2 rounded-md border border-n-200 bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.8125rem] font-medium text-ink-3">Personas ahora</span>
        <span className={cn('size-2 rounded-full', count > 0 ? 'bg-ok' : 'bg-n-400')} />
      </div>
      <span className="text-[1.75rem] leading-none tracking-[-0.02em] font-semibold tnum">{formatNumber(count)}</span>
      <span className="text-[0.8125rem] text-ink-4 tnum">En tu sitio en los últimos 30 minutos</span>
    </div>
  )
}
