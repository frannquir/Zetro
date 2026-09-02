import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ErrorState({
  title = 'No pudimos cargar esta sección',
  description = 'Probá de nuevo en unos segundos. Si sigue igual, escribinos.',
  action,
  className,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 rounded-md border border-n-200 border-l-[3px] border-l-err bg-surface px-5 py-6',
        className,
      )}
    >
      <div className="space-y-1">
        <p className="text-[1.0625rem] font-medium">{title}</p>
        <p className="max-w-[48ch] text-[0.9375rem] text-ink-3">{description}</p>
      </div>
      {action ?? <Button variant="outline" size="sm">Reintentar</Button>}
    </div>
  )
}
