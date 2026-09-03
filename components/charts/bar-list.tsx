import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

export type BarRow = { label: string; value: number; hint?: string }

export function BarList({ rows, className }: { rows: BarRow[]; className?: string }) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <ul className={cn(className)}>
      {rows.map((row) => (
        <li key={row.label} className="relative isolate grid h-9 grid-cols-[1fr_auto] items-center gap-4 px-2 text-[0.9375rem]">
          <span
            className="absolute inset-y-1.5 left-0 -z-10 rounded-r-sm bg-brand-soft"
            style={{ width: `${Math.max((row.value / max) * 100, 3)}%` }}
          />
          <span className="truncate text-ink">{row.label}</span>
          <span className="tnum text-ink-3">{row.hint ?? formatNumber(row.value)}</span>
        </li>
      ))}
    </ul>
  )
}
