import type { Metadata } from 'next'
import { Calendar, Copy, KeyRound, TriangleAlert } from 'lucide-react'
import { getGoogleConnections, getMembership, getSites } from '@/lib/data'
import { Button } from '@/components/ui/button'
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
          <div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground text-pretty">
              Conectá tu Google Calendar y cada reserva confirmada aparece ahí sola.
            </p>
            <Button disabled>Conectar</Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {connections.map((connection) => (
              <li key={connection.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{connection.googleEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      {connection.resourceName ?? 'Calendario del negocio'} · sincronizado el{' '}
                      {connection.lastSyncedAt ? formatDateTime(connection.lastSyncedAt, { timeZone: org.timeZone }) : '—'}
                    </p>
                  </div>
                  <StatusBadge tone={connection.status === 'error' ? 'danger' : 'positive'}>
                    {connection.status === 'error' ? 'Con error' : 'Conectado'}
                  </StatusBadge>
                </div>
                {connection.lastError ? (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-destructive">
                    <TriangleAlert className="mt-0.5 size-3.5 shrink-0" /> {connection.lastError}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">
          Es de un solo sentido: lo que confirmás acá aparece en Google. Lo que editás en Google no vuelve al panel.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-1.5 font-medium">
          <KeyRound className="size-4" /> Clave de tu sitio
        </h2>
        {sites.map((site) => (
          <div key={site.id} className="space-y-2 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{site.domain}</p>
              <StatusBadge tone={site.status === 'live' ? 'positive' : 'neutral'}>
                {site.status === 'live' ? 'En línea' : site.status}
              </StatusBadge>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md bg-muted px-3 py-2 text-xs">{site.publicKey}</code>
              <Button type="button" variant="outline" size="icon" disabled aria-label="Copiar clave">
                <Copy />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Va como <code>NEXT_PUBLIC_ZETRO_SITE_KEY</code> en el sitio de <code>{site.domain}</code>.
            </p>
          </div>
        ))}
      </section>
    </div>
  )
}
