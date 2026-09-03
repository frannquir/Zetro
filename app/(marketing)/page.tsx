import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PanelPreview } from '@/components/marketing/panel-preview'
import { VerticalIllustration } from '@/components/marketing/vertical-illustration'
import { ChecklistDoodle, PathDoodle } from '@/components/marketing/notebook-doodle'
import { works } from '@/content/works'
import { verticalLabel } from '@/lib/labels'

export const metadata: Metadata = {
  title: 'Zetro — sitios web y panel de gestión para negocios',
  description:
    'Hacemos el sitio de tu negocio y el panel donde lo manejás: reservas, clientes, carta y estadísticas. Rápido y sin vueltas.',
}

const features = [
  { title: 'Un sitio que carga rápido', body: 'Hosting y dominio incluidos, sin plugins que se rompen solos.' },
  { title: 'Reservas que no se pisan', body: 'Entran directo a tu agenda. Nunca dos personas, la misma mesa.' },
  { title: 'Números que sirven', body: 'Quién entró, de dónde vino y cuántos reservaron. Una sola pantalla.' },
  { title: 'Se maneja del celular', body: 'Pensado para usarse parado atrás de la barra, no en una oficina.' },
  { title: 'Tu contenido, sin depender de nosotros', body: 'Cambiás carta y precios desde el panel, al toque.' },
  { title: 'Listo en dos semanas', body: 'Charla, propuesta, sitio en línea. Sin vueltas de por medio.' },
]

const steps = [
  { title: 'Charlamos media hora', body: 'Nos contás tu negocio. Salimos con alcance y precio cerrado.' },
  { title: 'Armamos el sitio', body: 'Revisás una versión en línea antes de que la vea nadie más.' },
  { title: 'Conectamos el panel', body: 'Cargamos mesas y horarios. Te mostramos cómo se usa en 20 minutos.' },
  { title: 'Salimos a producción', body: 'Tu dominio, tu sitio, tus reservas. Lo mantenemos andando.' },
]

const plans = [
  {
    name: 'Sitio',
    price: 'desde $290.000',
    period: 'pago único',
    body: 'Para el negocio que solo necesita existir bien en internet.',
    items: ['Sitio de hasta 5 secciones', 'Diseño propio', 'Dominio y hosting configurados', 'Formulario de contacto', 'Estadísticas básicas'],
    cta: 'Pedir presupuesto',
    featured: false,
  },
  {
    name: 'Sitio + Panel',
    price: 'desde $390.000',
    period: 'más $29.000 por mes',
    body: 'El sitio, más el panel donde manejás reservas, clientes y contenido.',
    items: [
      'Todo lo del plan Sitio',
      'Reservas online y agenda',
      'Clientes y su historial',
      'Carta, clases o eventos según el rubro',
      'Analítica del sitio conectada a las reservas',
      'Google Calendar',
    ],
    cta: 'Empezar',
    featured: true,
  },
  {
    name: 'A medida',
    price: 'a convenir',
    period: 'según alcance',
    body: 'Varias sucursales, integraciones propias o algo que no entra en las cajitas de arriba.',
    items: ['Todo lo del plan Sitio + Panel', 'Varias sucursales o marcas', 'Integraciones a medida', 'Soporte prioritario'],
    cta: 'Hablemos',
    featured: false,
  },
]

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

export default function LandingPage() {
  const featured = works.slice(0, 3)

  return (
    <>
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

            <dl className="flex flex-wrap gap-x-10 gap-y-4 border-t border-n-200 pt-6">
              {[
                { k: 'Sitios publicados', v: '40+' },
                { k: 'Puesta en línea promedio', v: '12 días' },
                { k: 'Reservas gestionadas por mes', v: '9.000' },
              ].map((stat) => (
                <div key={stat.k}>
                  <dt className="text-[0.8125rem] text-ink-3">{stat.k}</dt>
                  <dd className="text-xl leading-none tracking-[-0.02em] font-semibold tnum text-ink">{stat.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-5">
            <PanelPreview />
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

        <div className="mt-10 grid gap-10 lg:grid-cols-[18rem_1fr] lg:items-center">
          <ChecklistDoodle className="mx-auto hidden w-44 text-n-300 lg:block" />

          <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {features.map((feature, index) => (
              <div key={feature.title} className="grid grid-cols-[2rem_1fr] gap-x-3">
                <span className="pt-0.5 text-[0.8125rem] font-medium tnum text-ink-4">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-medium text-ink">{feature.title}</h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-[1.55] text-ink-2 text-pretty">{feature.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-20 border-t border-n-200">
        <div className="mx-auto w-full max-w-[75rem] px-5 py-16 sm:px-8 lg:py-20">
          <div className="max-w-2xl space-y-3">
            <Eyebrow>Cómo funciona</Eyebrow>
            <h2 className="text-[2rem] leading-[1.15] tracking-[-0.02em] font-semibold text-balance text-ink">
              Cuatro pasos y estás en línea.
            </h2>
          </div>

          <PathDoodle className="mt-10 mb-2 hidden w-full lg:block" />

          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-0 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="space-y-2 border-t border-n-300 pt-5">
                <span className="text-[1.75rem] leading-none tracking-[-0.02em] font-semibold tnum text-ink">
                  0{index + 1}
                </span>
                <h3 className="font-medium text-ink">{step.title}</h3>
                <p className="text-[0.9375rem] leading-[1.55] text-ink-2 text-pretty">{step.body}</p>
              </li>
            ))}
          </ol>
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
        <div className="mx-auto w-full max-w-[75rem] px-5 py-16 sm:px-8 lg:py-20">
          <div className="max-w-2xl space-y-3">
            <Eyebrow>Precios</Eyebrow>
            <h2 className="text-[2rem] leading-[1.15] tracking-[-0.02em] font-semibold text-balance text-ink">
              Precio cerrado antes de empezar.
            </h2>
            <p className="text-[1.0625rem] leading-[1.55] text-ink-2 text-pretty">
              Valores de referencia en pesos, sin IVA. La cotización final sale de la primera charla y no se mueve
              después.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={
                  plan.featured
                    ? 'flex flex-col rounded-md bg-paper-2 p-6'
                    : 'flex flex-col rounded-md border border-n-200 bg-surface p-6'
                }
              >
                {plan.featured ? <p className="text-[0.8125rem] font-medium text-brand">Recomendado</p> : null}

                <h3 className="font-medium text-ink">{plan.name}</h3>
                <p className="mt-3 text-2xl leading-none tracking-[-0.02em] font-semibold tnum text-ink">{plan.price}</p>
                <p className="text-[0.8125rem] text-ink-3">{plan.period}</p>
                <p className="mt-3 text-[0.9375rem] text-ink-2 text-pretty">{plan.body}</p>

                <ul className="mt-5 flex-1 space-y-2.5 text-[0.9375rem]">
                  {plan.items.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                      <span className="text-ink-2">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild className="mt-6" variant={plan.featured ? 'default' : 'outline'}>
                  <Link href="/contacto">{plan.cta}</Link>
                </Button>
              </div>
            ))}
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
