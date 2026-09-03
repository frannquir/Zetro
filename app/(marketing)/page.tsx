import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PanelPreview } from '@/components/marketing/panel-preview'
import { VerticalIllustration } from '@/components/marketing/vertical-illustration'
import { PathDoodle } from '@/components/marketing/notebook-doodle'
import { DiagnosticForm } from '@/components/marketing/diagnostic-form'
import { FeaturesBento } from '@/components/marketing/features-bento'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { PricingBuilder } from '@/components/marketing/pricing-builder'
import { MaintenanceBlock } from '@/components/marketing/maintenance-block'
import { works } from '@/content/works'
import { verticalLabel } from '@/lib/labels'

export const metadata: Metadata = {
  title: 'Zetro — sitios web y panel de gestión para negocios',
  description:
    'Hacemos el sitio de tu negocio y el panel donde lo manejás: reservas, clientes, carta y estadísticas. Rápido y sin vueltas.',
}

const faqs = [
  {
    q: '¿Cuánto tarda?',
    a: 'Entre diez y quince días hábiles desde que tenemos el contenido. Si el contenido lo escribimos nosotros, sumá una semana.',
  },
  {
    q: '¿La mensualidad qué cubre?',
    a: 'El panel, el hosting, las actualizaciones y los cambios chicos. Si querés una sección nueva completa, eso se cotiza aparte.',
  },
  {
    q: '¿El sitio es mío?',
    a: 'Sí. El dominio queda a tu nombre y el contenido es tuyo. Si algún día te vas, te llevás el sitio.',
  },
  {
    q: '¿Cobran las reservas online?',
    a: 'No. El portal toma la reserva, no el pago. Vos cobrás como cobrás hoy.',
  },
  {
    q: '¿Sirve para mi rubro?',
    a: 'Si tu negocio reserva algo en un horario, sirve. Hoy tenemos restaurantes, cafés, gimnasios, barberías y consultorios.',
  },
]

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs leading-none tracking-[0.06em] uppercase font-medium text-ink-4">{children}</p>
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Zetro',
  email: 'contacto@zetro.app',
  areaServed: 'Buenos Aires, Argentina',
  url: '[[PENDIENTE: url canónica del sitio]]',
}

