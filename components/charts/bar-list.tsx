import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

export type BarRow = { label: string; value: number; hint?: string }

export function BarList({ rows, className }: { rows: BarRow[]; className?: string }) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <ul className={cn('space-y-1', className)}>
      {rows.map((row) => (
        <li key={row.label} className="relative isolate flex items-center justify-between gap-4 rounded-md px-2.5 py-2 text-sm">
          <span
            className="absolute inset-y-0 left-0 -z-10 rounded-md bg-primary/10"
            style={{ width: `${Math.max((row.value / max) * 100, 3)}%` }}
          />
          <span className="truncate font-medium">{row.label}</span>
          <span className="shrink-0 tabular-nums text-muted-foreground">
            {row.hint ?? formatNumber(row.value)}
          </span>
        </li>
      ))}
    </ul>
  )
}
