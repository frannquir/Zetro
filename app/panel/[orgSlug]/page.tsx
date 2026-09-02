import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, CalendarPlus, Eye } from 'lucide-react'
import { getAnalytics, getDashboard, getMembership, listBookings } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { EmptyState } from '@/components/empty-state'
import { BookingList } from '@/components/panel/booking-list'
import { LiveVisitors } from '@/components/panel/live-visitors'
import { LineChart } from '@/components/charts/line-chart'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatDateLong, formatNumber, formatPercent } from '@/lib/format'
import { vocabularyFor } from '@/lib/vertical'

export const metadata: Metadata = { title: 'Inicio — Zetro' }

export default async function DashboardPage({ params }: PageProps<'/panel/[orgSlug]'>) {
  const { orgSlug } = await params
  const { org } = await getMembership(orgSlug)
  const words = vocabularyFor(org.vertical)

  const today = new Date().toISOString().slice(0, 10)
  const [summary, analytics, todayBookings] = await Promise.all([
    getDashboard(orgSlug),
    getAnalytics(orgSlug, 30),
    listBookings(orgSlug, { from: today, to: today }),
  ])

  const agenda = todayBookings.filter((booking) => booking.status !== 'cancelled')
  const chart = analytics.daily.slice(-14).map((row) => ({
    label: row.day.slice(8, 10),
    value: row.pageviews,
  }))

  return (
    <>
      <PageHeader
        eyebrow={formatDateLong(new Date(), { timeZone: org.timeZone })}
        title={org.name}
        actions={
          <Button asChild>
            <Link href={`/panel/${orgSlug}/reservas/nueva`}>
              <CalendarPlus /> {words.newBooking}
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={`${words.bookings} hoy`}
          value={formatNumber(summary.bookingsToday)}
          hint={`Ocupación ${formatPercent(summary.occupancy)}`}
        />
        <StatCard
          label="Próximos 7 días"
          value={formatNumber(summary.bookingsNext7)}
          delta={summary.deltas.bookings}
        />
        <StatCard label="Cancelaciones (7 días)" value={formatNumber(summary.cancellations)} />
        <StatCard
          label="Clientes nuevos"
          value={formatNumber(summary.newCustomers)}
          delta={summary.deltas.customers}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card size="sm" className="py-0">
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b py-3">
            <CardTitle>Agenda de hoy</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/panel/${orgSlug}/reservas`}>
                Ver todo <ArrowRight />
              </Link>
            </Button>
          </CardHeader>

          {agenda.length === 0 ? (
            <CardContent className="py-4">
              <EmptyState
                className="border-0 bg-transparent px-0 py-4"
                title={`Hoy no hay ${words.bookingPlural}`}
                description="Cuando entre una desde tu sitio o la cargues a mano, aparece acá."
                action={
                  <Button asChild size="sm">
                    <Link href={`/panel/${orgSlug}/reservas/nueva`}>{words.newBooking}</Link>
                  </Button>
                }
              />
            </CardContent>
          ) : (
            <BookingList bookings={agenda} org={org} href={(booking) => `/panel/${orgSlug}/reservas?reserva=${booking.id}`} />
          )}
        </Card>

        <div className="space-y-4">
          <LiveVisitors count={summary.liveVisitors} />

          <Card>
            <CardHeader className="flex flex-row items-baseline justify-between gap-2">
              <CardTitle>Visitas al sitio</CardTitle>
              <span className="text-[0.8125rem] text-ink-4">Últimos 14 días</span>
            </CardHeader>
            <CardContent>
              <p className="text-[1.75rem] leading-none tracking-[-0.02em] font-semibold tnum">
                {formatNumber(analytics.pageviews)}
              </p>
              <div className="mt-3">
                <LineChart data={chart} height={140} ariaLabel="Visitas diarias de los últimos 14 días" />
              </div>
              <Button asChild variant="ghost" size="sm" className="mt-2 w-full">
                <Link href={`/panel/${orgSlug}/analitica`}>
                  Ver analítica <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Página más vista</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-[0.8125rem] text-ink-3">{summary.topPath ?? '—'}</p>
              <p className="mt-3 text-[0.9375rem] text-ink-3 text-pretty">
                <Eye className="mr-1 inline size-3.5" />
                {formatNumber(summary.pageviews)} visitas en 30 días, {formatNumber(analytics.bookings)}{' '}
                {words.bookingPlural} entraron desde el sitio.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
