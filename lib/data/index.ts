import { cache } from 'react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { readSettings } from '@/lib/org/defaults'
import * as demo from './demo'
import type { Booking, Membership, Org, Viewer } from './types'

export * from './types'

type OrgRow = {
  id: string
  name: string
  slug: string
  vertical: string
  status: string
  timezone: string
  currency: string
  logo_url: string | null
  phone: string | null
  address: string | null
  whatsapp: string | null
  settings: unknown
}

function toOrg(row: OrgRow): Org {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    vertical: row.vertical,
    status: row.status,
    timeZone: row.timezone,
    currency: row.currency,
    logoUrl: row.logo_url,
    phone: row.phone,
    address: row.address,
    whatsapp: row.whatsapp,
    settings: readSettings(row.settings),
  }
}

export const getViewer = cache(async (): Promise<Viewer> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile, memberships] = await Promise.all([
    supabase.from('profiles').select('full_name, is_platform_admin').eq('id', user.id).maybeSingle(),
    supabase
      .from('memberships')
      .select(
        'role, orgs(id, name, slug, vertical, status, timezone, currency, logo_url, phone, address, whatsapp, settings)',
      )
      .eq('user_id', user.id),
  ])

  const rows = (memberships.data ?? []) as { role: string; orgs: OrgRow | null }[]

  return {
    id: user.id,
    email: user.email ?? '',
    fullName: profile.data?.full_name ?? user.email ?? '',
    isPlatformAdmin: profile.data?.is_platform_admin ?? false,
    memberships: rows
      .flatMap((row) => (row.orgs ? [{ org: toOrg(row.orgs), role: row.role }] : []))
      .sort((a, b) => a.org.name.localeCompare(b.org.name)),
  }
})

export async function getMembership(orgSlug: string): Promise<Membership> {
  const viewer = await getViewer()
  const membership = viewer.memberships.find((item) => item.org.slug === orgSlug)
  if (membership) return membership

  // platform admins hold no membership row, rls lets them read the org anyway
  if (!viewer.isPlatformAdmin) notFound()

  const supabase = await createClient()
  const { data } = await supabase
    .from('orgs')
    .select('id, name, slug, vertical, status, timezone, currency, logo_url, phone, address, whatsapp, settings')
    .eq('slug', orgSlug)
    .maybeSingle()
  if (!data) notFound()

  return { org: toOrg(data), role: 'owner' }
}

export async function getOrg(orgSlug: string): Promise<Org> {
  return (await getMembership(orgSlug)).org
}

export async function getDashboard(orgSlug: string) {
  return demo.demoDashboard(orgSlug)
}

export type BookingFilters = {
  from?: string
  to?: string
  status?: string
  resourceId?: string
  query?: string
}

export async function listBookings(orgSlug: string, filters: BookingFilters = {}): Promise<Booking[]> {
  const term = filters.query?.trim().toLowerCase()

  return demo.demoBookings(orgSlug).filter((booking) => {
    const day = booking.startsAt.slice(0, 10)
    if (filters.from && day < filters.from) return false
    if (filters.to && day > filters.to) return false
    if (filters.status && booking.status !== filters.status) return false
    if (filters.resourceId && booking.resource.id !== filters.resourceId) return false
    if (term) {
      const haystack = [booking.customer?.fullName, booking.customer?.email, booking.customer?.phone, booking.resource.name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(term)) return false
    }
    return true
  })
}

export async function getBooking(orgSlug: string, id: string) {
  return demo.demoBookings(orgSlug).find((booking) => booking.id === id) ?? null
}

export async function listCustomers(orgSlug: string, query?: string) {
  const term = query?.trim().toLowerCase()
  const customers = demo.demoCustomers(orgSlug)
  const filtered = term
    ? customers.filter((customer) =>
        [customer.fullName, customer.email, customer.phone].filter(Boolean).join(' ').toLowerCase().includes(term),
      )
    : customers
  return filtered.sort((a, b) => (b.lastVisitAt ?? '').localeCompare(a.lastVisitAt ?? ''))
}

