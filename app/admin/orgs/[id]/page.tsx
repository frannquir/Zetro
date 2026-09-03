import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAdminOrg } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatDateTime, formatNumber } from '@/lib/format'
import { orgStatusLabel, orgStatusTone, paymentStatusLabel, paymentStatusTone, verticalLabel } from '@/lib/labels'

export async function generateMetadata({ params }: PageProps<'/admin/orgs/[id]'>): Promise<Metadata> {
  const { id } = await params
  const item = await getAdminOrg(id)
  return { title: item ? `${item.org.name} — Consola Zetro` : 'Cliente — Consola Zetro' }
}

export default async function AdminOrgDetailPage({ params }: PageProps<'/admin/orgs/[id]'>) {
  const { id } = await params
  const item = await getAdminOrg(id)
  if (!item) notFound()

  return (
    <>
      <PageHeader
        title={item.org.name}
        description={`/${item.org.slug} · ${verticalLabel(item.org.vertical)}`}
        actions={
          <Button asChild variant="outline">
            <Link href={`/panel/${item.org.slug}`}>Entrar como soporte</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={orgStatusTone(item.org.status)}>{orgStatusLabel(item.org.status)}</StatusBadge>
        <StatusBadge tone={paymentStatusTone(item.paymentStatus)}>Pago: {paymentStatusLabel(item.paymentStatus)}</StatusBadge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Miembros" value={formatNumber(item.membersCount)} />
        <StatCard label="Reservas (30 días)" value={formatNumber(item.bookingsLast30)} />
        <StatCard
          label="Última actividad"
          value={item.lastActivityAt ? formatDateTime(item.lastActivityAt, { timeZone: item.org.timeZone }) : '—'}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-[0.9375rem] sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-4">Dueño</dt>
              <dd className="text-ink">{item.ownerEmail ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-4">Teléfono</dt>
              <dd className="text-ink">{item.org.phone ?? '—'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-ink-4">Dirección</dt>
              <dd className="text-ink">{item.org.address ?? '—'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <p className="text-xs text-ink-4">
        Cada vez que entrás a los datos de un cliente del que no sos miembro, queda registrado en el log de auditoría.
      </p>
    </>
  )
}
