'use client'

import { useId, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, CircleCheckBig, Loader2, Minus, Plus } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { postJson } from '@/lib/api'

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Poné tu nombre'),
  email: z.email('Revisá el mail'),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().max(2000).optional(),
})

type ContactErrors = Partial<Record<keyof z.infer<typeof contactSchema>, string>>
// [[PENDIENTE: WHATSAPP]] — número de WhatsApp comercial en formato internacional sin signos (ej. 5492235551234)
const WHATSAPP_NUMBER: string | null = null

type Money = { min: number | null; max: number | null }

type Addon = {
  id: string
  grupo: string
  nombre: string
  descripcion: string
  alta: Money // pago único
  abono: Money // por mes
  cantidad: boolean
  maxCantidad?: number
}

// Todos los montos viven acá, en USD. Un `null` es un valor sin definir (la tabla de precios trae un guion).
// [[PENDIENTE: definir tratamiento de IVA]] — cuando se defina, sumarlo a la nota del punto de partida.
const NONE: Money = { min: null, max: null }

const PRICING: {
  moneda: 'USD'
  base: { nombre: string; alta: Money; abono: Money }
  agregados: Addon[]
} = {
  moneda: 'USD',
  base: {
    nombre: 'Sitio web',
    alta: { min: 60, max: 96 },
    abono: { min: 7.2, max: 9 },
  },
  agregados: [
    {
      id: 'panel',
      grupo: 'Gestión y control',
      nombre: 'Panel de gestión',
      descripcion: 'Cambiás textos, fotos y precios vos mismo, sin depender de nadie.',
      alta: { min: 30, max: 54 },
      abono: { min: 3.6, max: 6 },
      cantidad: false,
    },
    {
      id: 'pagos',
      grupo: 'Gestión y control',
      nombre: 'Registro de pagos',
      descripcion: 'Llevás el control de los pagos de tus clientes.',
      alta: { min: 30, max: 48 },
      abono: { min: 2.4, max: 4.2 },
      cantidad: false,
    },
    {
      id: 'tablero',
      grupo: 'Gestión y control',
      nombre: 'Tablero de resumen',
      descripcion: 'Una vista con los números clave de tu negocio.',
      alta: NONE,
      abono: NONE,
      cantidad: false,
    },
    {
      id: 'reservas',
      grupo: 'Para atender y vender',
      nombre: 'Reservas y turnos',
      descripcion: 'Tus clientes reservan sin escribirte.',
      alta: { min: 54, max: 90 },
      abono: { min: 4.8, max: 8.4 },
      cantidad: false,
    },
    {
      id: 'clases',
      grupo: 'Para atender y vender',
      nombre: 'Clases con cupo',
      descripcion: 'Clases con cupo limitado e inscripción online.',
      alta: { min: 48, max: 78 },
      abono: { min: 4.8, max: 8.4 },
      cantidad: false,
    },
    {
      id: 'carta',
      grupo: 'Para atender y vender',
      nombre: 'Carta digital',
      descripcion: 'Tu carta o catálogo con precios siempre actualizados.',
      alta: { min: 36, max: 60 },
      abono: { min: 3, max: 4.8 },
      cantidad: false,
    },
    {
      id: 'eventos',
      grupo: 'Para atender y vender',
      nombre: 'Eventos',
      descripcion: 'Publicás eventos y recibís inscripciones.',
      alta: { min: 30, max: 54 },
      abono: { min: 3, max: 4.8 },
      cantidad: false,
    },
    {
      id: 'sede',
      grupo: 'Para crecer',
      nombre: 'Sede adicional',
      descripcion: 'Sumás otra sucursal o local.',
      alta: { min: 24, max: 42 },
      abono: { min: 3, max: 4.8 },
      cantidad: true,
      maxCantidad: 5,
    },
    {
      id: 'pagina',
      grupo: 'Para crecer',
      nombre: 'Página o sección extra',
      descripcion: 'Sumás páginas: catálogo, blog, preguntas frecuentes.',
      alta: { min: 30, max: 54 },
      abono: NONE,
      cantidad: true,
      maxCantidad: 5,
    },
    {
      id: 'contenido',
      grupo: 'Para crecer',
      nombre: 'Carga de contenido',
      descripcion: 'Nos ocupamos de cargar tus textos, fotos y datos.',
      alta: { min: 24, max: 42 },
      abono: NONE,
      cantidad: false,
    },
  ],
}

