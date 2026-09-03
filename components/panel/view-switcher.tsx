'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { addDays, todayIn } from '@/lib/booking/grid'

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
        <span className="ml-2 text-[0.9375rem] font-medium text-ink first-letter:uppercase">{label}</span>
      </div>

      <Tabs value={view} onValueChange={(value) => go({ vista: value })}>
        <TabsList>
          {views.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className={item.value === 'semana' ? 'hidden sm:inline-flex' : undefined}
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
