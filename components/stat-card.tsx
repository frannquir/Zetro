import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { formatDelta } from '@/lib/format'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  hint,
  delta,
  icon: Icon,
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: string
  delta?: number | null
  icon?: LucideIcon
  className?: string
}) {
  const up = (delta ?? 0) >= 0
  return (
    <div className={cn('rounded-xl border bg-card p-4 shadow-xs', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
        {delta === null || delta === undefined ? null : (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium',
              up ? 'text-success' : 'text-destructive',
            )}
          >
            {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {formatDelta(delta)}
          </span>
        )}
      </div>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
