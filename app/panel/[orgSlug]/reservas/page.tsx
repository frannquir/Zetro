import Link from 'next/link'
import type { Metadata } from 'next'
import { CalendarPlus } from 'lucide-react'
import {
  getAvailabilityRules,
  getBooking,
  getMembership,
  getResources,
  listBookings,
} from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { BookingFilters } from '@/components/panel/booking-filters'
import { ViewSwitcher } from '@/components/panel/view-switcher'
import { BookingList } from '@/components/panel/booking-list'
import { BookingDialog } from '@/components/panel/booking-dialog'
import { DayCalendar, WeekCalendar } from '@/components/panel/calendar'
import { addDays, dayRange, startOfWeek, todayIn, weekRange, weekdayOf } from '@/lib/booking/grid'
import { formatDateLong } from '@/lib/format'
import { vocabularyFor } from '@/lib/vertical'

export const metadata: Metadata = { title: 'Reservas — Zetro' }

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ReservasPage({ params, searchParams }: PageProps<'/panel/[orgSlug]/reservas'>) {
  const { orgSlug } = await params
  const query = await searchParams
  const { org } = await getMembership(orgSlug)
  const words = vocabularyFor(org.vertical)

  const view = single(query.vista) ?? 'lista'
  const date = single(query.fecha) ?? todayIn(org.timeZone)
  const status = single(query.estado)
  const resourceId = single(query.recurso)
  const term = single(query.q)
  const selectedId = single(query.reserva)

  const weekStart = startOfWeek(date)
  const from = view === 'semana' ? weekStart : view === 'dia' ? date : date
  const to = view === 'semana' ? addDays(weekStart, 6) : view === 'dia' ? date : addDays(date, 30)

  const [bookings, resources, rules, selected] = await Promise.all([
    listBookings(orgSlug, { from, to, status, resourceId, query: term }),
    getResources(orgSlug),
    getAvailabilityRules(orgSlug),
    selectedId ? getBooking(orgSlug, selectedId) : Promise.resolve(null),
  ])

  const activeResources = resources.filter(
    (resource) => resource.isActive && (!resourceId || resource.id === resourceId),
  )
  const range = view === 'dia' ? (dayRange(rules, weekdayOf(date)) ?? weekRange(rules)) : weekRange(rules)

  const label =
    view === 'semana'
      ? `${formatDateLong(`${weekStart}T12:00:00Z`, { timeZone: org.timeZone })} — ${formatDateLong(`${addDays(weekStart, 6)}T12:00:00Z`, { timeZone: org.timeZone })}`
      : formatDateLong(`${date}T12:00:00Z`, { timeZone: org.timeZone })

  const hrefFor = (id: string) => {
    const next = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      const flat = single(value)
      if (flat && key !== 'reserva') next.set(key, flat)
    }
    next.set('reserva', id)
    return `/panel/${orgSlug}/reservas?${next.toString()}`
  }

  return (
    <>
      <PageHeader
        title={words.bookings}
        description={`Todo lo que entra por tu sitio, por teléfono o cargado a mano, en un solo lugar.`}
        actions={
          <Button asChild>
            <Link href={`/panel/${orgSlug}/reservas/nueva`}>
              <CalendarPlus /> {words.newBooking}
            </Link>
          </Button>
        }
      />

      <div className="space-y-4">
        <BookingFilters resources={resources.filter((resource) => resource.isActive)} />
        <ViewSwitcher view={view} date={date} timeZone={org.timeZone} label={label} />

        {bookings.length === 0 ? (
          <EmptyState
            title={`No hay ${words.bookingPlural} con estos filtros`}
            description="Probá con otro rango de fechas o limpiá los filtros."
            action={
              <Button asChild size="sm">
                <Link href={`/panel/${orgSlug}/reservas/nueva`}>{words.newBooking}</Link>
              </Button>
            }
          />
        ) : view === 'dia' ? (
          <DayCalendar
            bookings={bookings}
            resources={activeResources}
            org={org}
            range={range}
            date={date}
            hrefFor={(booking) => hrefFor(booking.id)}
          />
        ) : view === 'semana' ? (
          <WeekCalendar
            bookings={bookings}
            org={org}
            weekStart={weekStart}
            range={range}
            hrefFor={(booking) => hrefFor(booking.id)}
          />
        ) : (
          <div className="rounded-md border border-n-200 bg-surface">
            <BookingList bookings={bookings} org={org} href={(booking) => hrefFor(booking.id)} />
          </div>
        )}
      </div>

      {selected ? (
        <BookingDialog booking={selected} orgSlug={orgSlug} timeZone={org.timeZone} vertical={org.vertical} />
      ) : null}
    </>
  )
}
