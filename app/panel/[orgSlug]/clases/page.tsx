import type { Metadata } from 'next'
import { Dumbbell, Users } from 'lucide-react'
import { getMembership, getSessions } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { StatusBadge } from '@/components/status-badge'
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
        <EmptyState icon={Dumbbell} title="Todavía no hay clases programadas" />
      ) : (
        <div className="space-y-6">
          {days.map((day) => (
            <section key={day} className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground first-letter:uppercase">
                {formatDateLong(`${day}T12:00:00Z`, { timeZone: org.timeZone })}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(byDay.get(day) ?? []).map((session) => {
                  const ratio = session.bookedCount / session.capacity
                  return (
                    <div key={session.id} className="rounded-xl border bg-card p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{session.serviceName}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(session.startsAt, { timeZone: org.timeZone })}–
                            {formatTime(session.endsAt, { timeZone: org.timeZone })}
                          </p>
                        </div>
                        <StatusBadge tone={fullnessTone(ratio)}>
                          {ratio >= 1 ? 'Completa' : `${session.bookedCount}/${session.capacity}`}
                        </StatusBadge>
                      </div>

                      {session.instructorName || session.resourceName ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {[session.instructorName, session.resourceName].filter(Boolean).join(' · ')}
                        </p>
                      ) : null}

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            ratio >= 1 ? 'bg-destructive' : ratio >= 0.75 ? 'bg-warning' : 'bg-success',
                          )}
                          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                        />
                      </div>
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="size-3.5" /> {session.bookedCount} de {session.capacity} inscriptos
                      </p>
                    </div>
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
