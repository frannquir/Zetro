import type { Metadata } from 'next'
import { listAllPayments } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatMonth, formatMoney } from '@/lib/format'
import { paymentStatusLabel, paymentStatusTone } from '@/lib/labels'

export const metadata: Metadata = { title: 'Pagos — Consola Zetro' }

export default async function AdminPagosPage() {
  const rows = await listAllPayments()

  return (
    <>
      <PageHeader title="Pagos" description="Bookkeeping manual, sin proveedor de pagos. Se carga a mano cada mes." />

      <Card size="sm" className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Negocio</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ payment, org }) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{org.name}</TableCell>
                <TableCell className="first-letter:uppercase">{formatMonth(payment.periodMonth, { timeZone: org.timeZone })}</TableCell>
                <TableCell>
                  <StatusBadge tone={paymentStatusTone(payment.status)}>{paymentStatusLabel(payment.status)}</StatusBadge>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatMoney(payment.amountCents, payment.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}
