import type { Metadata } from 'next'
import { Users } from 'lucide-react'
import { getMembership, getSessions } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { StatusBadge } from '@/components/status-badge'
import { Card } from '@/components/ui/card'
import { formatDateLong, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Clases — Zetro' }

function fullnessTone(ratio: number) {
  if (ratio >= 1) return 'danger'
  if (ratio >= 0.75) return 'warning'
  return 'positive'
}

export default async function ClasesPage({ params }: PageProps<'/panel/[orgSlug]/clases'>) {
  const { orgSlug } = await params
  const { org } = await getMembership(orgSlug)
  const sessions = await getSessions(orgSlug)

  const byDay = new Map<string, typeof sessions>()
  for (const session of sessions) {
    const day = session.startsAt.slice(0, 10)
    byDay.set(day, [...(byDay.get(day) ?? []), session])
  }
  const days = [...byDay.keys()].sort()

  return (
    <>
      <PageHeader title="Clases" description="Cupo por clase. Cuando se llena, el sitio deja de ofrecerla." />

      {sessions.length === 0 ? (
        <EmptyState title="Todavía no hay clases programadas" />
      ) : (
        <div className="space-y-6">
          {days.map((day) => (
            <section key={day} className="space-y-2">
              <h2 className="text-[0.8125rem] font-medium text-ink-3 first-letter:uppercase">
                {formatDateLong(`${day}T12:00:00Z`, { timeZone: org.timeZone })}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(byDay.get(day) ?? []).map((session) => {
                  const ratio = session.bookedCount / session.capacity
                  return (
                    <Card key={session.id}>
                      <div className="flex items-start justify-between gap-2 px-4">
                        <div>
                          <p className="font-medium text-ink">{session.serviceName}</p>
                          <p className="text-[0.8125rem] tnum text-ink-3">
                            {formatTime(session.startsAt, { timeZone: org.timeZone })}–
                            {formatTime(session.endsAt, { timeZone: org.timeZone })}
                          </p>
                        </div>
                        <StatusBadge tone={fullnessTone(ratio)}>
                          {ratio >= 1 ? 'Completa' : `${session.bookedCount}/${session.capacity}`}
                        </StatusBadge>
                      </div>

                      {session.instructorName || session.resourceName ? (
                        <p className="mt-2 px-4 text-[0.8125rem] text-ink-3">
                          {[session.instructorName, session.resourceName].filter(Boolean).join(' · ')}
                        </p>
                      ) : null}

                      <div className="mt-3 mx-4 h-1.5 overflow-hidden rounded-full bg-n-100">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            ratio >= 1 ? 'bg-err' : ratio >= 0.75 ? 'bg-warn' : 'bg-ok',
                          )}
                          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                        />
                      </div>
                      <p className="mt-1.5 flex items-center gap-1 px-4 text-xs tnum text-ink-3">
                        <Users className="size-3.5" /> {session.bookedCount} de {session.capacity} inscriptos
                      </p>
                    </Card>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
