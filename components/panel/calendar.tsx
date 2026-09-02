import Link from 'next/link'
import type { Booking, Org, Resource } from '@/lib/data'
import { formatTime, formatWeekday } from '@/lib/format'
import { bookingStatusLabel, bookingStatusTone } from '@/lib/labels'
import { addDays, hourTicks, labelForMinutes, localDay, localMinutes } from '@/lib/booking/grid'
import { cn } from '@/lib/utils'

const pxPerHour = 68

const blockTones: Record<string, string> = {
  positive: 'bg-success/12 border-success/40 text-success-foreground',
  warning: 'bg-warning/15 border-warning/45',
  danger: 'bg-destructive/10 border-destructive/40 line-through opacity-70',
  info: 'bg-primary/12 border-primary/40',
  neutral: 'bg-muted border-border',
}

type Placed = { booking: Booking; top: number; height: number; lane: number; lanes: number }

function place(bookings: Booking[], timeZone: string, start: number, end: number): Placed[] {
  const sorted = [...bookings].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  const laneEnds: number[] = []
  const rows = sorted.map((booking) => {
    const from = Math.max(localMinutes(booking.startsAt, timeZone), start)
    const rawTo = localMinutes(booking.endsAt, timeZone)
    const to = Math.min(rawTo <= from ? end : rawTo, end)
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= from)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(to)
    } else {
      laneEnds[lane] = to
    }
    return {
      booking,
      top: ((from - start) / 60) * pxPerHour,
      height: Math.max(((to - from) / 60) * pxPerHour, 26),
      lane,
      lanes: 1,
    }
  })

  const lanes = Math.max(laneEnds.length, 1)
  return rows.map((row) => ({ ...row, lanes }))
}

function TimeGutter({ start, end }: { start: number; end: number }) {
  return (
    <div className="relative w-14 shrink-0" style={{ height: ((end - start) / 60) * pxPerHour }}>
      {hourTicks(start, end).map((minutes) => (
        <span
          key={minutes}
          className="absolute right-2 -translate-y-1/2 text-xs tabular-nums text-muted-foreground"
          style={{ top: ((minutes - start) / 60) * pxPerHour }}
        >
          {labelForMinutes(minutes)}
        </span>
      ))}
    </div>
  )
}

function GridLines({ start, end }: { start: number; end: number }) {
  return (
    <>
      {hourTicks(start, end).map((minutes) => (
        <span
          key={minutes}
          className="pointer-events-none absolute inset-x-0 border-t border-border/70"
          style={{ top: ((minutes - start) / 60) * pxPerHour }}
        />
      ))}
    </>
  )
}

function Block({
  placed,
  org,
  href,
  compact,
}: {
  placed: Placed
  org: Org
  href: string
  compact?: boolean
}) {
  const { booking, top, height, lane, lanes } = placed
  const tone = bookingStatusTone(booking.status)

  return (
    <Link
      href={href}
      className={cn(
        'absolute overflow-hidden rounded-md border px-2 py-1 text-xs transition-shadow hover:z-10 hover:shadow-md',
        blockTones[tone] ?? blockTones.neutral,
      )}
      style={{
        top,
        height,
        left: `calc(${(lane / lanes) * 100}% + 2px)`,
        width: `calc(${100 / lanes}% - 4px)`,
      }}
      title={`${formatTime(booking.startsAt, { timeZone: org.timeZone })} · ${booking.customer?.fullName ?? 'Sin nombre'} · ${bookingStatusLabel(booking.status)}`}
    >
      <span className="block truncate font-medium text-foreground">
        {booking.customer?.fullName ?? 'Sin nombre'}
      </span>
      {height > 40 ? (
        <span className="block truncate text-muted-foreground">
          {formatTime(booking.startsAt, { timeZone: org.timeZone })}
          {compact ? '' : ` · ${booking.resource.name}`}
        </span>
      ) : null}
    </Link>
  )
}

export function DayCalendar({
  bookings,
  resources,
  org,
  range,
  hrefFor,
}: {
  bookings: Booking[]
  resources: Resource[]
  org: Org
  range: { start: number; end: number }
  hrefFor: (booking: Booking) => string
}) {
  const height = ((range.end - range.start) / 60) * pxPerHour

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <div className="min-w-[640px]">
        <div className="sticky top-0 z-10 flex border-b bg-card/95 backdrop-blur-sm">
          <div className="w-14 shrink-0" />
          {resources.map((resource) => (
            <div key={resource.id} className="min-w-0 flex-1 border-l px-3 py-2.5">
              <p className="truncate text-sm font-medium">{resource.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {resource.zone ?? `Capacidad ${resource.capacity}`}
              </p>
            </div>
          ))}
        </div>

        <div className="flex">
          <TimeGutter start={range.start} end={range.end} />
          {resources.map((resource) => {
            const placed = place(
              bookings.filter((booking) => booking.resource.id === resource.id),
              org.timeZone,
              range.start,
              range.end,
            )
            return (
              <div key={resource.id} className="relative min-w-0 flex-1 border-l" style={{ height }}>
                <GridLines start={range.start} end={range.end} />
                {placed.map((item) => (
                  <Block key={item.booking.id} placed={item} org={org} href={hrefFor(item.booking)} compact />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function WeekCalendar({
  bookings,
  org,
  weekStart,
  range,
  hrefFor,
}: {
  bookings: Booking[]
  org: Org
  weekStart: string
  range: { start: number; end: number }
  hrefFor: (booking: Booking) => string
}) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
  const height = ((range.end - range.start) / 60) * pxPerHour
  const today = localDay(new Date().toISOString(), org.timeZone)

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <div className="min-w-[760px]">
        <div className="sticky top-0 z-10 flex border-b bg-card/95 backdrop-blur-sm">
          <div className="w-14 shrink-0" />
          {days.map((day) => (
            <div key={day} className={cn('min-w-0 flex-1 border-l px-3 py-2.5', day === today && 'bg-primary/5')}>
              <p className="truncate text-sm font-medium first-letter:uppercase">
                {formatWeekday(`${day}T12:00:00Z`, { timeZone: org.timeZone })}
              </p>
              <p className="text-xs tabular-nums text-muted-foreground">{day.slice(8, 10)}</p>
            </div>
          ))}
        </div>

        <div className="flex">
          <TimeGutter start={range.start} end={range.end} />
          {days.map((day) => {
            const placed = place(
              bookings.filter((booking) => localDay(booking.startsAt, org.timeZone) === day),
              org.timeZone,
              range.start,
              range.end,
            )
            return (
              <div
                key={day}
                className={cn('relative min-w-0 flex-1 border-l', day === today && 'bg-primary/5')}
                style={{ height }}
              >
                <GridLines start={range.start} end={range.end} />
                {placed.map((item) => (
                  <Block key={item.booking.id} placed={item} org={org} href={hrefFor(item.booking)} compact />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
