import type { Metadata } from 'next'
import { getMembership, getPayments } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { StatusBadge } from '@/components/status-badge'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatMonth, formatMoney, formatDate } from '@/lib/format'
import { paymentStatusLabel, paymentStatusTone } from '@/lib/labels'

export const metadata: Metadata = { title: 'Pagos — Zetro' }

export default async function PagosPage({ params }: PageProps<'/panel/[orgSlug]/pagos'>) {
  const { orgSlug } = await params
  const { org } = await getMembership(orgSlug)
  const payments = await getPayments(orgSlug)

  return (
    <>
      <PageHeader title="Pagos" description="Lo carga Zetro a mano cada mes. Acá solo mirás el estado." />

      {payments.length === 0 ? (
        <EmptyState title="Todavía no hay pagos registrados" />
      ) : (
        <Card size="sm" className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden sm:table-cell">Vencimiento</TableHead>
                <TableHead className="hidden sm:table-cell">Método</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium first-letter:uppercase">
                    {formatMonth(payment.periodMonth, { timeZone: org.timeZone })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={paymentStatusTone(payment.status)}>{paymentStatusLabel(payment.status)}</StatusBadge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {payment.dueDate ? formatDate(payment.dueDate, { timeZone: org.timeZone }) : '—'}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground capitalize sm:table-cell">
                    {payment.method ?? '—'}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatMoney(payment.amountCents, payment.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  )
}