function formatNumber(n: number) {
  return n.toLocaleString('es-AR', {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

function formatAmount(n: number) {
  return `US$ ${formatNumber(n)}`
}

/** Un rango está definido cuando el equipo cargó al menos un extremo en PRICING. */
function hasPrice(range: Money) {
  return range.min !== null || range.max !== null
}

/**
 * Texto del rango, o `null` si todavía no hay números.
 * Devolver `null` (en vez de un placeholder crudo) deja que cada lugar de la UI
 * elija cómo se ve el estado "a definir".
 */
function formatRange(range: Money): string | null {
  if (!hasPrice(range)) return null
  if (range.min !== null && range.max !== null && range.min !== range.max) {
    return `US$ ${formatNumber(range.min)}–${formatNumber(range.max)}`
  }
  return formatAmount((range.min ?? range.max) as number)
}

function scale(range: Money, qty: number): Money {
  return {
    min: range.min === null ? null : range.min * qty,
    max: range.max === null ? null : range.max * qty,
  }
}

/** Precio para el mail y el WhatsApp: cuando no hay números, se manda el estado cualitativo. */
function rangeForEmail(range: Money) {
  return formatRange(range) ?? 'a cotizar según alcance'
}

type Selection = Record<string, number> // addonId -> cantidad (0 = no seleccionado)

const STORAGE_KEY = 'zetro_pricing_selection'

// la selección vive en localStorage, no en useState: leerla al renderizar rompe la hidratación,
// y restaurarla en un effect dispara un render en cascada. useSyncExternalStore hace las dos cosas bien.
const empty: Selection = {}
const listeners = new Set<() => void>()

let cached: Selection = empty
let cachedFromStorage = false

function parseSelection(raw: string | null): Selection {
  if (!raw) return empty
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Selection) : empty
  } catch {
    return empty
  }
}

function readSelection(): Selection {
  if (!cachedFromStorage) {
    try {
      cached = parseSelection(window.localStorage.getItem(STORAGE_KEY))
    } catch {
      cached = empty
    }
    cachedFromStorage = true
  }
  return cached
}

function serverSelection(): Selection {
  return empty
}

function subscribeSelection(onChange: () => void) {
  const fromAnotherTab = () => {
    cachedFromStorage = false
    onChange()
  }
  listeners.add(onChange)
  window.addEventListener('storage', fromAnotherTab)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', fromAnotherTab)
  }
}

function writeSelection(next: Selection) {
  cached = next
  cachedFromStorage = true
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // localStorage no disponible: la selección simplemente no persiste
  }
  for (const listener of listeners) listener()
}

/** Suma rangos; un ítem sin precio no aporta (queda "a cotizar" en su propia fila). */
function sumRange(ranges: Money[]): Money {
  return ranges.reduce<Money>(
    (acc, r) => ({
      min: (acc.min ?? 0) + (r.min ?? 0),
      max: (acc.max ?? 0) + (r.max ?? 0),
    }),
    { min: 0, max: 0 },
  )
}

/** Fila del resumen: concepto a la izquierda, monto (o estado) a la derecha. */
function SummaryLine({ label, detail, value }: { label: string; detail?: string; value: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-[0.875rem] text-paper/75">
        {label}
        {detail ? <span className="text-paper/45"> {detail}</span> : null}
      </span>
      <span className={`shrink-0 text-[0.875rem] tnum ${value ? 'text-paper' : 'text-paper/45'}`}>
        {value ?? 'a cotizar'}
      </span>
    </div>
  )
}

/** Columnas de precio alineadas: en pantallas chicas se apilan debajo de la descripción. */
function Prices({ alta, abono }: { alta: string | null; abono: string | null }) {
  const cell = (label: string, value: string | null) => (
    <div className="sm:w-32 sm:text-right">
      <span className="text-[0.75rem] text-ink-4 sm:hidden">{label} </span>
      <span className={`text-[0.9375rem] tnum ${value ? 'font-medium text-ink' : 'text-ink-4'}`}>{value ?? '—'}</span>
    </div>
  )
  if (!alta && !abono) {
    return <p className="mt-2 text-[0.8125rem] text-ink-4 sm:mt-0 sm:w-[17.5rem] sm:text-right">a cotizar</p>
  }
  return (
    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-0.5 sm:mt-0 sm:flex-nowrap sm:gap-6">
      {cell('Alta', alta)}
      {cell('Abono/mes', abono)}
    </div>
  )
}

