import { cn } from '@/lib/utils'

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-7">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground text-pretty">{description}</p> : null}
        </div>
        <div className="mt-6">{children}</div>
      </div>
      {footer ? <div className="text-center text-sm text-muted-foreground">{footer}</div> : null}
    </div>
  )
}
