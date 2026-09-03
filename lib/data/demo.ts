import { defaultSettings, readSettings } from '@/lib/org/defaults'
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
  MenuSection,
  Org,
  OrgEvent,
  PaymentRecord,
  Resource,
  Service,
  Site,
  Viewer,
} from './types'

// argentina has no dst, so a fixed -3 offset is enough to place demo rows on the right local hour
const arOffset = 3

function rand(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

function dayStart(offsetDays: number) {
  const now = new Date()
  const base = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return new Date(base + offsetDays * 86_400_000)
}

function at(offsetDays: number, hour: number, minute = 0) {
  const day = dayStart(offsetDays)
  return new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour + arOffset, minute),
  ).toISOString()
}

function isoDate(offsetDays: number) {
  return dayStart(offsetDays).toISOString().slice(0, 10)
}

function plusMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString()
}

const firstNames = [
  'Camila', 'Martín', 'Sofía', 'Lucas', 'Valentina', 'Nicolás', 'Julieta', 'Tomás',
  'Agustina', 'Federico', 'Micaela', 'Joaquín', 'Rocío', 'Diego', 'Malena', 'Bruno',
  'Florencia', 'Ignacio', 'Carla', 'Gonzalo',
]
const lastNames = [
  'Gutiérrez', 'Fernández', 'Sosa', 'Ledesma', 'Paz', 'Romero', 'Acosta', 'Vera',
  'Ibarra', 'Molina', 'Cabrera', 'Suárez', 'Núñez', 'Ortiz', 'Ferrari', 'Quiroga',
]

function personName(random: () => number) {
  return `${firstNames[Math.floor(random() * firstNames.length)]} ${lastNames[Math.floor(random() * lastNames.length)]}`
}

function pick<T>(random: () => number, list: T[]) {
  return list[Math.floor(random() * list.length)]
}

function org(
  slug: string,
  name: string,
  vertical: string,
  status: string,
  extras: Partial<Org> = {},
  settings: Record<string, unknown> = {},
): Org {
  return {
    id: `org-${slug}`,
    name,
    slug,
    vertical,
    status,
    timeZone: 'America/Argentina/Buenos_Aires',
    currency: 'ARS',
    logoUrl: null,
    phone: null,
    address: null,
    whatsapp: null,
    settings: readSettings({ ...defaultSettings, ...settings }),
    ...extras,
  }
}

export const demoOrgs: Org[] = [
  org(
    'bar-chelo',
    'Bar Chelo',
    'restaurant',
    'active',
    { phone: '11 4788 2200', address: 'Gorriti 5400, Palermo, CABA', whatsapp: '5491147882200' },
    { modules: { menu: true, events: true, classes: false } },
  ),
  org(
    'estudio-norte',
    'Estudio Norte',
    'gym',
    'active',
    { phone: '11 4555 9010', address: 'Av. Cabildo 2300, Belgrano, CABA', whatsapp: '5491145559010' },
    {
      modules: { menu: false, events: true, classes: true },
      booking: { ...defaultSettings.booking, slot_minutes: 60, max_party_size: 1, auto_confirm: true },
    },
  ),
  org(
    'aguilar-barber',
    'Aguilar Barber',
    'barbershop',
    'trial',
    { phone: '341 555 8080', address: 'Córdoba 1120, Rosario', whatsapp: '5493415558080' },
    {
      modules: { menu: false, events: false, classes: false },
      booking: { ...defaultSettings.booking, slot_minutes: 30, max_party_size: 1, auto_confirm: false },
    },
  ),
]

export const demoViewer: Viewer = {
  id: 'user-demo',
  email: 'demo@zetro.com',
  fullName: 'Esteban Cuadrado',
  isPlatformAdmin: true,
  memberships: [
    { org: demoOrgs[0], role: 'owner' },
    { org: demoOrgs[1], role: 'owner' },
    { org: demoOrgs[2], role: 'manager' },
  ],
}

