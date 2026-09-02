import type { Metadata } from 'next'
import { getMembership, getResources, getServices } from '@/lib/data'
import { StatusBadge } from '@/components/status-badge'
import { Card } from '@/components/ui/card'
import { formatDuration, formatMoney } from '@/lib/format'
import { resourceKindLabel } from '@/lib/labels'
import { vocabularyFor } from '@/lib/vertical'

export const metadata: Metadata = { title: 'Recursos y servicios — Zetro' }

export default async function RecursosPage({ params }: PageProps<'/panel/[orgSlug]/ajustes/recursos'>) {
  const { orgSlug } = await params
  const { org } = await getMembership(orgSlug)
  const words = vocabularyFor(org.vertical)
  const [resources, services] = await Promise.all([getResources(orgSlug), getServices(orgSlug)])

  return (
    <div className="max-w-3xl space-y-8">
      <section className="space-y-3">
        <h2 className="font-medium">{words.resources}</h2>
        <Card size="sm" className="overflow-hidden py-0">
          <ul className="divide-y divide-n-200">
            {resources.map((resource) => (
              <li key={resource.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className={resource.isActive ? 'text-[0.9375rem] font-medium text-ink' : 'text-[0.9375rem] font-medium text-ink-3'}>
                    {resource.name}
                  </p>
                  <p className="text-[0.8125rem] text-ink-3">
                    {resourceKindLabel(resource.kind)}
                    {resource.zone ? ` · ${resource.zone}` : ''}
                    {resource.capacity > 1 ? ` · capacidad ${resource.capacity}` : ''}
                  </p>
                </div>
                <StatusBadge tone={resource.isActive ? 'positive' : 'neutral'}>
                  {resource.isActive ? 'Activo' : 'Inactivo'}
                </StatusBadge>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">{words.services}</h2>
        <Card size="sm" className="overflow-hidden py-0">
          <ul className="divide-y divide-n-200">
            {services.map((service) => (
              <li key={service.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-[0.9375rem] font-medium text-ink">{service.name}</p>
                  <p className="text-[0.8125rem] text-ink-3">
                    {formatDuration(service.durationMinutes)}
                    {service.priceCents ? ` · ${formatMoney(service.priceCents, org.currency)}` : ''}
                    {!service.isPublic ? ' · no se muestra en el sitio' : ''}
                  </p>
                </div>
                <StatusBadge tone={service.isActive ? 'positive' : 'neutral'}>
                  {service.isActive ? 'Activo' : 'Inactivo'}
                </StatusBadge>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  )
}
