import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  Check,
  Globe,
  MessageSquare,
  Rocket,
  Smartphone,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PanelPreview } from '@/components/marketing/panel-preview'
import { works } from '@/content/works'
import { verticalLabel } from '@/lib/labels'

export const metadata: Metadata = {
  title: 'Zetro — sitios web y panel de gestión para negocios',
  description:
    'Hacemos el sitio de tu negocio y el panel donde lo manejás: reservas, clientes, carta y estadísticas. Rápido y sin vueltas.',
}

const features = [
  {
    icon: Globe,
    title: 'Un sitio que carga rápido',
    body: 'Next.js, hosting incluido y tu dominio. Nada de plantillas pesadas ni plugins que se rompen solos.',
  },
  {
    icon: CalendarCheck,
    title: 'Reservas que no se pisan',
    body: 'El cliente reserva desde tu sitio y entra directo a tu agenda. Dos personas no pueden tomar la misma mesa.',
  },
  {
    icon: BarChart3,
    title: 'Números que sirven',
    body: 'Cuánta gente entró, de dónde vino y cuántos terminaron reservando. En la misma pantalla.',
  },
  {
    icon: Smartphone,
    title: 'Se maneja del celular',
    body: 'El panel está pensado para usarse parado detrás de la barra, no sentado en una oficina.',
  },
  {
    icon: MessageSquare,
    title: 'Tu contenido, sin depender de nosotros',
    body: 'Cambiás la carta, los horarios o los precios desde el panel y el sitio se actualiza al toque.',
  },
  {
    icon: Zap,
    title: 'Listo en dos semanas',
    body: 'Charla, propuesta, sitio en línea. Sin reuniones de descubrimiento de tres meses.',
  },
]

const steps = [
  {
    title: 'Charlamos media hora',
    body: 'Nos contás qué hace tu negocio y qué te está costando. Salimos con un alcance y un precio cerrado.',
  },
  {
    title: 'Armamos el sitio',
    body: 'Diseño y contenido. Vos revisás una versión en línea antes de que la vea nadie más.',
  },
  {
    title: 'Conectamos el panel',
    body: 'Cargamos tus mesas, servicios y horarios. Te mostramos cómo se usa en una llamada de veinte minutos.',
  },
  {
    title: 'Salimos a producción',
    body: 'Tu dominio, tu sitio, tus reservas. A partir de ahí lo mantenemos andando.',
  },
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

export default function LandingPage() {
  const featured = works.slice(0, 3)

  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,var(--accent),transparent)]" />
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-24">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Rocket className="size-3.5 text-primary" />
              Sitios en línea en dos semanas
            </span>

            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              El sitio de tu negocio, y el panel para manejarlo.
            </h1>

            <p className="max-w-xl text-lg text-muted-foreground text-pretty">
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

            <dl className="flex flex-wrap gap-x-10 gap-y-4 border-t pt-6">
              {[
                { k: 'Sitios publicados', v: '40+' },
                { k: 'Puesta en línea promedio', v: '12 días' },
                { k: 'Reservas gestionadas por mes', v: '9.000' },
              ].map((stat) => (
                <div key={stat.k}>
                  <dt className="text-xs text-muted-foreground">{stat.k}</dt>
                  <dd className="text-xl font-semibold tracking-tight tabular-nums">{stat.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <PanelPreview />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 lg:py-20">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-medium text-primary">Qué te llevás</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Un sitio no alcanza si después seguís anotando en un cuaderno.
          </h2>
          <p className="text-muted-foreground text-pretty">
            Por eso todo lo que hacemos viene con un panel atrás. El sitio muestra; el panel resuelve.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/40">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-medium">{feature.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground text-pretty">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-20 border-y bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:py-20">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-medium text-primary">Cómo funciona</p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance">Cuatro pasos y estás en línea.</h2>
          </div>

          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="relative space-y-2 border-t-2 border-primary/25 pt-5">
                <span className="text-sm font-semibold tabular-nums text-primary">0{index + 1}</span>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground text-pretty">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-medium text-primary">Trabajos</p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance">Negocios que ya lo están usando.</h2>
          </div>
          <Button asChild variant="ghost">
            <Link href="/trabajos">
              Ver todos <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {featured.map((work) => (
            <Link
              key={work.slug}
              href={`/trabajos/${work.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
            >
              <div className="h-36 w-full" style={{ background: `linear-gradient(135deg, ${work.accent}, color-mix(in oklch, ${work.accent} 45%, black))` }} />
              <div className="flex-1 space-y-2 p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{verticalLabel(work.vertical)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{work.city}</span>
                </div>
                <h3 className="font-medium group-hover:text-primary">{work.name}</h3>
                <p className="text-sm text-muted-foreground text-pretty">{work.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="precios" className="scroll-mt-20 border-y bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:py-20">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-medium text-primary">Precios</p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance">Precio cerrado antes de empezar.</h2>
            <p className="text-muted-foreground text-pretty">
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
                    ? 'relative flex flex-col rounded-xl border-2 border-primary bg-card p-6 shadow-lg shadow-primary/10'
                    : 'flex flex-col rounded-xl border bg-card p-6'
                }
              >
                {plan.featured ? (
                  <span className="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                    El más elegido
                  </span>
                ) : null}

                <h3 className="font-medium">{plan.name}</h3>
                <p className="mt-3 text-2xl font-semibold tracking-tight">{plan.price}</p>
                <p className="text-sm text-muted-foreground">{plan.period}</p>
                <p className="mt-3 text-sm text-muted-foreground text-pretty">{plan.body}</p>

                <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                  {plan.items.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
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

      <section className="mx-auto w-full max-w-3xl px-5 py-16 lg:py-20">
        <h2 className="text-3xl font-semibold tracking-tight text-balance">Preguntas que nos hacen siempre.</h2>
        <dl className="mt-8 divide-y border-t">
          {faqs.map((faq) => (
            <div key={faq.q} className="py-5">
              <dt className="font-medium">{faq.q}</dt>
              <dd className="mt-1.5 text-sm text-muted-foreground text-pretty">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-t bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-14">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              ¿Arrancamos con el tuyo?
            </h2>
            <p className="max-w-lg text-primary-foreground/75 text-pretty">
              Contanos qué necesitás y te respondemos en el día con una propuesta concreta.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary">
            <Link href="/contacto">
              Pedir presupuesto <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
