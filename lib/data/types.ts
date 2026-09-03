import type { OrgSettings } from '@/lib/org/defaults'

export type Org = {
  id: string
  name: string
  slug: string
  vertical: string
  status: string
  timeZone: string
  currency: string
  logoUrl: string | null
  phone: string | null
  address: string | null
  whatsapp: string | null
  settings: OrgSettings
}

export type Membership = { org: Org; role: string }

export type Viewer = {
  id: string
  email: string
  fullName: string
  isPlatformAdmin: boolean
  memberships: Membership[]
}

export type Resource = {
  id: string
  name: string
  kind: string
  capacity: number
  isActive: boolean
  zone: string | null
}

export type Service = {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  bufferBeforeMinutes: number
  bufferAfterMinutes: number
  priceCents: number | null
  isPublic: boolean
  isActive: boolean
}

export type Customer = {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  notes: string | null
  marketingOptIn: boolean
  visitsCount: number
  lastVisitAt: string | null
  createdAt: string
}

export type Booking = {
  id: string
  startsAt: string
  endsAt: string
  partySize: number
  status: string
  source: string
  notes: string | null
  internalNotes: string | null
  resource: Pick<Resource, 'id' | 'name' | 'kind'>
  service: Pick<Service, 'id' | 'name'> | null
  customer: Pick<Customer, 'id' | 'fullName' | 'email' | 'phone'> | null
}

export type AvailabilityRule = {
  id: string
  resourceId: string | null
  weekday: number
  opensAt: string
  closesAt: string
}

export type AvailabilityException = {
  id: string
  resourceId: string | null
  date: string
  isClosed: boolean
  opensAt: string | null
  closesAt: string | null
  note: string | null
}

export type Slot = { startsAt: string; endsAt: string; resourceId: string; resourceName: string }

export type DashboardSummary = {
  bookingsToday: number
  bookingsNext7: number
  cancellations: number
  newCustomers: number
  pageviews: number
  topPath: string | null
  liveVisitors: number
  occupancy: number
  deltas: { bookings: number; pageviews: number; customers: number }
}

export type AnalyticsOverview = {
  pageviews: number
  visitors: number
  sessions: number
  bounceRate: number
  bookings: number
  deltas: { pageviews: number; visitors: number; sessions: number; bounceRate: number }
  daily: { day: string; pageviews: number; visitors: number }[]
}

export type AnalyticsRow = { value: string; pageviews: number; visitors: number }

export type MenuSection = {
  id: string
  name: string
  isVisible: boolean
  items: MenuItem[]
}

export type MenuItem = {
  id: string
  name: string
  description: string | null
  priceCents: number | null
  isAvailable: boolean
  tags: string[]
}

export type GroupSession = {
  id: string
  serviceName: string
  instructorName: string | null
  resourceName: string | null
  startsAt: string
  endsAt: string
  capacity: number
  bookedCount: number
  status: string
}

export type OrgEvent = {
  id: string
  title: string
  description: string | null
  startsAt: string
  endsAt: string
  capacity: number | null
  priceCents: number | null
  isPublished: boolean
}

export type PaymentRecord = {
  id: string
  periodMonth: string
  amountCents: number
  currency: string
  status: string
  dueDate: string | null
  paidAt: string | null
  method: string | null
  note: string | null
}

export type Member = {
  id: string
  fullName: string
  email: string
  role: string
  createdAt: string
}

export type Invite = {
  id: string
  email: string
  role: string
  expiresAt: string
  acceptedAt: string | null
}

export type Site = {
  id: string
  name: string
  domain: string
  publicKey: string
  status: string
}

export type GoogleConnection = {
  id: string
  googleEmail: string
  calendarId: string
  resourceName: string | null
  status: string
  lastError: string | null
  lastSyncedAt: string | null
}

export type Lead = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  sourcePath: string | null
  status: string
  createdAt: string
  orgName: string | null
}

export type AdminOrg = {
  org: Org
  ownerEmail: string | null
  membersCount: number
  bookingsLast30: number
  lastActivityAt: string | null
  paymentStatus: string
}
