'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Booking, Org, Resource } from '@/lib/data'
import { formatTime, formatWeekday } from '@/lib/format'
import { bookingStatusLabel, bookingStatusTone } from '@/lib/labels'
import { addDays, hourTicks, labelForMinutes, localDay, localMinutes, todayIn } from '@/lib/booking/grid'
import { cn } from '@/lib/utils'

const pxPerHour = 72

const blockTones: Record<string, string> = {
  positive: 'bg-ok-soft border-l-ok text-ink',
  warning: 'bg-warn-soft border-l-warn text-ink',
  danger: 'bg-n-100 border-l-err text-ink-3 line-through decoration-ink-4',
  info: 'bg-info-soft border-l-info text-ink',
  neutral: 'bg-n-100 border-l-n-400 text-ink',
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
      height: Math.max(((to - from) / 60) * pxPerHour, 28),
      lane,
      lanes: 1,
    }
  })

  const lanes = Math.max(laneEnds.length, 1)
  return rows.map((row) => ({ ...row, lanes }))
}

function halfHourTicks(start: number, end: number) {
  const ticks: number[] = []
  for (let minutes = Math.floor(start / 60) * 60; minutes <= end; minutes += 30) ticks.push(minutes)
  return ticks
}

function TimeGutter({ start, end }: { start: number; end: number }) {
  return (
    <div className="relative w-12 shrink-0" style={{ height: ((end - start) / 60) * pxPerHour }}>
      {hourTicks(start, end).map((minutes) => (
        <span
          key={minutes}
          className="absolute right-2 -translate-y-1/2 text-[0.6875rem] leading-none tracking-[0.02em] font-medium tnum text-ink-4"
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
      {halfHourTicks(start, end).map((minutes) => (
        <span
          key={minutes}
          className={cn(
            'pointer-events-none absolute inset-x-0 border-t',
            minutes % 60 === 0 ? 'border-n-200' : 'border-n-100',
          )}
          style={{ top: ((minutes - start) / 60) * pxPerHour }}
        />
      ))}
    </>
  )
}

function NowLine({ start, end, timeZone }: { start: number; end: number; timeZone: string }) {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 60_000)
    return () => clearInterval(id)
  }, [router])

  const now = localMinutes(new Date().toISOString(), timeZone)
  if (now < start || now > end) return null
  const top = ((now - start) / 60) * pxPerHour

  return (
    <span className="pointer-events-none absolute inset-x-0 z-10 border-t border-brand" style={{ top }}>
      <span className="absolute -top-[3px] -left-1.5 size-[6px] rounded-full bg-brand" />
    </span>
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
        'absolute overflow-hidden rounded-sm border-l-[3px] px-2 py-1 text-[0.8125rem] leading-[1.3] transition-colors duration-[120ms] hover:z-10 hover:bg-surface focus-visible:z-10',
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
      <span className="block truncate font-medium">{booking.customer?.fullName ?? 'Sin nombre'}</span>
      {height >= 44 ? (
        <span className="block truncate tnum text-ink-3">
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
  date,
  hrefFor,
}: {
  bookings: Booking[]
  resources: Resource[]
  org: Org
  range: { start: number; end: number }
  date: string
  hrefFor: (booking: Booking) => string
}) {
  const height = ((range.end - range.start) / 60) * pxPerHour
  const isToday = date === todayIn(org.timeZone)

  return (
    <div className="overflow-x-auto rounded-md border border-n-200 bg-surface">
      <div className="min-w-[640px]">
        <div className="sticky top-0 z-10 flex border-b border-n-300 bg-paper-2">
          <div className="w-12 shrink-0" />
          {resources.map((resource) => (
            <div key={resource.id} className="min-w-0 flex-1 border-l border-n-200 px-3 py-2.5">
              <p className="truncate text-[0.9375rem] font-medium">{resource.name}</p>
              <p className="truncate text-[0.8125rem] text-ink-3">
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
              <div key={resource.id} className="relative min-w-0 flex-1 border-l border-n-200" style={{ height }}>
                <GridLines start={range.start} end={range.end} />
                {isToday ? <NowLine start={range.start} end={range.end} timeZone={org.timeZone} /> : null}
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
    <div className="overflow-x-auto rounded-md border border-n-200 bg-surface">
      <div className="min-w-[760px]">
        <div className="sticky top-0 z-10 flex border-b border-n-300 bg-paper-2">
          <div className="w-12 shrink-0" />
          {days.map((day) => (
            <div key={day} className="relative min-w-0 flex-1 border-l border-n-200 px-3 py-2.5">
              <p className={cn('truncate text-[0.9375rem] font-medium first-letter:uppercase', day === today && 'text-brand')}>
                {formatWeekday(`${day}T12:00:00Z`, { timeZone: org.timeZone })}
              </p>
              <p className="text-[0.8125rem] tnum text-ink-3">{day.slice(8, 10)}</p>
              {day === today ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" /> : null}
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
              <div key={day} className="relative min-w-0 flex-1 border-l border-n-200" style={{ height }}>
                <GridLines start={range.start} end={range.end} />
                {day === today ? <NowLine start={range.start} end={range.end} timeZone={org.timeZone} /> : null}
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
