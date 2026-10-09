export type Work = {
  slug: string
  name: string
  // Rubro tal como se muestra en el sitio. No sale de lib/labels porque esos
  // rubros son los del panel de reservas y un caso puede no reservar nada.
  category: string
  // Para el pictograma de respaldo cuando no hay captura.
  vertical: string
  tagline: string
  summary: string
  city: string
  year: number
  url: string | null
  // Captura real del sitio, servida desde public/. Proporción 16:10.
  image: { src: string; alt: string } | null
  accent: string
  services: string[]
  challenge: string
  solution: string
  results: { label: string; value: string }[]
  stack: string[]
}

// Solo casos reales de clientes reales. Cargar uno lo hace aparecer en la
// landing, en /trabajos y en el menú sin tocar nada más.
export const works: Work[] = [
  {
    slug: 'cabure',
    name: 'Caburé Pet Shop',
    category: 'Pet shop',
    vertical: 'generic',
    tagline: 'Catálogo online con pedido por WhatsApp para un pet shop con dos locales en Mar del Plata.',
    summary:
      'El cliente arma el pedido en el sitio, lo manda por WhatsApp y elige si lo recibe en su casa o lo retira en uno de los dos locales.',
    city: 'Mar del Plata',
    year: 2026,
    url: 'https://www.cabure.store',
    image: {
      src: '/trabajos/cabure/cabure-inicio.jpg',
      alt: 'Página de inicio de cabure.store: buscador, categorías por mascota y productos destacados.',
    },
    accent: '#c9a45c',
    services: ['Sitio web', 'Catálogo de productos', 'Pedido por WhatsApp', 'Reseñas de Google'],
    challenge:
      'Caburé vende alimento balanceado, higiene y veterinaria para perros, gatos y otras mascotas en dos locales. Las consultas entraban por WhatsApp sin contexto: qué marcas hay, en qué tamaño, a qué local ir. Cada pedido arrancaba de cero.',
    solution:
      'Armamos un catálogo que se recorre por mascota o por categoría, con buscador por marca. El cliente suma productos a un pedido y lo envía por WhatsApp ya armado; el local confirma precio y stock en la misma conversación. Cada local tiene su dirección, cómo llegar y sus reseñas de Google, que se actualizan solas.',
    results: [
      { value: '2', label: 'locales con retiro y reseñas propias' },
      { value: '4', label: 'categorías: seco, húmedo, higiene y veterinaria' },
      { value: '1', label: 'mensaje de WhatsApp con el pedido completo' },
    ],
    stack: ['Next.js', 'Vercel', 'WhatsApp', 'Google Reviews'],
  },
]

export function workBySlug(slug: string) {
  return works.find((work) => work.slug === slug) ?? null
}
