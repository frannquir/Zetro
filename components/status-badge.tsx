import { cn } from '@/lib/utils'
import type { StatusTone } from '@/lib/labels'

const tones: Record<StatusTone, string> = {
  neutral: 'bg-muted text-muted-foreground ring-border',
  positive: 'bg-success/10 text-success ring-success/25',
  warning: 'bg-warning/12 text-warning ring-warning/30',
  danger: 'bg-destructive/10 text-destructive ring-destructive/25',
  info: 'bg-primary/10 text-primary ring-primary/25',
}

export function StatusBadge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: StatusTone
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
