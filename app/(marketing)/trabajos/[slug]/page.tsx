import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VerticalIllustration } from '@/components/marketing/vertical-illustration'
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
      <header className="border-b border-n-200">
        <div className="mx-auto w-full max-w-[45rem] space-y-5 px-5 py-12 sm:px-8 lg:py-16">
          <Link href="/trabajos" className="inline-flex items-center gap-1.5 text-[0.9375rem] text-ink-3 hover:text-ink">
            <ArrowLeft className="size-4" /> Trabajos
          </Link>
          <div className="flex items-center gap-2 text-[0.9375rem] text-ink-3">
            <span>{verticalLabel(work.vertical)}</span>
            <span aria-hidden="true">·</span>
            <span>{work.city}</span>
            <span aria-hidden="true">·</span>
            <span className="tnum">{work.year}</span>
          </div>
          <h1 className="text-[2.75rem] leading-[1.08] tracking-[-0.025em] font-semibold text-balance text-ink">{work.name}</h1>
          <p className="max-w-2xl text-[1.0625rem] leading-[1.55] text-ink-2 text-pretty">{work.tagline}</p>
          <div className="flex flex-wrap gap-2">
            {work.services.map((service) => (
              <span key={service} className="rounded-full border border-n-300 px-3 py-1 text-xs text-ink-3">
                {service}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="flex aspect-[16/6] w-full items-center justify-center bg-paper-2">
        <VerticalIllustration vertical={work.vertical} className="[&_svg]:size-24" />
      </div>

      <div className="mx-auto w-full max-w-[45rem] space-y-12 px-5 py-14 sm:px-8">
        <dl className="grid gap-4 sm:grid-cols-3">
          {work.results.map((result) => (
            <div key={result.label} className="rounded-md border border-n-200 bg-surface p-5">
              <dd className="text-[1.75rem] leading-none tracking-[-0.02em] font-semibold tnum text-ink">{result.value}</dd>
              <dt className="mt-1 text-[0.9375rem] text-ink-3 text-pretty">{result.label}</dt>
            </div>
          ))}
        </dl>

        <section className="space-y-3">
          <h2 className="text-xl leading-tight tracking-[-0.015em] font-semibold text-ink">El problema</h2>
          <p className="text-[1.0625rem] leading-[1.55] text-ink-2 text-pretty">{work.challenge}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl leading-tight tracking-[-0.015em] font-semibold text-ink">Qué hicimos</h2>
          <p className="text-[1.0625rem] leading-[1.55] text-ink-2 text-pretty">{work.solution}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl leading-tight tracking-[-0.015em] font-semibold text-ink">Con qué está hecho</h2>
          <ul className="flex flex-wrap gap-2">
            {work.stack.map((item) => (
              <li key={item} className="rounded-sm bg-n-100 px-2.5 py-1 text-[0.9375rem] text-ink-3">
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

      <section className="border-t border-n-200 bg-paper-2">
        <div className="mx-auto w-full max-w-[75rem] px-5 py-14 sm:px-8">
          <h2 className="text-xl leading-tight tracking-[-0.015em] font-semibold text-ink">Otros trabajos</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/trabajos/${other.slug}`}
                className="group rounded-md border border-n-200 bg-surface p-5"
              >
                <p className="text-xs text-ink-4">{verticalLabel(other.vertical)}</p>
                <p className="mt-1 font-medium text-ink group-hover:text-brand">{other.name}</p>
                <p className="mt-1 text-[0.9375rem] text-ink-3 text-pretty">{other.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </article>
  )
}
