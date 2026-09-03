import type { Metadata } from 'next'
import { Calendar, Copy, KeyRound, TriangleAlert } from 'lucide-react'
import { getGoogleConnections, getMembership, getSites } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import { formatDateTime } from '@/lib/format'

export const metadata: Metadata = { title: 'Integraciones — Zetro' }

export default async function IntegracionesPage({ params }: PageProps<'/panel/[orgSlug]/ajustes/integraciones'>) {
  const { orgSlug } = await params
  const { org } = await getMembership(orgSlug)
  const [sites, connections] = await Promise.all([getSites(orgSlug), getGoogleConnections(orgSlug)])

  return (
    <div className="max-w-2xl space-y-8">
      <section className="space-y-3">
        <h2 className="flex items-center gap-1.5 font-medium">
          <Calendar className="size-4" /> Google Calendar
        </h2>
        {connections.length === 0 ? (
          <Card className="flex-row items-center justify-between gap-4 px-4">
            <p className="text-[0.9375rem] text-ink-3 text-pretty">
              Conectá tu Google Calendar y cada reserva confirmada aparece ahí sola.
            </p>
            <Button disabled>Conectar</Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {connections.map((connection) => (
              <Card key={connection.id} className="px-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[0.9375rem] font-medium text-ink">{connection.googleEmail}</p>
                    <p className="text-[0.8125rem] text-ink-3">
                      {connection.resourceName ?? 'Calendario del negocio'} · sincronizado el{' '}
                      {connection.lastSyncedAt ? formatDateTime(connection.lastSyncedAt, { timeZone: org.timeZone }) : '—'}
                    </p>
                  </div>
                  <StatusBadge tone={connection.status === 'error' ? 'danger' : 'positive'}>
                    {connection.status === 'error' ? 'Con error' : 'Conectado'}
                  </StatusBadge>
                </div>
                {connection.lastError ? (
                  <p className="mt-2 flex items-start gap-1.5 text-[0.8125rem] text-err">
                    <TriangleAlert className="mt-0.5 size-3.5 shrink-0" /> {connection.lastError}
                  </p>
                ) : null}
              </Card>
            ))}
          </div>
        )}
        <p className="text-[0.8125rem] text-ink-4">
          Es de un solo sentido: lo que confirmás acá aparece en Google. Lo que editás en Google no vuelve al panel.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-1.5 font-medium">
          <KeyRound className="size-4" /> Clave de tu sitio
        </h2>
        {sites.map((site) => (
          <Card key={site.id} className="gap-2 px-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.9375rem] font-medium text-ink">{site.domain}</p>
              <StatusBadge tone={site.status === 'live' ? 'positive' : 'neutral'}>
                {site.status === 'live' ? 'En línea' : site.status}
              </StatusBadge>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-sm bg-paper-2 px-3 py-2 text-xs">{site.publicKey}</code>
              <Button type="button" variant="outline" size="icon" disabled aria-label="Copiar clave">
                <Copy />
              </Button>
            </div>
            <p className="text-[0.8125rem] text-ink-4">
              Va como <code>NEXT_PUBLIC_ZETRO_SITE_KEY</code> en el sitio de <code>{site.domain}</code>.
            </p>
          </Card>
        ))}
      </section>
    </div>
  )
}