const resourcesByOrg: Record<string, Resource[]> = {
  'bar-chelo': [
    { id: 'r-mesa-1', name: 'Mesa 1', kind: 'table', capacity: 2, isActive: true, zone: 'Salón' },
    { id: 'r-mesa-2', name: 'Mesa 2', kind: 'table', capacity: 2, isActive: true, zone: 'Salón' },
    { id: 'r-mesa-4', name: 'Mesa 4', kind: 'table', capacity: 4, isActive: true, zone: 'Salón' },
    { id: 'r-mesa-7', name: 'Mesa 7', kind: 'table', capacity: 6, isActive: true, zone: 'Patio' },
    { id: 'r-mesa-9', name: 'Mesa 9', kind: 'table', capacity: 8, isActive: true, zone: 'Patio' },
    { id: 'r-barra', name: 'Barra', kind: 'table', capacity: 6, isActive: false, zone: 'Salón' },
  ],
  'estudio-norte': [
    { id: 'r-sala-a', name: 'Sala A', kind: 'room', capacity: 20, isActive: true, zone: 'Planta baja' },
    { id: 'r-sala-b', name: 'Sala B', kind: 'room', capacity: 12, isActive: true, zone: 'Primer piso' },
    { id: 'r-coach-lu', name: 'Lucía Fernández', kind: 'staff', capacity: 1, isActive: true, zone: null },
    { id: 'r-coach-ma', name: 'Matías Vera', kind: 'staff', capacity: 1, isActive: true, zone: null },
  ],
  'aguilar-barber': [
    { id: 'r-nico', name: 'Nico', kind: 'staff', capacity: 1, isActive: true, zone: null },
    { id: 'r-juan', name: 'Juan', kind: 'staff', capacity: 1, isActive: true, zone: null },
    { id: 'r-fede', name: 'Fede', kind: 'staff', capacity: 1, isActive: true, zone: null },
  ],
}

const servicesByOrg: Record<string, Service[]> = {
  'bar-chelo': [
    { id: 's-cena', name: 'Cena', description: 'Reserva de mesa para cenar', durationMinutes: 90, bufferBeforeMinutes: 0, bufferAfterMinutes: 15, priceCents: null, isPublic: true, isActive: true },
    { id: 's-almuerzo', name: 'Almuerzo', description: 'Reserva de mesa al mediodía', durationMinutes: 75, bufferBeforeMinutes: 0, bufferAfterMinutes: 15, priceCents: null, isPublic: true, isActive: true },
    { id: 's-privado', name: 'Evento privado', description: 'Patio completo', durationMinutes: 240, bufferBeforeMinutes: 60, bufferAfterMinutes: 60, priceCents: 45000000, isPublic: false, isActive: true },
  ],
  'estudio-norte': [
    { id: 's-funcional', name: 'Funcional', description: null, durationMinutes: 60, bufferBeforeMinutes: 0, bufferAfterMinutes: 15, priceCents: 850000, isPublic: true, isActive: true },
    { id: 's-spinning', name: 'Spinning', description: null, durationMinutes: 45, bufferBeforeMinutes: 0, bufferAfterMinutes: 15, priceCents: 900000, isPublic: true, isActive: true },
    { id: 's-yoga', name: 'Yoga', description: null, durationMinutes: 60, bufferBeforeMinutes: 0, bufferAfterMinutes: 10, priceCents: 800000, isPublic: true, isActive: true },
  ],
  'aguilar-barber': [
    { id: 's-corte', name: 'Corte', description: 'Corte de pelo con máquina y tijera', durationMinutes: 40, bufferBeforeMinutes: 0, bufferAfterMinutes: 5, priceCents: 1200000, isPublic: true, isActive: true },
    { id: 's-barba', name: 'Barba', description: 'Perfilado y navaja', durationMinutes: 25, bufferBeforeMinutes: 0, bufferAfterMinutes: 5, priceCents: 700000, isPublic: true, isActive: true },
    { id: 's-completo', name: 'Corte + barba', description: null, durationMinutes: 60, bufferBeforeMinutes: 0, bufferAfterMinutes: 5, priceCents: 1700000, isPublic: true, isActive: true },
  ],
}

const openHours: Record<string, { start: number; end: number }> = {
  'bar-chelo': { start: 19, end: 24 },
  'estudio-norte': { start: 7, end: 21 },
  'aguilar-barber': { start: 10, end: 20 },
}

function seedOf(slug: string) {
  return [...slug].reduce((acc, char) => acc + char.charCodeAt(0), 0) * 7919
}

