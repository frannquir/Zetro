import type { Metadata } from 'next'
import { getEvents, getMembership } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { StatusBadge } from '@/components/status-badge'
import { Card } from '@/components/ui/card'
import { formatDateLong, formatMoney, formatNumber, formatTime } from '@/lib/format'

export const metadata: Metadata = { title: 'Eventos — Zetro' }

export default async function EventosPage({ params }: PageProps<'/panel/[orgSlug]/eventos'>) {
  const { orgSlug } = await params
  const { org } = await getMembership(orgSlug)
  const events = await getEvents(orgSlug)

  return (
    <>
      <PageHeader title="Eventos" description="Lo que publicás acá aparece en tu sitio con cupo, si lo tiene." />

      {events.length === 0 ? (
        <EmptyState title="Todavía no hay eventos" description="Cargá el primero para que aparezca en tu sitio." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="gap-2 px-5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-ink">{event.title}</p>
                <StatusBadge tone={event.isPublished ? 'positive' : 'neutral'}>
                  {event.isPublished ? 'Publicado' : 'Borrador'}
                </StatusBadge>
              </div>
              {event.description ? <p className="text-[0.9375rem] text-ink-3 text-pretty">{event.description}</p> : null}
              <p className="text-[0.8125rem] text-ink-3 first-letter:uppercase">
                {formatDateLong(event.startsAt, { timeZone: org.timeZone })} ·{' '}
                {formatTime(event.startsAt, { timeZone: org.timeZone })}
              </p>
              <div className="mt-1 flex items-center gap-3 text-[0.9375rem]">
                <span className="font-medium tnum text-ink">{formatMoney(event.priceCents, org.currency)}</span>
                {event.capacity ? (
                  <span className="tnum text-ink-3">{formatNumber(event.capacity)} cupos</span>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
