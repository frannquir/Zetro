import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { works } from '@/content/works'
import { verticalLabel } from '@/lib/labels'

export const metadata: Metadata = {
  title: 'Trabajos — Zetro',
  description: 'Sitios y paneles que armamos para restaurantes, cafés, gimnasios, barberías y consultorios.',
}

export default function TrabajosPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 lg:py-20">
      <div className="max-w-2xl space-y-3">
        <p className="text-sm font-medium text-primary">Trabajos</p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance">
          Cada uno tenía un problema distinto. La solución se parece bastante.
        </h1>
        <p className="text-muted-foreground text-pretty">
          Sitio rápido adelante, panel ordenado atrás. Lo que cambia es el vocabulario: mesas, sillones, salas.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((work) => (
          <Link
            key={work.slug}
            href={`/trabajos/${work.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
          >
            <div
              className="h-40 w-full"
              style={{ background: `linear-gradient(135deg, ${work.accent}, color-mix(in oklch, ${work.accent} 45%, black))` }}
            />
            <div className="flex flex-1 flex-col gap-2 p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{verticalLabel(work.vertical)}</span>
                <span aria-hidden="true">·</span>
                <span>{work.city}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{work.year}</span>
              </div>
              <h2 className="font-medium group-hover:text-primary">{work.name}</h2>
              <p className="flex-1 text-sm text-muted-foreground text-pretty">{work.summary}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Ver el caso <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
