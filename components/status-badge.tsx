import { cn } from '@/lib/utils'
import type { StatusTone } from '@/lib/labels'

const dotTones: Record<StatusTone, string> = {
  neutral: 'text-ink-3 before:bg-n-400',
  positive: 'text-ok before:bg-ok',
  warning: 'text-warn before:bg-warn',
  danger: 'text-err before:bg-err',
  info: 'text-info before:bg-info',
}

const solidTones: Record<StatusTone, string> = {
  neutral: 'bg-n-100 text-ink-2',
  positive: 'bg-ok-soft text-ok',
  warning: 'bg-warn-soft text-warn',
  danger: 'bg-err-soft text-err',
  info: 'bg-info-soft text-info',
}

export function StatusBadge({
  tone = 'neutral',
  variant = 'dot',
  children,
  className,
}: {
  tone?: StatusTone
  variant?: 'dot' | 'solid'
  children: React.ReactNode
  className?: string
}) {
  if (variant === 'solid') {
    return (
      <span
        className={cn(
          'inline-flex h-6 items-center rounded-full px-2.5 text-[0.8125rem] font-medium whitespace-nowrap',
          solidTones[tone],
          className,
        )}
      >
        {children}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[0.8125rem] font-medium whitespace-nowrap before:size-2 before:shrink-0 before:rounded-full before:content-[""]',
        dotTones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
