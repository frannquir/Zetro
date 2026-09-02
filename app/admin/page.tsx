import Link from 'next/link'
import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import { listAdminOrgs } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime, formatNumber } from '@/lib/format'
import { orgStatusLabel, orgStatusTone, paymentStatusLabel, paymentStatusTone, verticalLabel } from '@/lib/labels'

export const metadata: Metadata = { title: 'Clientes — Consola Zetro' }

export default async function AdminOrgsPage() {
  const orgs = await listAdminOrgs()

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Todos los negocios que corren en el portal."
        actions={
          <Button asChild>
            <Link href="/admin/orgs/nueva">
              <Plus /> Nuevo cliente
            </Link>
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Negocio</TableHead>
              <TableHead className="hidden sm:table-cell">Rubro</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden text-right md:table-cell">Reservas (30 días)</TableHead>
              <TableHead className="hidden lg:table-cell">Pago</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Última actividad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs.map((item) => (
              <TableRow key={item.org.id}>
                <TableCell className="p-0">
                  <Link href={`/admin/orgs/${item.org.id}`} className="block px-4 py-2.5">
                    <span className="block font-medium">{item.org.name}</span>
                    <span className="block text-xs text-muted-foreground">/{item.org.slug}</span>
                  </Link>
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {verticalLabel(item.org.vertical)}
                </TableCell>
                <TableCell>
                  <StatusBadge tone={orgStatusTone(item.org.status)}>{orgStatusLabel(item.org.status)}</StatusBadge>
                </TableCell>
                <TableCell className="hidden text-right tabular-nums md:table-cell">
                  {formatNumber(item.bookingsLast30)}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <StatusBadge tone={paymentStatusTone(item.paymentStatus)}>
                    {paymentStatusLabel(item.paymentStatus)}
                  </StatusBadge>
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground lg:table-cell">
                  {item.lastActivityAt ? formatDateTime(item.lastActivityAt, { timeZone: item.org.timeZone }) : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
