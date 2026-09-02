import type { Metadata } from 'next'
import { getAnalytics, getMembership } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { EmptyState } from '@/components/empty-state'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LineChart } from '@/components/charts/line-chart'
import { AnalyticsBreakdowns } from '@/components/panel/analytics-breakdowns'
import { formatNumber, formatPercent } from '@/lib/format'

export const metadata: Metadata = { title: 'Analítica — Zetro' }

export default async function AnaliticaPage({ params }: PageProps<'/panel/[orgSlug]/analitica'>) {
  const { orgSlug } = await params
  await getMembership(orgSlug)
  const analytics = await getAnalytics(orgSlug, 30)

  const chart = analytics.daily.map((row) => ({ label: row.day.slice(8, 10), value: row.pageviews }))
  const conversion = analytics.pageviews > 0 ? analytics.bookings / analytics.pageviews : 0

  return (
    <>
      <PageHeader title="Analítica" description="De dónde viene la gente y cuántos terminan reservando. Últimos 30 días." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Visitas" value={formatNumber(analytics.pageviews)} delta={analytics.deltas.pageviews} />
        <StatCard label="Visitantes únicos" value={formatNumber(analytics.visitors)} delta={analytics.deltas.visitors} />
        <StatCard label="Rebote" value={formatPercent(analytics.bounceRate)} delta={analytics.deltas.bounceRate} />
        <StatCard
          label="Reservas desde el sitio"
          value={formatNumber(analytics.bookings)}
          hint={`${formatPercent(conversion)} de las visitas`}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-baseline justify-between gap-2">
          <CardTitle>Visitas por día</CardTitle>
          <span className="text-[0.9375rem] font-medium tnum text-ink">{formatNumber(analytics.pageviews)}</span>
        </CardHeader>
        <CardContent>
          {chart.length === 0 ? (
            <EmptyState
              className="border-0 bg-transparent px-0 py-8"
              title="Todavía no hay visitas"
              description="Cuando el sitio esté en línea, acá vas a ver cuánta gente entra por día."
            />
          ) : chart.length < 3 ? (
            <p className="text-[1.75rem] leading-none tracking-[-0.02em] font-semibold tnum">
              {formatNumber(analytics.pageviews)}
            </p>
          ) : (
            <LineChart data={chart} height={220} ariaLabel={`Visitas por día, últimos 30 días, total ${formatNumber(analytics.pageviews)}`} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsBreakdowns orgSlug={orgSlug} />
        </CardContent>
      </Card>
    </>
  )
}