export default function LandingPage() {
  const featured = works.slice(0, 3)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="border-b border-n-200">
        <div className="mx-auto grid w-full max-w-[75rem] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:items-center lg:py-24">
          <div className="space-y-7 lg:col-span-7">
            <Eyebrow>Sitios y panel para negocios</Eyebrow>

            <h1 className="text-[2.5rem] leading-[1.02] tracking-[-0.03em] font-semibold text-balance text-ink sm:text-[3.5rem]">
              El sitio de tu negocio, y el panel para manejarlo.
            </h1>

            <p className="max-w-xl text-[1.0625rem] leading-[1.55] text-ink-2 text-pretty">
              Hacemos sitios web para restaurantes, cafés, gimnasios y barberías. Con reservas online que entran a tu
              agenda, tu carta siempre al día y las estadísticas que importan.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/contacto">
                  Pedir presupuesto <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/trabajos">Ver trabajos</Link>
              </Button>
            </div>

          </div>

          <div className="lg:col-span-5">
            <PanelPreview />
          </div>
        </div>
      </section>

      {/* Tarea 1: reemplaza el bloque de stats falsas (sitios publicados / puesta en línea / reservas
          gestionadas) por un hook de captación honesto — Opción A del prompt (diagnóstico gratis).
          Opciones descartadas, documentadas para que el equipo las evalúe después:
          - Opción B: auto-chequeo de 5 preguntas con puntaje 0–5 (honesto, engancha por autodiagnóstico).
          - Opción C: tres claims verificables ("somos de acá", "respondemos en el día",
            "tomamos pocos proyectos por mes") en vez de un formulario. */}
      <section className="border-t border-n-200 bg-paper-2">
        <div className="mx-auto w-full max-w-[60rem] px-5 py-16 sm:px-8 lg:py-20">
          <div className="max-w-2xl space-y-3">
            <Eyebrow>Diagnóstico gratis</Eyebrow>
            <h2 className="text-[2rem] leading-[1.15] tracking-[-0.02em] font-semibold text-balance text-ink">
              ¿Cómo te ve un cliente que te busca en Google?
            </h2>
            <p className="text-[1.0625rem] leading-[1.55] text-ink-2 text-pretty">
              Te hacemos un diagnóstico gratis de tu negocio en internet: si aparecés, cómo se ve tu sitio o tu
              Instagram desde un celular, y qué te está costando clientes. Sin compromiso y sin vueltas.
            </p>
          </div>

          <div className="mt-8 rounded-md border border-n-200 bg-surface p-6 sm:p-8">
            <DiagnosticForm />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[75rem] px-5 py-16 sm:px-8 lg:py-20">
        <div className="max-w-2xl space-y-3">
          <Eyebrow>Qué te llevás</Eyebrow>
          <h2 className="text-[2rem] leading-[1.15] tracking-[-0.02em] font-semibold text-balance text-ink">
            Un sitio no alcanza si después seguís anotando en un cuaderno.
          </h2>
        </div>

        <FeaturesBento />
      </section>

      <section id="como-funciona" className="scroll-mt-20 border-t border-n-200">
        <div className="mx-auto w-full max-w-[48rem] px-5 py-16 sm:px-8 lg:py-20">
          <div className="max-w-2xl space-y-3">
            <Eyebrow>Cómo funciona</Eyebrow>
            <h2 className="text-[2rem] leading-[1.15] tracking-[-0.02em] font-semibold text-balance text-ink">
              Cuatro pasos y estás en línea.
            </h2>
          </div>

          <PathDoodle className="mt-10 mb-2 hidden w-full lg:block" />

          <div className="mt-10 lg:mt-6">
            <HowItWorks />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[75rem] px-5 py-16 sm:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl space-y-3">
            <Eyebrow>Trabajos</Eyebrow>
            <h2 className="text-[2rem] leading-[1.15] tracking-[-0.02em] font-semibold text-balance text-ink">
              Negocios que ya lo están usando.
            </h2>
          </div>
          <Button asChild variant="ghost">
            <Link href="/trabajos">
              Ver todos <ArrowRight className="transition-transform duration-[120ms] group-hover/button:translate-x-0.5" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {featured.map((work) => (
            <Link
              key={work.slug}
              href={`/trabajos/${work.slug}`}
              className="group flex flex-col overflow-hidden rounded-md border border-n-200 bg-surface"
            >
              <div className="flex aspect-[4/3] w-full items-center justify-center bg-paper-2 px-4">
                <VerticalIllustration vertical={work.vertical} />
              </div>
              <div className="flex-1 space-y-2 p-5">
                <div className="flex items-center gap-2 text-xs text-ink-4">
                  <span>{verticalLabel(work.vertical)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{work.city}</span>
                </div>
                <h3 className="font-medium text-ink group-hover:text-brand">{work.name}</h3>
                <p className="text-[0.9375rem] text-ink-3 text-pretty">{work.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="precios" className="scroll-mt-20 border-t border-n-200 bg-paper-2">
        <div className="mx-auto w-full max-w-[52rem] px-5 py-16 sm:px-8 lg:py-20">
          <div className="max-w-2xl space-y-3">
            <Eyebrow>Precios</Eyebrow>
            <h2 className="text-[2rem] leading-[1.15] tracking-[-0.02em] font-semibold text-balance text-ink">
              Armá tu presupuesto.
            </h2>
            <p className="text-[1.0625rem] leading-[1.55] text-ink-2 text-pretty">
              Cada proyecto es distinto, así que no hay packs cerrados. Elegí lo que necesitás y te llevás un rango
              claro para arrancar la conversación.
            </p>
          </div>

          <div className="mt-10">
            <PricingBuilder />
          </div>

          <div className="mt-8">
            <MaintenanceBlock />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[45rem] px-5 py-16 sm:px-8 lg:py-20">
        <h2 className="text-[2rem] leading-[1.15] tracking-[-0.02em] font-semibold text-balance text-ink">
          Preguntas que nos hacen siempre.
        </h2>
        <dl className="mt-8 divide-y divide-n-200 border-t border-n-200">
          {faqs.map((faq) => (
            <div key={faq.q} className="py-5">
              <dt className="font-medium text-ink">{faq.q}</dt>
              <dd className="mt-1.5 text-[0.9375rem] text-ink-2 text-pretty">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-t border-n-200 bg-ink text-paper">
        <div className="mx-auto flex w-full max-w-[75rem] flex-wrap items-center justify-between gap-6 px-5 py-14 sm:px-8">
          <div className="space-y-2">
            <h2 className="text-2xl leading-[1.15] tracking-[-0.015em] font-semibold text-balance sm:text-[2rem]">
              ¿Arrancamos con el tuyo?
            </h2>
            <p className="max-w-lg text-[1.0625rem] leading-[1.55] text-paper/75 text-pretty">
              Contanos qué necesitás y te respondemos en el día con una propuesta concreta.
            </p>
          </div>
          <Button asChild size="lg" variant="outline" className="border-paper/30 bg-transparent text-paper hover:bg-paper/10">
            <Link href="/contacto">
              Pedir presupuesto <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