export function PricingBuilder() {
  const selection = useSyncExternalStore(subscribeSelection, readSelection, serverSelection)
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [failure, setFailure] = useState<string | null>(null)
  const formId = useId()

  // se lee del store y no de `selection`: dos toggles en el mismo tick comparten
  // el valor del render y el segundo pisaría al primero.
  function toggle(addon: Addon) {
    const next = { ...readSelection() }
    if ((next[addon.id] ?? 0) > 0) delete next[addon.id]
    else next[addon.id] = 1
    writeSelection(next)
  }

  function setCantidad(addon: Addon, cantidad: number) {
    const max = addon.maxCantidad ?? 5
    writeSelection({
      ...readSelection(),
      [addon.id]: Math.min(Math.max(cantidad, 1), max),
    })
  }

  const activeAddons = PRICING.agregados.filter((a) => (selection[a.id] ?? 0) > 0)

  const totalOnce = sumRange([PRICING.base.alta, ...activeAddons.map((a) => scale(a.alta, selection[a.id] ?? 1))])
  const totalMonthly = sumRange([PRICING.base.abono, ...activeAddons.map((a) => scale(a.abono, selection[a.id] ?? 1))])
  const totalOnceLabel = formatRange(totalOnce)
  const totalMonthlyLabel = formatRange(totalMonthly)

  const summaryLines = activeAddons.map((a) => {
    const qty = selection[a.id] ?? 1
    return a.cantidad ? `${a.nombre} ×${qty}` : a.nombre
  })

  const budgetBody = [
    'Quiero pedir el presupuesto exacto para mi negocio.',
    '',
    'Agregados seleccionados:',
    ...(summaryLines.length ? summaryLines.map((l) => `- ${l}`) : ['- Ninguno, solo el sitio web']),
    '',
    `Alta estimada (pago único): ${rangeForEmail(totalOnce)}`,
    `Abono mensual estimado: ${rangeForEmail(totalMonthly)}`,
  ].join('\n')

  const whatsappHref = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(budgetBody)}`
    : null

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFailure(null)

    const form = new FormData(event.currentTarget)

    if (form.get('company_website')) {
      setSent(true)
      return
    }

    const parsed = contactSchema.safeParse({
      name: form.get('name'),
      email: form.get('email'),
      phone: form.get('phone') || undefined,
      message: form.get('message') || undefined,
    })

    if (!parsed.success) {
      const next: ContactErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactErrors
        if (!next[key]) next[key] = issue.message
      }
      setErrors(next)
      return
    }

    setErrors({})
    setPending(true)

    const result = await postJson<{ ok: true }>('/api/public/leads', {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message ? `${budgetBody}\n\n${parsed.data.message}` : budgetBody,
      source_path: window.location.pathname,
      meta: {
        selection: summaryLines,
        once: formatRange(totalOnce),
        monthly: formatRange(totalMonthly),
      },
    })

    setPending(false)
    if (result.ok) setSent(true)
    else setFailure(result.error.message)
  }

  const baseLabel = formatRange(PRICING.base.alta)
  const baseAbonoLabel = formatRange(PRICING.base.abono)

  return (
    <div className="space-y-3">
      <div className="grid gap-px overflow-hidden rounded-md border border-n-200 bg-n-200 lg:grid-cols-12">
        {/* Izquierda — una sola lista: sitio base fijo + agregados, con las columnas de precio alineadas */}
        <div className="bg-surface lg:col-span-8">
          <div className="flex items-end justify-between gap-4 border-b border-n-200 px-5 py-4 sm:px-6">
            <div>
              <p className="text-xs leading-none tracking-[0.06em] uppercase font-medium text-ink-4">Paso 1</p>
              <h3 className="mt-2 text-lg font-medium text-ink">Elegí qué necesitás</h3>
            </div>
            <div className="hidden shrink-0 gap-6 text-right text-xs leading-none tracking-[0.06em] uppercase font-medium text-ink-4 sm:flex">
              <span className="w-32">Alta · una vez</span>
              <span className="w-32">Abono · por mes</span>
            </div>
          </div>

          <ul className="divide-y divide-n-200">
            {/* Base: siempre incluida */}
            <li className="bg-paper-2/60 px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border border-ink bg-ink text-paper"
                >
                  <Check className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1 sm:grid sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6">
                  <div>
                    <p className="text-[0.9375rem] font-medium text-ink">
                      {PRICING.base.nombre}{' '}
                      <span className="ml-1 rounded-sm bg-brand-soft px-1.5 py-0.5 align-middle text-[0.6875rem] font-medium text-brand-strong">
                        Siempre incluido
                      </span>
                    </p>
                    <p className="mt-1 text-[0.8125rem] leading-[1.45] text-ink-3 text-pretty">
                      Diseño a medida, versión para celular, formulario de contacto, carga de contenidos inicial,
                      publicación y dominio configurado.
                    </p>
                  </div>
                  <Prices alta={baseLabel} abono={baseAbonoLabel} />
                </div>
              </div>
            </li>

            {PRICING.agregados.map((addon, index) => {
              const active = (selection[addon.id] ?? 0) > 0
              const newGroup = addon.grupo !== PRICING.agregados[index - 1]?.grupo
              const qty = selection[addon.id] ?? 1
              return (
                <li key={addon.id}>
                  {newGroup ? (
                    <p className="border-b border-n-200 bg-paper-2/60 px-5 py-2 text-[0.6875rem] leading-none tracking-[0.08em] uppercase font-medium text-ink-3 sm:px-6">
                      {addon.grupo}
                    </p>
                  ) : null}
                  <div
                    role="checkbox"
                    tabIndex={0}
                    aria-checked={active}
                    onClick={() => toggle(addon)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggle(addon)
                      }
                    }}
                    className={`flex cursor-pointer items-start gap-3 px-5 py-4 transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand sm:px-6 ${
                      active ? 'bg-brand-soft/60' : 'hover:bg-n-100/60'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                        active ? 'border-brand bg-brand text-paper' : 'border-n-300 bg-surface'
                      }`}
                    >
                      {active ? <Check className="size-3.5" /> : null}
                    </span>
                    <div className="min-w-0 flex-1 sm:grid sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6">
                      <div>
                        <p className="text-[0.9375rem] font-medium text-ink">{addon.nombre}</p>
                        <p className="mt-1 text-[0.8125rem] leading-[1.45] text-ink-3 text-pretty">
                          {addon.descripcion}
                        </p>
                        {addon.cantidad && active ? (
                          <div
                            className="mt-2 flex w-fit items-center gap-1 rounded-sm border border-n-300 bg-surface px-1"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              aria-label={`Restar ${addon.nombre}`}
                              onClick={() => setCantidad(addon, qty - 1)}
                              disabled={qty <= 1}
                              className="flex size-7 items-center justify-center text-ink-2 disabled:opacity-40"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="min-w-5 text-center text-sm tnum text-ink">{qty}</span>
                            <button
                              type="button"
                              aria-label={`Sumar ${addon.nombre}`}
                              onClick={() => setCantidad(addon, qty + 1)}
                              disabled={qty >= (addon.maxCantidad ?? 5)}
                              className="flex size-7 items-center justify-center text-ink-2 disabled:opacity-40"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                      <Prices alta={formatRange(addon.alta)} abono={formatRange(addon.abono)} />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <p className="border-t border-n-200 px-5 py-3 text-[0.8125rem] text-ink-3 text-pretty sm:px-6">
            El rango depende de la cantidad de secciones, del contenido que ya tengas y de la complejidad del diseño.
          </p>
        </div>

        {/* Derecha — resumen y totales. Oscuro para que sea el punto focal y lleve el CTA. */}
        <div className="bg-ink p-5 text-paper sm:p-6 lg:col-span-4">
          <div className="flex flex-col lg:sticky lg:top-24">
            <p className="text-xs leading-none tracking-[0.06em] uppercase font-medium text-paper/50">Tu presupuesto</p>

            <div aria-live="polite" className="mt-4">
              <dl className="space-y-5">
                <div>
                  <dt className="text-[0.8125rem] text-paper/60">Alta · pago único</dt>
                  <dd className="mt-1.5 text-[2rem] leading-none tracking-[-0.025em] font-semibold tnum">
                    {totalOnceLabel}
                  </dd>
                </div>
                <div className="border-t border-paper/15 pt-5">
                  <dt className="text-[0.8125rem] text-paper/60">Abono · por mes</dt>
                  <dd className="mt-1.5 text-[2rem] leading-none tracking-[-0.025em] font-semibold tnum">
                    {totalMonthlyLabel}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 divide-y divide-paper/10 border-y border-paper/15">
                <SummaryLine label="Sitio web" value={baseLabel} />
                {activeAddons.map((addon) => {
                  const qty = selection[addon.id] ?? 1
                  return (
                    <SummaryLine
                      key={addon.id}
                      label={addon.nombre}
                      detail={addon.cantidad ? `×${qty}` : undefined}
                      value={formatRange(scale(addon.alta, qty))}
                    />
                  )
                })}
              </div>
              {activeAddons.length === 0 ? (
                <p className="mt-2 text-[0.8125rem] text-paper/50">Sumá agregados y mirá cómo cambia el total.</p>
              ) : null}
            </div>

            <Button
              size="lg"
              className="mt-6 w-full bg-paper text-ink hover:bg-paper/90"
              onClick={() =>
                document.getElementById(`${formId}-request`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            >
              Pedir presupuesto exacto
              <ArrowRight />
            </Button>
            <p className="mt-3 text-xs leading-[1.45] text-paper/50 text-pretty">
              Sin compromiso. Precios en dólares: es una estimación y el final sale después de entender qué necesitás.
            </p>
          </div>
        </div>

        {/* Pedido del presupuesto exacto — fila a ancho completo dentro de la misma tarjeta,
            para que el total y el pedido se lean como un solo paso. */}
        <div id={`${formId}-request`} className="scroll-mt-28 bg-surface p-5 sm:p-6 lg:col-span-12">
          {sent ? (
            <Alert className="border-l-ok">
              <CircleCheckBig className="text-ok" />
              <AlertTitle>Nos llegó tu pedido</AlertTitle>
              <AlertDescription>Te mandamos una copia por mail y te respondemos en el día hábil.</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <div>
                <p className="text-xs leading-none tracking-[0.06em] uppercase font-medium text-ink-4">Paso 2</p>
                <h3 className="mt-2 text-lg font-medium text-ink">Recibí el presupuesto exacto</h3>
                <p className="mt-1 text-[0.9375rem] text-ink-3">
                  Dejanos tus datos y te lo mandamos con esta configuración. Te respondemos en el día hábil.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <ContactField id={`${formId}-name`} label="Nombre" error={errors.name}>
                  <Input
                    id={`${formId}-name`}
                    name="name"
                    autoComplete="name"
                    placeholder="Camila Duarte"
                    aria-invalid={!!errors.name}
                  />
                </ContactField>
                <ContactField id={`${formId}-email`} label="Email" error={errors.email}>
                  <Input
                    id={`${formId}-email`}
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="camila@barchelo.com.ar"
                    aria-invalid={!!errors.email}
                  />
                </ContactField>
                <ContactField id={`${formId}-phone`} label="WhatsApp (opcional)" error={errors.phone}>
                  <Input
                    id={`${formId}-phone`}
                    name="phone"
                    autoComplete="tel"
                    placeholder="11 5566 7788"
                    aria-invalid={!!errors.phone}
                  />
                </ContactField>
              </div>

              <ContactField
                id={`${formId}-message`}
                label="Algo que quieras contarnos (opcional)"
                error={errors.message}
              >
                <Textarea
                  id={`${formId}-message`}
                  name="message"
                  rows={3}
                  placeholder="Tenemos dos locales y queremos reservas en los dos."
                />
              </ContactField>

              <div className="absolute h-px w-px overflow-hidden" style={{ clip: 'rect(0,0,0,0)' }} aria-hidden="true">
                <label htmlFor={`${formId}-company_website`}>No completar este campo</label>
                <input
                  id={`${formId}-company_website`}
                  name="company_website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {failure ? <p className="text-[0.9375rem] text-err">{failure}</p> : null}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" size="lg" disabled={pending}>
                  {pending ? <Loader2 className="animate-spin" /> : null}
                  Pedir presupuesto exacto
                </Button>
                {whatsappHref ? (
                  <Button asChild variant="outline" size="lg">
                    <a href={whatsappHref} target="_blank" rel="noreferrer">
                      Por WhatsApp
                    </a>
                  </Button>
                ) : null}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Proyecto completo — barra compacta, fuera del armador */}
      <div className="rounded-md border border-n-200 bg-ink p-5 text-paper sm:p-6 lg:flex lg:items-center lg:justify-between lg:gap-6">
        <div className="max-w-xl">
          <h3 className="text-lg font-medium">Proyecto completo</h3>
          <p className="mt-1.5 text-[0.875rem] leading-[1.5] text-paper/80 text-pretty">
            Sitio, panel de gestión, mantenimiento y todo lo que tu negocio necesite, trabajado como un solo proyecto a
            largo plazo. Cuando el proyecto es integral, el precio no sale de una lista: sale de entender tu negocio.
          </p>
        </div>
        <div className="mt-4 flex shrink-0 flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4 lg:mt-0">
          <p className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-paper/90">Lo armamos con vos</p>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-paper/30 bg-transparent text-paper hover:bg-paper/10"
          >
            <Link href="/contacto">Hablemos de tu proyecto</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function ContactField({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-err">{error}</p> : null}
    </div>
  )
}
