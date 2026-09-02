import type { Metadata } from 'next'
import { UtensilsCrossed } from 'lucide-react'
import { getMembership, getMenu } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { StatusBadge } from '@/components/status-badge'
import { Switch } from '@/components/ui/switch'
import { formatMoney } from '@/lib/format'

export const metadata: Metadata = { title: 'Menú — Zetro' }

export default async function MenuPage({ params }: PageProps<'/panel/[orgSlug]/menu'>) {
  const { orgSlug } = await params
  const { org } = await getMembership(orgSlug)
  const sections = await getMenu(orgSlug)

  return (
    <>
      <PageHeader title="Menú" description="Lo que ves acá es lo que se muestra en tu sitio." />

      {sections.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="Todavía no cargaste tu carta" description="Empezá por una sección, por ejemplo Entradas." />
      ) : (
        <div className="space-y-5">
          {sections.map((section) => (
            <section key={section.id} className="overflow-hidden rounded-xl border bg-card">
              <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
                <h2 className="font-medium">{section.name}</h2>
                {!section.isVisible ? <StatusBadge tone="neutral">Oculta en el sitio</StatusBadge> : null}
              </div>
              <ul className="divide-y">
                {section.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className={item.isAvailable ? 'font-medium' : 'font-medium text-muted-foreground line-through'}>
                        {item.name}
                      </p>
                      {item.description ? (
                        <p className="text-sm text-muted-foreground text-pretty">{item.description}</p>
                      ) : null}
                      {item.tags.length > 0 ? (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {item.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <span className="shrink-0 font-medium tabular-nums">{formatMoney(item.priceCents, org.currency)}</span>
                    <Switch checked={item.isAvailable} aria-label={`Disponibilidad de ${item.name}`} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
