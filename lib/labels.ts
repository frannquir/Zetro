const bookingStatus: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  seated: 'En el lugar',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No vino',
}

const bookingSource: Record<string, string> = {
  portal: 'Panel',
  public_site: 'Sitio web',
  walk_in: 'Sin reserva',
  phone: 'Teléfono',
  google: 'Google',
}

const memberRole: Record<string, string> = {
  owner: 'Dueño',
  manager: 'Encargado',
  staff: 'Equipo',
}

const orgStatus: Record<string, string> = {
  trial: 'Prueba',
  active: 'Activo',
  paused: 'Pausado',
  archived: 'Archivado',
}

const paymentStatus: Record<string, string> = {
  paid: 'Pagado',
  pending: 'Pendiente',
  overdue: 'Vencido',
  waived: 'Bonificado',
}

const leadStatus: Record<string, string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  won: 'Ganado',
  lost: 'Perdido',
}

const resourceKind: Record<string, string> = {
  table: 'Mesa',
  chair: 'Sillón',
  room: 'Sala',
  court: 'Cancha',
  staff: 'Persona',
  equipment: 'Equipo',
}

const vertical: Record<string, string> = {
  restaurant: 'Restaurante',
  cafe: 'Café',
  gym: 'Gimnasio',
  barbershop: 'Barbería',
  generic: 'Genérico',
}

const siteStatus: Record<string, string> = {
  live: 'En línea',
  building: 'En construcción',
  paused: 'Pausado',
}

function lookup(map: Record<string, string>) {
  return (value: string | null | undefined) => (value ? (map[value] ?? value) : '—')
}

export const bookingStatusLabel = lookup(bookingStatus)
export const bookingSourceLabel = lookup(bookingSource)
export const memberRoleLabel = lookup(memberRole)
export const orgStatusLabel = lookup(orgStatus)
export const paymentStatusLabel = lookup(paymentStatus)
export const leadStatusLabel = lookup(leadStatus)
export const resourceKindLabel = lookup(resourceKind)
export const verticalLabel = lookup(vertical)
export const siteStatusLabel = lookup(siteStatus)

export const bookingStatusOptions = Object.entries(bookingStatus).map(([value, label]) => ({ value, label }))
export const memberRoleOptions = Object.entries(memberRole).map(([value, label]) => ({ value, label }))
export const resourceKindOptions = Object.entries(resourceKind).map(([value, label]) => ({ value, label }))
export const verticalOptions = Object.entries(vertical).map(([value, label]) => ({ value, label }))
export const paymentStatusOptions = Object.entries(paymentStatus).map(([value, label]) => ({ value, label }))
export const leadStatusOptions = Object.entries(leadStatus).map(([value, label]) => ({ value, label }))

export type StatusTone = 'neutral' | 'positive' | 'warning' | 'danger' | 'info'

export function bookingStatusTone(value: string | null | undefined): StatusTone {
  switch (value) {
    case 'confirmed':
    case 'completed':
      return 'positive'
    case 'seated':
      return 'info'
    case 'pending':
      return 'warning'
    case 'cancelled':
    case 'no_show':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function paymentStatusTone(value: string | null | undefined): StatusTone {
  switch (value) {
    case 'paid':
      return 'positive'
    case 'pending':
      return 'warning'
    case 'overdue':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function orgStatusTone(value: string | null | undefined): StatusTone {
  switch (value) {
    case 'active':
      return 'positive'
    case 'trial':
      return 'info'
    case 'paused':
      return 'warning'
    case 'archived':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function leadStatusTone(value: string | null | undefined): StatusTone {
  switch (value) {
    case 'won':
      return 'positive'
    case 'new':
      return 'info'
    case 'contacted':
      return 'warning'
    case 'lost':
      return 'danger'
    default:
      return 'neutral'
  }
}
