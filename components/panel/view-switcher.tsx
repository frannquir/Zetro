'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addDays, todayIn } from '@/lib/booking/grid'
import { cn } from '@/lib/utils'

const views = [
  { value: 'lista', label: 'Lista' },
  { value: 'dia', label: 'Día' },
  { value: 'semana', label: 'Semana' },
]

export function ViewSwitcher({
  view,
  date,
  timeZone,
  label,
}: {
  view: string
  date: string
  timeZone: string
  label: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function go(next: Record<string, string>) {
    const search = new URLSearchParams(params)
    for (const [key, value] of Object.entries(next)) search.set(key, value)
    router.replace(`${pathname}?${search.toString()}`)
  }

  const step = view === 'semana' ? 7 : 1

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" aria-label="Anterior" onClick={() => go({ fecha: addDays(date, -step) })}>
          <ChevronLeft />
        </Button>
        <Button variant="outline" size="icon" aria-label="Siguiente" onClick={() => go({ fecha: addDays(date, step) })}>
          <ChevronRight />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => go({ fecha: todayIn(timeZone) })}>
          Hoy
        </Button>
        <span className="ml-2 text-sm font-medium first-letter:uppercase">{label}</span>
      </div>

      <div className="inline-flex rounded-lg border bg-card p-0.5">
        {views.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => go({ vista: item.value })}
            aria-pressed={view === item.value}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              view === item.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
