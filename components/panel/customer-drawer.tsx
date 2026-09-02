'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CalendarDays, Mail, Phone, StickyNote } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import type { Booking, Customer, Org } from '@/lib/data'
import { formatDateTime, formatNumber } from '@/lib/format'
import { bookingStatusLabel, bookingStatusTone } from '@/lib/labels'

export function CustomerDrawer({
  customer,
  history,
  org,
}: {
  customer: Customer
  history: Booking[]
  org: Org
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function close() {
    const next = new URLSearchParams(params)
    next.delete('cliente')
    const search = next.toString()
    router.replace(search ? `${pathname}?${search}` : pathname)
  }

  return (
    <Sheet open onOpenChange={(open) => (open ? null : close())}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{customer.fullName}</SheetTitle>
          <SheetDescription>
            Cliente desde {formatDateTime(customer.createdAt, { timeZone: org.timeZone })}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto px-4 pb-6">
          <dl className="space-y-2.5 text-sm">
            {customer.phone ? (
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                <dd>{customer.phone}</dd>
              </div>
            ) : null}
            {customer.email ? (
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <dd className="truncate">{customer.email}</dd>
              </div>
            ) : null}
            {customer.notes ? (
              <div className="flex items-start gap-2">
                <StickyNote className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <dd className="text-muted-foreground text-pretty">{customer.notes}</dd>
              </div>
            ) : null}
          </dl>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Visitas</p>
              <p className="text-lg font-semibold">{formatNumber(customer.visitsCount)}</p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Recibe novedades</p>
              <p className="text-lg font-semibold">{customer.marketingOptIn ? 'Sí' : 'No'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <CalendarDays className="size-4" /> Historial
            </p>

            {history.length === 0 ? (
              <EmptyState className="border-0 bg-transparent py-8" title="Todavía no tiene reservas" />
            ) : (
              <ul className="space-y-2">
                {history.map((booking) => (
                  <li key={booking.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {formatDateTime(booking.startsAt, { timeZone: org.timeZone })}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {booking.resource.name}
                        {booking.service ? ` · ${booking.service.name}` : ''}
                      </span>
                    </span>
                    <StatusBadge tone={bookingStatusTone(booking.status)}>{bookingStatusLabel(booking.status)}</StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
