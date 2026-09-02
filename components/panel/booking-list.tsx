import { Users } from 'lucide-react'
import type { Booking, Org } from '@/lib/data'
import { StatusBadge } from '@/components/status-badge'
import { bookingSourceLabel, bookingStatusLabel, bookingStatusTone } from '@/lib/labels'
import { formatTime } from '@/lib/format'
import { vocabularyFor } from '@/lib/vertical'
import { cn } from '@/lib/utils'

export function BookingList({
  bookings,
  org,
  href,
  className,
}: {
  bookings: Booking[]
  org: Org
  href?: (booking: Booking) => string
  className?: string
}) {
  const words = vocabularyFor(org.vertical)

  return (
    <ul className={cn('divide-y divide-n-200', className)}>
      {bookings.map((booking) => {
        const body = (
          <>
            <span className="w-12 shrink-0 text-[0.9375rem] font-medium tnum">
              {formatTime(booking.startsAt, { timeZone: org.timeZone })}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.9375rem] font-medium text-ink">
                {booking.customer?.fullName ?? 'Sin nombre'}
              </span>
              <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.8125rem] leading-[1.4] text-ink-3">
                <span className="truncate">{booking.resource.name}</span>
                {booking.service ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{booking.service.name}</span>
                  </>
                ) : null}
                {words.showParty ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3.5" />
                      {booking.partySize}
                    </span>
                  </>
                ) : null}
              </span>
            </span>

            <span className="hidden shrink-0 text-[0.8125rem] leading-[1.4] text-ink-4 sm:block">
              {bookingSourceLabel(booking.source)}
            </span>

            <StatusBadge tone={bookingStatusTone(booking.status)}>
              {bookingStatusLabel(booking.status)}
            </StatusBadge>
          </>
        )

        return (
          <li key={booking.id}>
            {href ? (
              <a
                href={href(booking)}
                className="flex min-h-12 w-full items-center gap-3 px-4 transition-colors duration-[120ms] hover:bg-n-100 sm:min-h-11 sm:gap-4"
              >
                {body}
              </a>
            ) : (
              <div className="flex min-h-12 items-center gap-3 px-4 sm:min-h-11 sm:gap-4">{body}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
