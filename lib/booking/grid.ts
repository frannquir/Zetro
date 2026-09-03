import type { AvailabilityRule } from '@/lib/data'

export function localMinutes(iso: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso))
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0)
  return hour * 60 + minute
}

export function localDay(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso))
}

function toMinutes(time: string) {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + (minute || 0)
}

export function dayRange(rules: AvailabilityRule[], weekday: number) {
  const forDay = rules.filter((rule) => rule.weekday === weekday)
  if (forDay.length === 0) return null
  return {
    start: Math.min(...forDay.map((rule) => toMinutes(rule.opensAt))),
    end: Math.max(...forDay.map((rule) => toMinutes(rule.closesAt))),
  }
}

export function weekRange(rules: AvailabilityRule[]) {
  if (rules.length === 0) return { start: 8 * 60, end: 22 * 60 }
  return {
    start: Math.min(...rules.map((rule) => toMinutes(rule.opensAt))),
    end: Math.max(...rules.map((rule) => toMinutes(rule.closesAt))),
  }
}

export function addDays(date: string, days: number) {
  const base = new Date(`${date}T12:00:00Z`)
  base.setUTCDate(base.getUTCDate() + days)
  return base.toISOString().slice(0, 10)
}

export function startOfWeek(date: string) {
  const base = new Date(`${date}T12:00:00Z`)
  const weekday = base.getUTCDay()
  return addDays(date, -((weekday + 6) % 7))
}

export function weekdayOf(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay()
}

export function todayIn(timeZone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function hourTicks(start: number, end: number) {
  const ticks = []
  for (let minutes = Math.floor(start / 60) * 60; minutes <= end; minutes += 60) ticks.push(minutes)
  return ticks
}

export function labelForMinutes(minutes: number) {
  const hour = Math.floor(minutes / 60) % 24
  const minute = minutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}
