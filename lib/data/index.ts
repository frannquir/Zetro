import { cache } from 'react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { readSettings } from '@/lib/org/defaults'
import type {
  AdminOrg,
  AnalyticsOverview,
  AnalyticsRow,
  AvailabilityException,
  AvailabilityRule,
  Booking,
  Customer,
  DashboardSummary,
  GoogleConnection,
  GroupSession,
  Invite,
  Lead,
  Member,
  Membership,
  MenuSection,
  Org,
  OrgEvent,
  PaymentRecord,
  Resource,
  Service,
  Site,
  Slot,
  Viewer,
} from './types'

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

// Todo lo que sigue todavía no está conectado a la base. Devuelven vacío a
// propósito: las páginas del panel muestran su EmptyState y nadie ve números
// inventados. Al conectar cada una, reemplazar el cuerpo por la query real.
// Con tabla en migraciones, listas para conectar:
//   listBookings/getBooking -> bookings      getAvailability -> rpc get_availability
//   listCustomers           -> customers     getResources    -> resources
//   getServices             -> services      getMembers      -> memberships
//   getAvailabilityRules    -> availability_rules            getInvites -> invites
//   getAvailabilityExceptions -> availability_exceptions     getSites   -> sites
// Sin tabla todavía: dashboard, analítica, menú, clases, eventos, pagos,
// conexiones de Google y el listado de orgs del admin.

export async function getDashboard(_orgSlug: string): Promise<DashboardSummary> {
  return {
    bookingsToday: 0,
    bookingsNext7: 0,
    cancellations: 0,
    newCustomers: 0,
    pageviews: 0,
    topPath: null,
    liveVisitors: 0,
    occupancy: 0,
    deltas: { bookings: 0, pageviews: 0, customers: 0 },
  }
}

export type BookingFilters = {
  from?: string
  to?: string
  status?: string
  resourceId?: string
  query?: string
}

export async function listBookings(_orgSlug: string, _filters: BookingFilters = {}): Promise<Booking[]> {
  return []
}

export async function getBooking(_orgSlug: string, _id: string): Promise<Booking | null> {
  return null
}

export async function listCustomers(_orgSlug: string, _query?: string): Promise<Customer[]> {
  return []
}

export async function getCustomerHistory(_orgSlug: string, _customerId: string): Promise<Booking[]> {
  return []
}

export async function getAnalytics(_orgSlug: string, _days: number): Promise<AnalyticsOverview> {
  return {
    pageviews: 0,
    visitors: 0,
    sessions: 0,
    bounceRate: 0,
    bookings: 0,
    deltas: { pageviews: 0, visitors: 0, sessions: 0, bounceRate: 0 },
    daily: [],
  }
}

export async function getBreakdown(_orgSlug: string, _dimension: string): Promise<AnalyticsRow[]> {
  return []
}

export async function getResources(_orgSlug: string): Promise<Resource[]> {
  return []
}

export async function getServices(_orgSlug: string): Promise<Service[]> {
  return []
}

export async function getAvailabilityRules(_orgSlug: string): Promise<AvailabilityRule[]> {
  return []
}

export async function getAvailabilityExceptions(_orgSlug: string): Promise<AvailabilityException[]> {
  return []
}

export async function getAvailability(_orgSlug: string, _serviceId: string, _date: string): Promise<Slot[]> {
  return []
}

export async function getMenu(_orgSlug: string): Promise<MenuSection[]> {
  return []
}

export async function getSessions(_orgSlug: string): Promise<GroupSession[]> {
  return []
}

export async function getEvents(_orgSlug: string): Promise<OrgEvent[]> {
  return []
}

export async function getPayments(_orgSlug: string): Promise<PaymentRecord[]> {
  return []
}

export async function getMembers(_orgSlug: string): Promise<Member[]> {
  return []
}

export async function getInvites(_orgSlug: string): Promise<Invite[]> {
  return []
}

export async function getSites(_orgSlug: string): Promise<Site[]> {
  return []
}

export async function getGoogleConnections(_orgSlug: string): Promise<GoogleConnection[]> {
  return []
}

export async function listAdminOrgs(): Promise<AdminOrg[]> {
  return []
}

export async function getAdminOrg(_id: string): Promise<AdminOrg | null> {
  return null
}

export async function listAllPayments(): Promise<{ payment: PaymentRecord; org: Org }[]> {
  return []
}

export async function listLeads(): Promise<Lead[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('leads')
    .select('id, name, email, phone, message, source_path, status, created_at, orgs(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    sourcePath: row.source_path,
    status: row.status,
    createdAt: row.created_at,
    orgName: row.orgs?.name ?? null,
  }))
}
