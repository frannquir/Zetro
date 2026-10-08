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

// Vacío a propósito: acá van casos reales de clientes reales. Mientras esté
// vacío, la landing no muestra la sección de trabajos y /trabajos avisa que
// todavía no hay casos publicados. Cargar un caso lo hace aparecer en los dos
// lugares sin tocar nada más.
export const works: Work[] = []

export function workBySlug(slug: string) {
  return works.find((work) => work.slug === slug) ?? null
}
