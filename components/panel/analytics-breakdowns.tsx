import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarList } from '@/components/charts/bar-list'
import { getBreakdown } from '@/lib/data'
import { formatNumber } from '@/lib/format'

const dimensions = [
  { value: 'path', label: 'Páginas' },
  { value: 'referrer', label: 'Referentes' },
  { value: 'utm_source', label: 'Campañas' },
  { value: 'device', label: 'Dispositivo' },
  { value: 'country', label: 'País' },
]

export async function AnalyticsBreakdowns({ orgSlug }: { orgSlug: string }) {
  const rows = await Promise.all(dimensions.map((dimension) => getBreakdown(orgSlug, dimension.value)))

  return (
    <Tabs defaultValue="path">
      <TabsList>
        {dimensions.map((dimension) => (
          <TabsTrigger key={dimension.value} value={dimension.value}>
            {dimension.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {dimensions.map((dimension, index) => (
        <TabsContent key={dimension.value} value={dimension.value}>
          <BarList
            rows={rows[index].slice(0, 8).map((row) => ({
              label: row.value,
              value: row.pageviews,
              hint: `${formatNumber(row.pageviews)} vistas`,
            }))}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}
