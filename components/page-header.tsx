import { cn } from '@/lib/utils'

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-n-200 pb-4', className)}>
      <div className="min-w-0 space-y-0.5">
        {eyebrow ? <p className="text-xs leading-none tracking-[0.06em] uppercase font-medium text-ink-4">{eyebrow}</p> : null}
        <h1 className="text-2xl leading-tight tracking-[-0.015em] font-semibold text-balance">{title}</h1>
        {description ? <p className="text-[0.9375rem] text-ink-3 text-pretty">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
