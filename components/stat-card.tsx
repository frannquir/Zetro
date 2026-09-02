import type { LucideIcon } from 'lucide-react'
import { formatDelta } from '@/lib/format'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  hint,
  delta,
  icon: _icon,
  inline = false,
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: string
  delta?: number | null
  icon?: LucideIcon
  inline?: boolean
  className?: string
}) {
  const up = (delta ?? 0) >= 0
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-md border border-n-200 bg-surface p-4',
        inline && 'border-0 bg-transparent p-0',
        className,
      )}
    >
      <span className="text-[0.8125rem] font-medium text-ink-3">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-[1.75rem] leading-none tracking-[-0.02em] font-semibold tnum">{value}</span>
        {delta === null || delta === undefined ? null : (
          <span className={cn('text-[0.8125rem] font-medium tnum', up ? 'text-ok' : 'text-err')}>
            {formatDelta(delta)}
          </span>
        )}
      </div>
      {hint ? <span className="text-[0.8125rem] text-ink-4 tnum">{hint}</span> : null}
    </div>
  )
}
