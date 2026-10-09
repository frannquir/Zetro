import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Check, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VerticalIllustration } from '@/components/marketing/vertical-illustration'
import { FeaturesBento } from '@/components/marketing/features-bento'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { PricingBuilder } from '@/components/marketing/pricing-builder'
import { MaintenanceBlock } from '@/components/marketing/maintenance-block'
import { works } from '@/content/works'
import { verticalLabel } from '@/lib/labels'
import { WhatsappLink } from '@/components/marketing/whatsapp-link'
import { CONTACT_EMAIL } from '@/lib/contact'

export const metadata: Metadata = {
  title: 'Zetro — sitios web y panel de gestión para negocios',
  description:
    'Hacemos el sitio de tu negocio y el panel donde lo manejás: reservas, clientes, carta y estadísticas. Rápido y sin vueltas.',
}

const faqs = [
  {
    q: '¿Cuánto tarda?',
    a: 'Depende del tamaño del proyecto, pero lo habitual son dos semanas desde que tenemos el contenido. Si es más grande, te damos el plazo en la propuesta.',
  },
  {
    q: '¿La mensualidad qué cubre?',
    a: 'El hosting, que el sitio siga andando, las actualizaciones y los cambios chicos. El panel y cada módulo que sumes tienen su propio abono, que ves en el armador de presupuesto.',
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
    a: 'Si tu negocio reserva algo en un horario, sirve. Está pensado para restaurantes, cafés, gimnasios, barberías y consultorios.',
  },
]

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs leading-none tracking-[0.06em] uppercase font-medium text-ink-4">{children}</p>
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Zetro',
  email: CONTACT_EMAIL,
  areaServed: 'Buenos Aires, Argentina',
  // url canónica: agregar cuando esté el dominio definitivo. Sin valor real no va
  // al JSON-LD: Google lee esto y un placeholder ahí es peor que la ausencia.
}

export default function LandingPage() {
  const featured = works.slice(0, 3)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="border-b border-n-200">
        <div className="mx-auto w-full max-w-[75rem] px-5 py-16 sm:px-8 lg:py-24">
          <div className="max-w-3xl space-y-7">
            <Eyebrow>Sitios y panel para negocios</Eyebrow>

            <h1 className="text-[2.5rem] leading-[1.02] tracking-[-0.03em] font-semibold text-balance text-ink sm:text-[3.5rem]">
              El sitio de tu negocio, y el panel para manejarlo.
            </h1>

            <p className="max-w-xl text-[1.0625rem] leading-[1.55] text-ink-2 text-pretty">
              Hacemos sitios web para restaurantes, cafés, gimnasios y barberías. Con reservas online que entran a tu
              agenda, tu carta siempre al día y las estadísticas que importan.
            </p>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="#precios">
                    Armá tu presupuesto <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/contacto">Escribinos</Link>
                </Button>
              </div>
              <p className="flex flex-wrap gap-x-2 gap-y-1 text-[0.875rem] text-ink-3">
                <span>Desde US$&nbsp;60</span>
                <span aria-hidden="true">·</span>
                <span>Primera charla sin costo</span>
                <span aria-hidden="true">·</span>
                <span>Respondemos en el día hábil</span>
              </p>
            </div>
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
        <div className="mx-auto w-full max-w-[60rem] px-5 py-16 sm:px-8 lg:py-20">
          <div className="max-w-2xl space-y-3">
            <Eyebrow>Cómo funciona</Eyebrow>
            <h2 className="text-[2rem] leading-[1.15] tracking-[-0.02em] font-semibold text-balance text-ink">
              Cuatro pasos y estás en línea.
            </h2>
          </div>

          <div className="mt-10">
            <HowItWorks />
          </div>

          <div className="mt-10 flex flex-col gap-5 rounded-md border border-n-200 bg-surface p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="font-medium text-ink">Todo arranca con una charla de media hora.</p>
              <p className="text-[0.9375rem] text-ink-3 text-pretty">
                Sin costo y sin compromiso. Si querés, antes mirá cuánto saldría.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="#precios">
                  Armá tu presupuesto <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <WhatsappLink source="como-funciona">
                  <MessageCircle /> WhatsApp
                </WhatsappLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Casos reales. Mientras content/works.ts esté vacío la sección no se muestra:
          mejor no tenerla que inventar clientes. */}
      {featured.length > 0 ? (
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
      ) : null}

      <section id="precios" className="scroll-mt-20 border-t border-n-200 bg-paper-2">
        <div className="mx-auto w-full max-w-[75rem] px-5 py-12 sm:px-8 lg:py-14">
          <div className="max-w-2xl space-y-3">
            <Eyebrow>Precios</Eyebrow>
            <h2 className="text-[2rem] leading-[1.15] tracking-[-0.02em] font-semibold text-balance text-ink sm:text-[2.5rem]">
              Precios claros, desde US$&nbsp;60.
            </h2>
            <p className="text-[1.0625rem] leading-[1.55] text-ink-2 text-pretty">
              Sin packs cerrados ni letra chica. Elegí lo que tu negocio necesita y mirá al instante cuánto cuesta el
              alta y el abono mensual.
            </p>
          </div>

          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[0.875rem] text-ink-2">
            {['Pago único de alta', 'Abono mensual', 'Sin compromiso', 'Respuesta en el día hábil'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="size-4 text-brand" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-5">
            <PricingBuilder />
          </div>

          <div className="mt-3">
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
              Contanos qué necesitás y te respondemos en el día hábil con una propuesta concreta.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-paper text-ink hover:bg-paper/90">
              <Link href="#precios">
                Armá tu presupuesto <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-paper/30 bg-transparent text-paper hover:bg-paper/10"
            >
              <WhatsappLink source="cierre">
                <MessageCircle /> WhatsApp
              </WhatsappLink>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