export function demoCustomers(slug: string): Customer[] {
  const random = rand(seedOf(slug) + 31)
  return Array.from({ length: 42 }, (_, index) => {
    const name = personName(random)
    const visits = 1 + Math.floor(random() * 14)
    return {
      id: `${slug}-c-${index}`,
      fullName: name,
      email: random() > 0.18 ? `${name.toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').replace(/ /g, '.')}@mail.com` : null,
      phone: random() > 0.12 ? `11 ${3000 + Math.floor(random() * 6999)} ${1000 + Math.floor(random() * 8999)}` : null,
      notes: random() > 0.85 ? 'Prefiere mesa lejos de la puerta' : null,
      marketingOptIn: random() > 0.6,
      visitsCount: visits,
      lastVisitAt: at(-Math.floor(random() * 45), 20),
      createdAt: at(-60 - Math.floor(random() * 300), 12),
    }
  })
}

export function demoBookings(slug: string): Booking[] {
  const random = rand(seedOf(slug))
  const resources = resourcesByOrg[slug].filter((r) => r.isActive)
  const services = servicesByOrg[slug]
  const hours = openHours[slug]
  const customers = demoCustomers(slug)
  const statuses = ['confirmed', 'confirmed', 'confirmed', 'pending', 'completed', 'cancelled', 'no_show', 'seated']
  const sources = ['public_site', 'public_site', 'portal', 'phone', 'walk_in']

  const bookings: Booking[] = []

  for (let day = -21; day <= 14; day += 1) {
    const weekday = new Date(dayStart(day)).getUTCDay()
    const busy = weekday === 5 || weekday === 6 ? 1.6 : 1
    const count = Math.round((3 + random() * 5) * busy)

    for (let index = 0; index < count; index += 1) {
      const service = pick(random, services)
      const resource = pick(random, resources)
      const hour = hours.start + Math.floor(random() * Math.max(hours.end - hours.start - 1, 1))
      const minute = random() > 0.5 ? 30 : 0
      const startsAt = at(day, hour, minute)
      const customer = random() > 0.08 ? pick(random, customers) : null

      let status: string
      if (day < 0) status = random() > 0.12 ? 'completed' : pick(random, ['cancelled', 'no_show'])
      else if (day === 0) status = pick(random, ['confirmed', 'confirmed', 'seated', 'pending'])
      else status = pick(random, statuses.slice(0, 4))

      bookings.push({
        id: `${slug}-b-${day}-${index}`,
        startsAt,
        endsAt: plusMinutes(startsAt, service.durationMinutes),
        partySize: slug === 'bar-chelo' ? 1 + Math.floor(random() * Math.min(resource.capacity, 8)) : 1,
        status,
        source: pick(random, sources),
        notes: random() > 0.82 ? 'Cumpleaños, si se puede algo dulce al final' : null,
        internalNotes: random() > 0.9 ? 'Cliente habitual, atender bien' : null,
        resource: { id: resource.id, name: resource.name, kind: resource.kind },
        service: { id: service.id, name: service.name },
        customer: customer
          ? { id: customer.id, fullName: customer.fullName, email: customer.email, phone: customer.phone }
          : null,
      })
    }
  }

  return bookings.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

export function demoResources(slug: string) {
  return resourcesByOrg[slug] ?? []
}

export function demoServices(slug: string) {
  return servicesByOrg[slug] ?? []
}

export function demoRules(slug: string): AvailabilityRule[] {
  const hours = openHours[slug]
  const closedOn = slug === 'bar-chelo' ? [1] : slug === 'aguilar-barber' ? [0] : []
  return Array.from({ length: 7 }, (_, weekday) => weekday)
    .filter((weekday) => !closedOn.includes(weekday))
    .map((weekday) => ({
      id: `${slug}-rule-${weekday}`,
      resourceId: null,
      weekday,
      opensAt: `${String(hours.start).padStart(2, '0')}:00`,
      closesAt: hours.end >= 24 ? '23:59' : `${String(hours.end).padStart(2, '0')}:00`,
    }))
}

export function demoExceptions(slug: string): AvailabilityException[] {
  return [
    {
      id: `${slug}-exc-1`,
      resourceId: null,
      date: isoDate(9),
      isClosed: true,
      opensAt: null,
      closesAt: null,
      note: 'Feriado',
    },
    {
      id: `${slug}-exc-2`,
      resourceId: null,
      date: isoDate(16),
      isClosed: false,
      opensAt: '12:00',
      closesAt: '17:00',
      note: 'Horario reducido por mantenimiento',
    },
  ]
}

export function demoDashboard(slug: string): DashboardSummary {
  const bookings = demoBookings(slug)
  const today = isoDate(0)
  const bookingsToday = bookings.filter((b) => b.startsAt.slice(0, 10) === today && b.status !== 'cancelled').length
  const next7 = bookings.filter(
    (b) => b.startsAt.slice(0, 10) > today && b.startsAt.slice(0, 10) <= isoDate(7) && b.status !== 'cancelled',
  ).length
  const random = rand(seedOf(slug) + 5)

  return {
    bookingsToday,
    bookingsNext7: next7,
    cancellations: bookings.filter((b) => b.status === 'cancelled' && b.startsAt >= at(-7, 0)).length,
    newCustomers: 6 + Math.floor(random() * 12),
    pageviews: 1400 + Math.floor(random() * 2600),
    topPath: slug === 'bar-chelo' ? '/carta' : slug === 'estudio-norte' ? '/clases' : '/turnos',
    liveVisitors: Math.floor(random() * 9),
    occupancy: 0.55 + random() * 0.35,
    deltas: { bookings: random() * 0.4 - 0.1, pageviews: random() * 0.5 - 0.15, customers: random() * 0.3 - 0.05 },
  }
}

export function demoAnalytics(slug: string, days: number): AnalyticsOverview {
  const random = rand(seedOf(slug) + 11)
  const daily = Array.from({ length: days }, (_, index) => {
    const day = isoDate(index - days + 1)
    const weekday = new Date(dayStart(index - days + 1)).getUTCDay()
    const weekend = weekday === 0 || weekday === 6 ? 1.35 : 1
    const pageviews = Math.round((70 + random() * 90) * weekend)
    return { day, pageviews, visitors: Math.round(pageviews * (0.55 + random() * 0.2)) }
  })

  const pageviews = daily.reduce((acc, row) => acc + row.pageviews, 0)
  const visitors = daily.reduce((acc, row) => acc + row.visitors, 0)

  return {
    pageviews,
    visitors,
    sessions: Math.round(visitors * 1.28),
    bounceRate: 0.38 + random() * 0.14,
    bookings: demoBookings(slug).filter((b) => b.source === 'public_site').length,
    deltas: {
      pageviews: random() * 0.45 - 0.12,
      visitors: random() * 0.4 - 0.1,
      sessions: random() * 0.35 - 0.1,
      bounceRate: random() * 0.2 - 0.12,
    },
    daily,
  }
}

export function demoBreakdown(slug: string, dimension: string): AnalyticsRow[] {
  const random = rand(seedOf(slug) + dimension.length * 13)
  const values: Record<string, string[]> = {
    path: slug === 'bar-chelo'
      ? ['/', '/carta', '/reservas', '/nosotros', '/eventos']
      : slug === 'estudio-norte'
        ? ['/', '/clases', '/precios', '/horarios', '/contacto']
        : ['/', '/turnos', '/servicios', '/barberos', '/contacto'],
    referrer: ['google.com', 'instagram.com', 'directo', 'facebook.com', 'maps.google.com'],
    utm_source: ['instagram', 'google', 'whatsapp', 'newsletter', 'flyer'],
    device: ['mobile', 'desktop', 'tablet'],
    country: ['AR', 'UY', 'CL', 'ES', 'BR'],
  }

  return (values[dimension] ?? values.path)
    .map((value) => {
      const pageviews = 60 + Math.floor(random() * 700)
      return { value, pageviews, visitors: Math.round(pageviews * (0.5 + random() * 0.3)) }
    })
    .sort((a, b) => b.pageviews - a.pageviews)
}

export function demoMenu(): MenuSection[] {
  return [
    {
      id: 'sec-entradas',
      name: 'Para empezar',
      isVisible: true,
      items: [
        { id: 'mi-1', name: 'Provoleta de campo', description: 'Con orégano, tomate y pan de masa madre', priceCents: 980000, isAvailable: true, tags: ['vegetariano'] },
        { id: 'mi-2', name: 'Empanadas de carne (3)', description: 'Cortadas a cuchillo', priceCents: 750000, isAvailable: true, tags: [] },
        { id: 'mi-3', name: 'Hummus de remolacha', description: 'Con pan pita casero', priceCents: 820000, isAvailable: false, tags: ['vegano', 'sin-tacc'] },
      ],
    },
    {
      id: 'sec-principales',
      name: 'Principales',
      isVisible: true,
      items: [
        { id: 'mi-4', name: 'Bife de chorizo', description: '350 g con papas rústicas', priceCents: 2450000, isAvailable: true, tags: [] },
        { id: 'mi-5', name: 'Sorrentinos de calabaza', description: 'Manteca, salvia y nuez', priceCents: 1890000, isAvailable: true, tags: ['vegetariano'] },
        { id: 'mi-6', name: 'Pesca del día', description: 'Con puré de coliflor', priceCents: 2280000, isAvailable: true, tags: ['sin-tacc'] },
      ],
    },
    {
      id: 'sec-postres',
      name: 'Postres',
      isVisible: false,
      items: [
        { id: 'mi-7', name: 'Flan casero', description: 'Con dulce de leche y crema', priceCents: 690000, isAvailable: true, tags: ['vegetariano'] },
        { id: 'mi-8', name: 'Helado artesanal', description: 'Dos bochas', priceCents: 560000, isAvailable: true, tags: ['vegetariano', 'sin-tacc'] },
      ],
    },
  ]
}

export function demoSessions(slug: string): GroupSession[] {
  const random = rand(seedOf(slug) + 77)
  const services = servicesByOrg[slug] ?? []
  const coaches = (resourcesByOrg[slug] ?? []).filter((r) => r.kind === 'staff')
  const rooms = (resourcesByOrg[slug] ?? []).filter((r) => r.kind === 'room')
  const sessions: GroupSession[] = []

  for (let day = 0; day <= 6; day += 1) {
    for (const hour of [8, 10, 18, 19, 20]) {
      const service = pick(random, services)
      const capacity = pick(random, [12, 16, 20])
      const startsAt = at(day, hour)
      sessions.push({
        id: `${slug}-gs-${day}-${hour}`,
        serviceName: service?.name ?? 'Clase',
        instructorName: coaches.length > 0 ? pick(random, coaches).name : null,
        resourceName: rooms.length > 0 ? pick(random, rooms).name : null,
        startsAt,
        endsAt: plusMinutes(startsAt, service?.durationMinutes ?? 60),
        capacity,
        bookedCount: Math.min(capacity, Math.round(capacity * (0.35 + random() * 0.75))),
        status: 'scheduled',
      })
    }
  }

  return sessions
}

export function demoEvents(slug: string): OrgEvent[] {
  const base = slug === 'estudio-norte'
    ? [
        { title: 'Clase abierta de funcional', description: 'Gratis para quien quiera probar', day: 5, capacity: 40, priceCents: null },
        { title: 'Masterclass de movilidad', description: 'Con Lucía Fernández', day: 12, capacity: 25, priceCents: 1500000 },
      ]
    : [
        { title: 'Noche de vinos naturales', description: 'Seis etiquetas y tabla de quesos', day: 4, capacity: 30, priceCents: 3500000 },
        { title: 'Cena a ciegas', description: 'Menú de cinco pasos sin carta', day: 18, capacity: 24, priceCents: 5200000 },
      ]

  return base.map((item, index) => ({
    id: `${slug}-ev-${index}`,
    title: item.title,
    description: item.description,
    startsAt: at(item.day, 20),
    endsAt: at(item.day, 23),
    capacity: item.capacity,
    priceCents: item.priceCents,
    isPublished: index === 0,
  }))
}

export function demoPayments(slug: string): PaymentRecord[] {
  const now = new Date()
  return Array.from({ length: 8 }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - index, 1))
    const status = index === 0 ? 'pending' : index === 1 ? 'paid' : index === 5 ? 'waived' : 'paid'
    return {
      id: `${slug}-pay-${index}`,
      periodMonth: date.toISOString().slice(0, 10),
      amountCents: 2900000,
      currency: 'ARS',
      status,
      dueDate: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 10)).toISOString().slice(0, 10),
      paidAt: status === 'paid' ? new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 8)).toISOString() : null,
      method: status === 'paid' ? 'transferencia' : null,
      note: status === 'waived' ? 'Bonificado por demora en el rediseño' : null,
    }
  })
}

