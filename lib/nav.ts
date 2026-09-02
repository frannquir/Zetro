import {
  BarChart3,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  PartyPopper,
  Settings,
  UtensilsCrossed,
  Users,
  Dumbbell,
} from 'lucide-react'
import type { OrgSettings } from '@/lib/org/defaults'
import { vocabularyFor } from '@/lib/vertical'

export type NavItem = {
  href: string
  label: string
  icon: typeof LayoutDashboard
  exact?: boolean
}

export type NavGroup = { label: string | null; items: NavItem[] }

type Input = {
  orgSlug: string
  vertical: string | null | undefined
  settings: OrgSettings
  role: string
}

export function panelNav({ orgSlug, vertical, settings, role }: Input): NavGroup[] {
  const base = `/panel/${orgSlug}`
  const words = vocabularyFor(vertical)
  const eats = vertical === 'restaurant' || vertical === 'cafe'

  const operation: NavItem[] = [
    { href: base, label: 'Inicio', icon: LayoutDashboard, exact: true },
    { href: `${base}/reservas`, label: words.bookings, icon: CalendarDays },
    { href: `${base}/clientes`, label: 'Clientes', icon: Users },
  ]

  const content: NavItem[] = []
  if (eats && settings.modules.menu) {
    content.push({ href: `${base}/menu`, label: 'Menú', icon: UtensilsCrossed })
  }
  if (vertical === 'gym' && settings.modules.classes) {
    content.push({ href: `${base}/clases`, label: 'Clases', icon: Dumbbell })
  }
  if (settings.modules.events) {
    content.push({ href: `${base}/eventos`, label: 'Eventos', icon: PartyPopper })
  }

  const business: NavItem[] = [
    { href: `${base}/analitica`, label: 'Analítica', icon: BarChart3 },
    { href: `${base}/pagos`, label: 'Pagos', icon: CreditCard },
    { href: `${base}/ajustes`, label: 'Ajustes', icon: Settings },
  ]

  const groups: NavGroup[] = [{ label: null, items: operation }]
  if (content.length > 0) groups.push({ label: 'Contenido', items: content })
  groups.push({ label: 'Negocio', items: role === 'staff' ? business.filter((i) => !i.href.endsWith('/pagos')) : business })

  return groups
}

export function settingsNav(orgSlug: string, role: string) {
  const base = `/panel/${orgSlug}/ajustes`
  const items = [
    { href: base, label: 'General', exact: true },
    { href: `${base}/horarios`, label: 'Horarios' },
    { href: `${base}/recursos`, label: 'Recursos y servicios' },
    { href: `${base}/equipo`, label: 'Equipo', ownerOnly: true },
    { href: `${base}/integraciones`, label: 'Integraciones', ownerOnly: true },
  ]
  return items.filter((item) => !item.ownerOnly || role === 'owner')
}

export const adminNav = [
  { href: '/admin', label: 'Clientes', exact: true },
  { href: '/admin/pagos', label: 'Pagos' },
  { href: '/admin/leads', label: 'Leads' },
]
