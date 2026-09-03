import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { VerticalIllustration } from '@/components/marketing/vertical-illustration'
import { works } from '@/content/works'
import { verticalLabel } from '@/lib/labels'

export const metadata: Metadata = {
  title: 'Trabajos — Zetro',
  description: 'Sitios y paneles que armamos para restaurantes, cafés, gimnasios, barberías y consultorios.',
}

export default function TrabajosPage() {
  return (
    <div className="mx-auto w-full max-w-[75rem] px-5 py-14 sm:px-8 lg:py-20">
      <div className="max-w-2xl space-y-3">
        <p className="text-xs leading-none tracking-[0.06em] uppercase font-medium text-ink-4">Trabajos</p>
        <h1 className="text-[2.75rem] leading-[1.08] tracking-[-0.025em] font-semibold text-balance text-ink">
          Cada uno tenía un problema distinto. La solución se parece bastante.
        </h1>
        <p className="text-[1.0625rem] leading-[1.55] text-ink-2 text-pretty">
          Sitio rápido adelante, panel ordenado atrás. Lo que cambia es el vocabulario: mesas, sillones, salas.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((work) => (
          <Link
            key={work.slug}
            href={`/trabajos/${work.slug}`}
            className="group flex flex-col overflow-hidden rounded-md border border-n-200 bg-surface"
          >
            <div className="flex aspect-[4/3] w-full items-center justify-center bg-paper-2 px-4">
              <VerticalIllustration vertical={work.vertical} />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
              <div className="flex items-center gap-2 text-xs text-ink-4">
                <span>{verticalLabel(work.vertical)}</span>
                <span aria-hidden="true">·</span>
                <span>{work.city}</span>
                <span aria-hidden="true">·</span>
                <span className="tnum">{work.year}</span>
              </div>
              <h2 className="font-medium text-ink group-hover:text-brand">{work.name}</h2>
              <p className="flex-1 text-[0.9375rem] text-ink-3 text-pretty">{work.summary}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[0.9375rem] font-medium text-brand">
                Ver el caso <ArrowRight className="size-4 transition-transform duration-[120ms] group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
