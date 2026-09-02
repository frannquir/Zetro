import type { Metadata } from 'next'
import { Eye, MousePointerClick, TrendingDown, Users } from 'lucide-react'
import { getAnalytics, getMembership } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Visitas" value={formatNumber(analytics.pageviews)} delta={analytics.deltas.pageviews} icon={Eye} />
        <StatCard label="Visitantes únicos" value={formatNumber(analytics.visitors)} delta={analytics.deltas.visitors} icon={Users} />
        <StatCard
          label="Rebote"
          value={formatPercent(analytics.bounceRate)}
          delta={analytics.deltas.bounceRate}
          icon={TrendingDown}
        />
        <StatCard
          label="Reservas desde el sitio"
          value={formatNumber(analytics.bookings)}
          hint={`${formatPercent(conversion)} de las visitas`}
          icon={MousePointerClick}
        />
      </div>

      <section className="rounded-xl border bg-card p-4 sm:p-6">
        <h2 className="font-medium">Visitas por día</h2>
        <div className="mt-4">
          <LineChart data={chart} height={220} ariaLabel="Visitas por día en los últimos 30 días" />
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4 sm:p-6">
        <h2 className="font-medium">Detalle</h2>
        <div className="mt-4">
          <AnalyticsBreakdowns orgSlug={orgSlug} />
        </div>
      </section>
    </>
  )
}
