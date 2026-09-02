import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon: _icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-start gap-3 rounded-md border border-n-200 bg-paper-2 px-5 py-8 sm:px-6', className)}>
      <div className="space-y-1">
        <p className="text-[1.0625rem] font-medium">{title}</p>
        {description ? <p className="max-w-[48ch] text-[0.9375rem] text-ink-3 text-pretty">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
