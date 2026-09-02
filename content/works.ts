export type Work = {
  slug: string
  name: string
  vertical: string
  tagline: string
  summary: string
  city: string
  year: number
  url: string | null
  accent: string
  services: string[]
  challenge: string
  solution: string
  results: { label: string; value: string }[]
  stack: string[]
}

export const works: Work[] = [
  {
    slug: 'bar-chelo',
    name: 'Bar Chelo',
    vertical: 'restaurant',
    tagline: 'Cocina de barrio en Palermo con reservas online',
    summary:
      'Sitio nuevo, carta que se actualiza sola y reservas que entran directo al panel. Dejaron de anotar mesas en un cuaderno.',
    city: 'Buenos Aires',
    year: 2026,
    url: null,
    accent: 'oklch(0.62 0.19 25)',
    services: ['Sitio web', 'Reservas online', 'Carta digital', 'Analítica'],
    challenge:
      'Tomaban reservas por Instagram y por teléfono. Se superponían mesas casi todos los fines de semana y la carta en PDF tenía precios de hace ocho meses.',
    solution:
      'Un sitio de una página con la carta viva, y el widget de reservas apuntando al panel. El mozo ve el día completo en el celular; la cocina ve cuántos cubiertos vienen a las nueve.',
    results: [
      { label: 'Reservas online sobre el total', value: '64%' },
      { label: 'Mesas superpuestas por mes', value: '0' },
      { label: 'Tiempo de carga', value: '0,8 s' },
    ],
    stack: ['Next.js', 'Portal Zetro', 'Vercel'],
  },
  {
    slug: 'cafe-mendez',
    name: 'Café Méndez',
    vertical: 'cafe',
    tagline: 'Café de especialidad con carta y eventos',
    summary:
      'Una página simple, rápida y con la carta siempre al día. Los cursos de catación se cargan solos desde el panel.',
    city: 'Córdoba',
    year: 2026,
    url: null,
    accent: 'oklch(0.65 0.13 70)',
    services: ['Sitio web', 'Carta digital', 'Eventos', 'Analítica'],
    challenge:
      'Cada vez que cambiaban un grano tenían que pedirnos que editáramos el sitio. Los cursos se anunciaban solo por historias y se llenaban a mano.',
    solution:
      'La carta y los eventos salen del panel. Publican un curso, aparece en el sitio con cupos y la inscripción queda registrada.',
    results: [
      { label: 'Cambios de carta sin pedirnos nada', value: '100%' },
      { label: 'Inscripciones a cursos por el sitio', value: '3 de cada 4' },
      { label: 'Visitas mensuales', value: '4.100' },
    ],
    stack: ['Next.js', 'Portal Zetro', 'Vercel'],
  },
  {
    slug: 'aguilar-barber',
    name: 'Aguilar Barber',
    vertical: 'barbershop',
    tagline: 'Turnos online para tres barberos',
    summary:
      'Cada barbero tiene su agenda y su calendario de Google. El cliente elige con quién se corta y a qué hora.',
    city: 'Rosario',
    year: 2026,
    url: null,
    accent: 'oklch(0.55 0.12 250)',
    services: ['Sitio web', 'Turnos online', 'Google Calendar', 'Analítica'],
    challenge:
      'Tres agendas en tres celulares distintos. Los turnos se pisaban y nadie sabía cuántos cortes había hecho cada uno en el mes.',
    solution:
      'Cada barbero es un recurso con su horario. Cuando se confirma un turno aparece en su calendario de Google, y el panel muestra el mes de cada uno.',
    results: [
      { label: 'Turnos gestionados por mes', value: '480' },
      { label: 'Ausencias tras el recordatorio', value: '-38%' },
      { label: 'Agendas en un solo lugar', value: '3' },
    ],
    stack: ['Next.js', 'Portal Zetro', 'Google Calendar'],
  },
  {
    slug: 'estudio-norte',
    name: 'Estudio Norte',
    vertical: 'gym',
    tagline: 'Clases grupales con cupos reales',
    summary:
      'Funcional, spinning y yoga con cupo por clase. Si la clase se llena, el sitio deja de ofrecerla.',
    city: 'Buenos Aires',
    year: 2026,
    url: null,
    accent: 'oklch(0.65 0.15 155)',
    services: ['Sitio web', 'Clases y cupos', 'Reservas online', 'Analítica'],
    challenge:
      'Anotaban a la gente en un grupo de WhatsApp. Aparecían dieciocho personas para una sala de doce y alguien se volvía a su casa.',
    solution:
      'Cada clase es una sesión con cupo. La inscripción se bloquea en la base de datos cuando se llena, así que no hay forma de sobrevender.',
    results: [
      { label: 'Clases sobrevendidas', value: '0' },
      { label: 'Ocupación promedio', value: '87%' },
      { label: 'Inscripciones por el sitio', value: '9 de cada 10' },
    ],
    stack: ['Next.js', 'Portal Zetro', 'Vercel'],
  },
  {
    slug: 'consultorio-vidal',
    name: 'Consultorio Vidal',
    vertical: 'generic',
    tagline: 'Turnos para dos consultorios',
    summary:
      'Un sitio institucional serio y un sistema de turnos con horarios distintos por profesional.',
    city: 'La Plata',
    year: 2026,
    url: null,
    accent: 'oklch(0.6 0.12 200)',
    services: ['Sitio web', 'Turnos online', 'Analítica'],
    challenge:
      'La secretaria pasaba tres horas por día devolviendo llamadas para dar turnos que estaban ocupados.',
    solution:
      'El sitio muestra solo lo que está libre. Los horarios y feriados se cargan una vez y el sistema se encarga del resto.',
    results: [
      { label: 'Llamadas por turnos', value: '-70%' },
      { label: 'Turnos online por semana', value: '95' },
      { label: 'Puesta en línea', value: '9 días' },
    ],
    stack: ['Next.js', 'Portal Zetro', 'Vercel'],
  },
]

export function workBySlug(slug: string) {
  return works.find((work) => work.slug === slug) ?? null
}
