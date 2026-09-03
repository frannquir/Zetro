import { defaultCurrency, defaultTimezone } from '@/lib/org/defaults'

const locale = 'es-AR'

type Zoned = { timeZone?: string | null }

function tz(org?: Zoned) {
  return org?.timeZone || defaultTimezone
}

function parse(value: string | number | Date) {
  return value instanceof Date ? value : new Date(value)
}

export function formatTime(value: string | number | Date, org?: Zoned) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: tz(org),
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parse(value))
}

export function formatDate(value: string | number | Date, org?: Zoned) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: tz(org),
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parse(value))
}

export function formatDateLong(value: string | number | Date, org?: Zoned) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: tz(org),
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(parse(value))
}

export function formatDateTime(value: string | number | Date, org?: Zoned) {
  return `${formatDate(value, org)} ${formatTime(value, org)}`
}

export function formatMonth(value: string | number | Date, org?: Zoned) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: tz(org),
    month: 'long',
    year: 'numeric',
  }).format(parse(value))
}

export function formatWeekday(value: string | number | Date, org?: Zoned) {
  return new Intl.DateTimeFormat(locale, { timeZone: tz(org), weekday: 'short' }).format(parse(value))
}

export function formatMoney(cents: number | null | undefined, currency = defaultCurrency) {
  if (cents === null || cents === undefined) return '—'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat(locale).format(value)
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(value)
}

export function formatDelta(value: number) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value * 100)}%`
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

export function formatRelativeDay(value: string | number | Date, org?: Zoned) {
  const zone = tz(org)
  const key = (d: Date) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
  const target = key(parse(value))
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 86_400_000)
  const yesterday = new Date(today.getTime() - 86_400_000)
  if (target === key(today)) return 'hoy'
  if (target === key(tomorrow)) return 'mañana'
  if (target === key(yesterday)) return 'ayer'
  return formatDateLong(value, org)
}