export async function getCustomerHistory(orgSlug: string, customerId: string) {
  return demo
    .demoBookings(orgSlug)
    .filter((booking) => booking.customer?.id === customerId)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
}

export async function getAnalytics(orgSlug: string, days: number) {
  return demo.demoAnalytics(orgSlug, days)
}

export async function getBreakdown(orgSlug: string, dimension: string) {
  return demo.demoBreakdown(orgSlug, dimension)
}

export async function getResources(orgSlug: string) {
  return demo.demoResources(orgSlug)
}

export async function getServices(orgSlug: string) {
  return demo.demoServices(orgSlug)
}

export async function getAvailabilityRules(orgSlug: string) {
  return demo.demoRules(orgSlug)
}

export async function getAvailabilityExceptions(orgSlug: string) {
  return demo.demoExceptions(orgSlug)
}

export async function getAvailability(orgSlug: string, serviceId: string, date: string) {
  const service = demo.demoServices(orgSlug).find((item) => item.id === serviceId)
  if (!service) return []

  const rules = demo.demoRules(orgSlug)
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay()
  const rule = rules.find((item) => item.weekday === weekday)
  if (!rule) return []

  const closed = demo.demoExceptions(orgSlug).find((item) => item.date === date && item.isClosed)
  if (closed) return []

  const org = (await getMembership(orgSlug)).org
  const step = org.settings.booking.slot_minutes
  const resources = demo.demoResources(orgSlug).filter((item) => item.isActive)
  const taken = new Set(
    demo
      .demoBookings(orgSlug)
      .filter((booking) => booking.startsAt.slice(0, 10) === date && booking.status !== 'cancelled')
      .map((booking) => `${booking.resource.id}@${booking.startsAt}`),
  )

  const [openHour, openMinute] = rule.opensAt.split(':').map(Number)
  const [closeHour, closeMinute] = rule.closesAt.split(':').map(Number)
  const open = openHour * 60 + openMinute
  const close = closeHour * 60 + closeMinute

  const slots = []
  for (let minutes = open; minutes + service.durationMinutes <= close; minutes += step) {
    const startsAt = new Date(`${date}T00:00:00Z`).getTime() + (minutes + 180) * 60_000
    const iso = new Date(startsAt).toISOString()
    for (const resource of resources) {
      if (taken.has(`${resource.id}@${iso}`)) continue
      slots.push({
        startsAt: iso,
        endsAt: new Date(startsAt + service.durationMinutes * 60_000).toISOString(),
        resourceId: resource.id,
        resourceName: resource.name,
      })
    }
  }

  return slots
}

export async function getMenu(orgSlug: string) {
  return orgSlug ? demo.demoMenu() : []
}

export async function getSessions(orgSlug: string) {
  return demo.demoSessions(orgSlug)
}

export async function getEvents(orgSlug: string) {
  return demo.demoEvents(orgSlug)
}

export async function getPayments(orgSlug: string) {
  return demo.demoPayments(orgSlug)
}

export async function getMembers(orgSlug: string) {
  return demo.demoMembers(orgSlug)
}

export async function getInvites(orgSlug: string) {
  return demo.demoInvites(orgSlug)
}

export async function getSites(orgSlug: string) {
  return demo.demoSites(orgSlug)
}

export async function getGoogleConnections(orgSlug: string) {
  return demo.demoGoogle(orgSlug)
}

export async function listAdminOrgs() {
  return demo.demoAdminOrgs()
}

export async function getAdminOrg(id: string) {
  return demo.demoAdminOrgs().find((item) => item.org.id === id) ?? null
}

export async function listAllPayments() {
  return demo.demoOrgs.flatMap((org) =>
    demo.demoPayments(org.slug).map((payment) => ({ payment, org })),
  )
}

export async function listLeads() {
  return demo.demoLeads()
}
