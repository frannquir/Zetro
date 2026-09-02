import type { Metadata } from 'next'
import { CalendarOff } from 'lucide-react'
import { getAvailabilityExceptions, getAvailabilityRules, getMembership } from '@/lib/data'
import { StatusBadge } from '@/components/status-badge'
import { formatDateLong } from '@/lib/format'

export const metadata: Metadata = { title: 'Horarios — Zetro' }

const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default async function HorariosPage({ params }: PageProps<'/panel/[orgSlug]/ajustes/horarios'>) {
  const { orgSlug } = await params
  const { org } = await getMembership(orgSlug)
  const [rules, exceptions] = await Promise.all([
    getAvailabilityRules(orgSlug),
    getAvailabilityExceptions(orgSlug),
  ])

  const byWeekday = new Map<number, typeof rules>()
  for (const rule of rules) byWeekday.set(rule.weekday, [...(byWeekday.get(rule.weekday) ?? []), rule])

  return (
    <div className="max-w-2xl space-y-8">
      <section className="space-y-3">
        <h2 className="font-medium">Horario semanal</h2>
        <div className="overflow-hidden rounded-xl border bg-card">
          <ul className="divide-y">
            {weekdays.map((label, weekday) => {
              const day = byWeekday.get(weekday)
              return (
                <li key={weekday} className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-sm text-muted-foreground">
                    {day ? day.map((rule) => `${rule.opensAt}–${rule.closesAt}`).join(' y ') : 'Cerrado'}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-1.5 font-medium">
          <CalendarOff className="size-4" /> Excepciones
        </h2>
        {exceptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay feriados ni horarios especiales cargados.</p>
        ) : (
          <ul className="space-y-2">
            {exceptions.map((exception) => (
              <li key={exception.id} className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3">
                <div>
                  <p className="text-sm font-medium first-letter:uppercase">
                    {formatDateLong(`${exception.date}T12:00:00Z`, { timeZone: org.timeZone })}
                  </p>
                  {exception.note ? <p className="text-xs text-muted-foreground">{exception.note}</p> : null}
                </div>
                <StatusBadge tone={exception.isClosed ? 'danger' : 'warning'}>
                  {exception.isClosed ? 'Cerrado' : `${exception.opensAt}–${exception.closesAt}`}
                </StatusBadge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
