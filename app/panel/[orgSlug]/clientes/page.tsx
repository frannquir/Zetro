import type { Metadata } from 'next'
import { getCustomerHistory, getMembership, listCustomers } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { SearchBox } from '@/components/panel/search-box'
import { CustomerDrawer } from '@/components/panel/customer-drawer'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime } from '@/lib/format'

export const metadata: Metadata = { title: 'Clientes — Zetro' }

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ClientesPage({ params, searchParams }: PageProps<'/panel/[orgSlug]/clientes'>) {
  const { orgSlug } = await params
  const query = await searchParams
  const { org } = await getMembership(orgSlug)
  const term = single(query.q)
  const selectedId = single(query.cliente)

  const customers = await listCustomers(orgSlug, term)
  const selected = selectedId ? customers.find((customer) => customer.id === selectedId) : null
  const history = selected ? await getCustomerHistory(orgSlug, selected.id) : []

  function hrefFor(id: string) {
    const next = new URLSearchParams()
    if (term) next.set('q', term)
    next.set('cliente', id)
    return `/panel/${orgSlug}/clientes?${next.toString()}`
  }

  return (
    <>
      <PageHeader title="Clientes" description="Se arma solo con cada reserva que entra." />

      <SearchBox placeholder="Buscar por nombre, mail o teléfono" />

      {customers.length === 0 ? (
        <EmptyState
          title="Todavía no hay clientes"
          description="En cuanto entre la primera reserva, el cliente aparece acá."
        />
      ) : (
        <Card size="sm" className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden sm:table-cell">Contacto</TableHead>
                <TableHead className="text-right">Visitas</TableHead>
                <TableHead className="hidden text-right md:table-cell">Última visita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="p-0">
                    <a href={hrefFor(customer.id)} className="block px-4 py-2.5 font-medium">
                      {customer.fullName}
                    </a>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {customer.phone ?? customer.email ?? '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{customer.visitsCount}</TableCell>
                  <TableCell className="hidden text-right text-muted-foreground md:table-cell">
                    {customer.lastVisitAt ? formatDateTime(customer.lastVisitAt, { timeZone: org.timeZone }) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {selected ? <CustomerDrawer customer={selected} history={history} org={org} /> : null}
    </>
  )
}
