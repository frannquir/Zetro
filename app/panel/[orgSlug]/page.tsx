import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, CalendarDays, CalendarPlus, Eye, UserPlus, XCircle } from 'lucide-react'
import { getAnalytics, getDashboard, getMembership, listBookings } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { EmptyState } from '@/components/empty-state'
import { BookingList } from '@/components/panel/booking-list'
import { LiveVisitors } from '@/components/panel/live-visitors'
import { LineChart } from '@/components/charts/line-chart'
import { Button } from '@/components/ui/button'
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
        title={org.name}
        description={formatDateLong(new Date(), { timeZone: org.timeZone })}
        actions={
          <Button asChild>
            <Link href={`/panel/${orgSlug}/reservas/nueva`}>
              <CalendarPlus /> {words.newBooking}
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={`${words.bookings} hoy`}
          value={formatNumber(summary.bookingsToday)}
          hint={`Ocupación ${formatPercent(summary.occupancy)}`}
          icon={CalendarDays}
        />
        <StatCard
          label="Próximos 7 días"
          value={formatNumber(summary.bookingsNext7)}
          delta={summary.deltas.bookings}
          icon={CalendarPlus}
        />
        <StatCard
          label="Cancelaciones (7 días)"
          value={formatNumber(summary.cancellations)}
          icon={XCircle}
        />
        <StatCard
          label="Clientes nuevos"
          value={formatNumber(summary.newCustomers)}
          delta={summary.deltas.customers}
          icon={UserPlus}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border bg-card">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <h2 className="font-medium">Agenda de hoy</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/panel/${orgSlug}/reservas`}>
                Ver todo <ArrowRight />
              </Link>
            </Button>
          </div>

          {agenda.length === 0 ? (
            <EmptyState
              className="border-0 bg-transparent"
              icon={CalendarDays}
              title={`Hoy no hay ${words.bookingPlural}`}
              description="Cuando entre una desde tu sitio o la cargues a mano, aparece acá."
              action={
                <Button asChild size="sm">
                  <Link href={`/panel/${orgSlug}/reservas/nueva`}>{words.newBooking}</Link>
                </Button>
              }
            />
          ) : (
            <BookingList bookings={agenda} org={org} href={(booking) => `/panel/${orgSlug}/reservas?reserva=${booking.id}`} />
          )}
        </section>

        <div className="space-y-4">
          <LiveVisitors count={summary.liveVisitors} />

          <section className="rounded-xl border bg-card p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-medium">Visitas al sitio</h2>
              <span className="text-xs text-muted-foreground">Últimos 14 días</span>
            </div>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
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
          </section>

          <section className="rounded-xl border bg-card p-4">
            <h2 className="font-medium">Página más vista</h2>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{summary.topPath ?? '—'}</p>
            <p className="mt-3 text-sm text-muted-foreground text-pretty">
              <Eye className="mr-1 inline size-3.5" />
              {formatNumber(summary.pageviews)} visitas en 30 días, {formatNumber(analytics.bookings)}{' '}
              {words.bookingPlural} entraron desde el sitio.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