export function demoMembers(slug: string): Member[] {
  const random = rand(seedOf(slug) + 3)
  const roles = ['owner', 'manager', 'staff', 'staff']
  return roles.map((role, index) => {
    const name = index === 0 ? demoViewer.fullName : personName(random)
    return {
      id: `${slug}-m-${index}`,
      fullName: name,
      email: index === 0 ? demoViewer.email : `${name.split(' ')[0].toLowerCase()}@${slug}.com.ar`,
      role,
      createdAt: at(-200 + index * 30, 12),
    }
  })
}

export function demoInvites(slug: string): Invite[] {
  return [
    { id: `${slug}-i-1`, email: 'nuevo.mozo@mail.com', role: 'staff', expiresAt: at(5, 12), acceptedAt: null },
  ]
}

export function demoSites(slug: string): Site[] {
  const domains: Record<string, string> = {
    'bar-chelo': 'barchelo.com.ar',
    'estudio-norte': 'estudionorte.com.ar',
    'aguilar-barber': 'aguilarbarber.com',
  }
  return [
    {
      id: `${slug}-site`,
      name: 'Sitio principal',
      domain: domains[slug] ?? `${slug}.com.ar`,
      publicKey: `zs_${slug.replace(/-/g, '')}${'x'.repeat(Math.max(0, 24 - slug.length))}`.slice(0, 27),
      status: 'live',
    },
  ]
}

