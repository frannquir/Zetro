import { Card } from '@/components/ui/card'
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
    <div className={cn('w-full max-w-[400px] space-y-4', className)}>
      <Card className="p-8">
        <div className="space-y-1.5">
          <h1 className="text-xl leading-tight tracking-[-0.015em] font-semibold text-ink">{title}</h1>
          {description ? <p className="text-[0.9375rem] text-ink-3 text-pretty">{description}</p> : null}
        </div>
        <div className="mt-6">{children}</div>
      </Card>
      {footer ? <div className="text-center text-[0.9375rem] text-ink-3">{footer}</div> : null}
    </div>
  )
}
