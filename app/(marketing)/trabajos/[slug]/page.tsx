import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { works, workBySlug } from '@/content/works'
import { verticalLabel } from '@/lib/labels'

export function generateStaticParams() {
  return works.map((work) => ({ slug: work.slug }))
}

export async function generateMetadata({ params }: PageProps<'/trabajos/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const work = workBySlug(slug)
  if (!work) return { title: 'Trabajo no encontrado — Zetro' }
  return { title: `${work.name} — Zetro`, description: work.summary }
}

export default async function TrabajoPage({ params }: PageProps<'/trabajos/[slug]'>) {
  const { slug } = await params
  const work = workBySlug(slug)
  if (!work) notFound()

  const others = works.filter((item) => item.slug !== work.slug).slice(0, 3)

  return (
    <article>
      <header className="border-b">
        <div className="mx-auto w-full max-w-4xl space-y-5 px-5 py-12 lg:py-16">
          <Link href="/trabajos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Trabajos
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{verticalLabel(work.vertical)}</span>
            <span aria-hidden="true">·</span>
            <span>{work.city}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{work.year}</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-balance">{work.name}</h1>
          <p className="max-w-2xl text-lg text-muted-foreground text-pretty">{work.tagline}</p>
          <div className="flex flex-wrap gap-2">
            {work.services.map((service) => (
              <span key={service} className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
                {service}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div
        className="h-56 w-full sm:h-72"
        style={{ background: `linear-gradient(135deg, ${work.accent}, color-mix(in oklch, ${work.accent} 45%, black))` }}
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-4xl space-y-12 px-5 py-14">
        <dl className="grid gap-4 sm:grid-cols-3">
          {work.results.map((result) => (
            <div key={result.label} className="rounded-xl border bg-card p-5">
              <dd className="text-3xl font-semibold tracking-tight tabular-nums">{result.value}</dd>
              <dt className="mt-1 text-sm text-muted-foreground text-pretty">{result.label}</dt>
            </div>
          ))}
        </dl>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">El problema</h2>
          <p className="text-muted-foreground text-pretty">{work.challenge}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Qué hicimos</h2>
          <p className="text-muted-foreground text-pretty">{work.solution}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Con qué está hecho</h2>
          <ul className="flex flex-wrap gap-2">
            {work.stack.map((item) => (
              <li key={item} className="rounded-md bg-muted px-2.5 py-1 text-sm text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        </section>

        {work.url ? (
          <Button asChild>
            <a href={work.url} target="_blank" rel="noreferrer">
              Visitar el sitio <ArrowRight />
            </a>
          </Button>
        ) : null}
      </div>

      <section className="border-t bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-5 py-14">
          <h2 className="text-xl font-semibold tracking-tight">Otros trabajos</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/trabajos/${other.slug}`}
                className="group rounded-xl border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <p className="text-xs text-muted-foreground">{verticalLabel(other.vertical)}</p>
                <p className="mt-1 font-medium group-hover:text-primary">{other.name}</p>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">{other.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </article>
  )
}