export function demoGoogle(slug: string): GoogleConnection[] {
  if (slug === 'aguilar-barber') return []
  return [
    {
      id: `${slug}-gc`,
      googleEmail: `agenda@${slug}.com.ar`,
      calendarId: 'primary',
      resourceName: null,
      status: slug === 'estudio-norte' ? 'error' : 'active',
      lastError: slug === 'estudio-norte' ? 'El token de Google fue revocado. Volvé a conectar la cuenta.' : null,
      lastSyncedAt: at(0, 9),
    },
  ]
}

export function demoLeads(): Lead[] {
  const random = rand(4242)
  const messages = [
    'Tengo una parrilla en Villa Crespo y quiero dejar de tomar reservas por WhatsApp.',
    'Necesito un sitio para mi estudio de pilates, con turnos.',
    'Somos dos socios, abrimos una cafetería en octubre. Queremos todo listo para la apertura.',
    'Ya tengo sitio pero es viejo y no puedo cambiar nada. Cuánto sale rehacerlo.',
    'Quiero sumar reservas online a mi barbería, somos cuatro barberos.',
  ]
  const statuses = ['new', 'new', 'contacted', 'won', 'lost']

  return messages.map((message, index) => {
    const name = personName(random)
    return {
      id: `lead-${index}`,
      name,
      email: `${name.split(' ')[0].toLowerCase()}@mail.com`,
      phone: random() > 0.3 ? `11 ${3000 + Math.floor(random() * 6999)} ${1000 + Math.floor(random() * 8999)}` : null,
      message,
      sourcePath: pick(random, ['/contacto', '/', '/trabajos/bar-chelo']),
      status: statuses[index],
      createdAt: at(-index * 2, 10 + index),
      orgName: null,
    }
  })
}

export function demoAdminOrgs(): AdminOrg[] {
  const random = rand(909)
  return demoOrgs.map((item) => ({
    org: item,
    ownerEmail: demoViewer.email,
    membersCount: demoMembers(item.slug).length,
    bookingsLast30: demoBookings(item.slug).filter((b) => b.startsAt >= at(-30, 0) && b.startsAt <= at(0, 23)).length,
    lastActivityAt: at(-Math.floor(random() * 3), 18),
    paymentStatus: demoPayments(item.slug)[0].status,
  }))
}
