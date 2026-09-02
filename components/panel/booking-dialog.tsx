'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { CalendarClock, Mail, MessageSquare, Phone, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/status-badge'
import type { Booking } from '@/lib/data'
import { formatDateLong, formatTime } from '@/lib/format'
import { bookingSourceLabel, bookingStatusLabel, bookingStatusTone } from '@/lib/labels'
import { setBookingStatus } from '@/lib/data/actions'
import { vocabularyFor } from '@/lib/vertical'

const transitions: Record<string, { value: string; label: string; variant?: 'outline' | 'destructive' }[]> = {
  pending: [
    { value: 'confirmed', label: 'Confirmar' },
    { value: 'cancelled', label: 'Cancelar', variant: 'destructive' },
  ],
  confirmed: [
    { value: 'seated', label: 'Llegó' },
    { value: 'no_show', label: 'No vino', variant: 'outline' },
    { value: 'cancelled', label: 'Cancelar', variant: 'destructive' },
  ],
  seated: [{ value: 'completed', label: 'Cerrar' }],
}

export function BookingDialog({
  booking,
  orgSlug,
  timeZone,
  vertical,
}: {
  booking: Booking
  orgSlug: string
  timeZone: string
  vertical: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const words = vocabularyFor(vertical)

  function close() {
    const next = new URLSearchParams(params)
    next.delete('reserva')
    const search = next.toString()
    router.replace(search ? `${pathname}?${search}` : pathname)
  }

  const actions = transitions[booking.status] ?? []

  return (
    <Dialog open onOpenChange={(open) => (open ? null : close())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{booking.customer?.fullName ?? 'Sin nombre'}</DialogTitle>
          <DialogDescription className="first-letter:uppercase">
            {formatDateLong(booking.startsAt, { timeZone })} ·{' '}
            {formatTime(booking.startsAt, { timeZone })}–{formatTime(booking.endsAt, { timeZone })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge variant="solid" tone={bookingStatusTone(booking.status)}>
            {bookingStatusLabel(booking.status)}
          </StatusBadge>
          <span className="text-[0.8125rem] text-ink-3">Entró por {bookingSourceLabel(booking.source).toLowerCase()}</span>
        </div>

        <dl className="grid gap-3 text-[0.9375rem] sm:grid-cols-2">
          <Row icon={CalendarClock} label={words.resource} value={booking.resource.name} />
          {booking.service ? <Row icon={CalendarClock} label="Servicio" value={booking.service.name} /> : null}
          {words.showParty ? <Row icon={Users} label={words.party} value={String(booking.partySize)} /> : null}
          {booking.customer?.phone ? <Row icon={Phone} label="Teléfono" value={booking.customer.phone} /> : null}
          {booking.customer?.email ? <Row icon={Mail} label="Mail" value={booking.customer.email} /> : null}
        </dl>

        {booking.notes || booking.internalNotes ? (
          <>
            <Separator />
            <div className="space-y-3 text-[0.9375rem]">
              {booking.notes ? (
                <div>
                  <p className="flex items-center gap-1.5 font-medium">
                    <MessageSquare className="size-3.5" /> Nota del cliente
                  </p>
                  <p className="mt-1 text-ink-3 text-pretty">{booking.notes}</p>
                </div>
              ) : null}
              {booking.internalNotes ? (
                <div className="rounded-md bg-paper-2 p-3">
                  <p className="font-medium">Nota interna</p>
                  <p className="mt-1 text-ink-3 text-pretty">{booking.internalNotes}</p>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {actions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <form
                key={action.value}
                action={async () => {
                  await setBookingStatus(orgSlug, booking.id, action.value)
                  close()
                }}
              >
                <Button type="submit" size="sm" variant={action.variant}>
                  {action.label}
                </Button>
              </form>
            ))}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-ink-4">
        <Icon className="size-3.5" /> {label}
      </dt>
      <dd className="mt-0.5 font-medium text-ink first-letter:uppercase">{value}</dd>
    </div>
  )
}
