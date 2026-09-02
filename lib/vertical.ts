export type Vocabulary = {
  booking: string
  bookings: string
  bookingPlural: string
  newBooking: string
  resource: string
  resources: string
  party: string
  showParty: boolean
  service: string
  services: string
}

const vocabularies: Record<string, Vocabulary> = {
  restaurant: {
    booking: 'reserva',
    bookings: 'Reservas',
    bookingPlural: 'reservas',
    newBooking: 'Nueva reserva',
    resource: 'mesa',
    resources: 'Mesas',
    party: 'Comensales',
    showParty: true,
    service: 'servicio',
    services: 'Servicios',
  },
  cafe: {
    booking: 'reserva',
    bookings: 'Reservas',
    bookingPlural: 'reservas',
    newBooking: 'Nueva reserva',
    resource: 'mesa',
    resources: 'Mesas',
    party: 'Comensales',
    showParty: true,
    service: 'servicio',
    services: 'Servicios',
  },
  gym: {
    booking: 'reserva',
    bookings: 'Reservas',
    bookingPlural: 'reservas',
    newBooking: 'Nueva reserva',
    resource: 'sala',
    resources: 'Salas y coaches',
    party: 'Personas',
    showParty: true,
    service: 'actividad',
    services: 'Actividades',
  },
  barbershop: {
    booking: 'turno',
    bookings: 'Turnos',
    bookingPlural: 'turnos',
    newBooking: 'Nuevo turno',
    resource: 'sillón',
    resources: 'Sillones y barberos',
    party: 'Personas',
    showParty: false,
    service: 'servicio',
    services: 'Servicios',
  },
  generic: {
    booking: 'reserva',
    bookings: 'Reservas',
    bookingPlural: 'reservas',
    newBooking: 'Nueva reserva',
    resource: 'recurso',
    resources: 'Recursos',
    party: 'Personas',
    showParty: true,
    service: 'servicio',
    services: 'Servicios',
  },
}

export function vocabularyFor(vertical: string | null | undefined): Vocabulary {
  return vocabularies[vertical ?? 'generic'] ?? vocabularies.generic
}
