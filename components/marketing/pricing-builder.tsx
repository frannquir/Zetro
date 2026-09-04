'use client'

import { useId, useMemo, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Check, CircleCheckBig, Loader2, Minus, Plus } from 'lucide-react'
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
  nombre: string
  descripcion: string
  unidad: 'pago único' | 'por mes' | 'por sección'
  precio: Money
  cantidad: boolean
  maxCantidad?: number
}

// Todos los montos viven acá. [[PENDIENTE]] = valor no confirmado por el equipo.
// [[PENDIENTE: definir tratamiento de IVA]] — cuando se defina, sumarlo a la nota del punto de partida.
const PRICING: {
  moneda: 'ARS'
  base: Money & { unidad: 'pago único' }
  agregados: Addon[]
} = {
  moneda: 'ARS',
  base: { min: null, max: null, unidad: 'pago único' },
  agregados: [
    {
      id: 'panel',
      nombre: 'Panel de gestión',
      descripcion: 'Cambiás textos, fotos y precios vos mismo, sin depender de nadie.',
      unidad: 'pago único',
      precio: { min: null, max: null },
      cantidad: false,
    },
    {
      id: 'mantenimiento',
      nombre: 'Mantenimiento mensual',
      descripcion: 'Nos ocupamos de que el sitio siga funcionando. Ver definición abajo.',
      unidad: 'por mes',
      precio: { min: null, max: null },
      cantidad: false,
    },
    {
      id: 'secciones',
      nombre: 'Secciones adicionales',
      descripcion: 'Sumás páginas: catálogo, sucursales, blog, preguntas frecuentes.',
      unidad: 'por sección',
      precio: { min: null, max: null },
      cantidad: true,
      maxCantidad: 5,
    },
    {
      id: 'turnos',
      nombre: 'Turnos o reservas online',
      descripcion: 'Tus clientes reservan sin escribirte.',
      unidad: 'pago único',
      precio: { min: null, max: null },
      cantidad: false,
    },
    {
      id: 'tienda',
      nombre: 'Tienda / catálogo con precios',
      descripcion: 'Mostrás productos y precios actualizados.',
      unidad: 'pago único',
      precio: { min: null, max: null },
      cantidad: false,
    },
    {
      id: 'seo',
      nombre: 'SEO local',
      descripcion: 'Que te encuentren cuando buscan tu rubro en tu ciudad.',
      unidad: 'pago único',
      precio: { min: null, max: null },
      cantidad: false,
    },
  ],
}

const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

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
    return `${money.format(range.min)} — ${money.format(range.max)}`
  }
  return money.format((range.min ?? range.max) as number)
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

function sumRange(ranges: Money[]): Money {
  return ranges.reduce<Money>(
    (acc, r) => ({
      min: acc.min === null || r.min === null ? null : acc.min + r.min,
      max: acc.max === null || r.max === null ? null : acc.max + r.max,
    }),
    { min: 0, max: 0 },
  )
}

/** Fila del resumen: concepto a la izquierda, monto (o estado) a la derecha. */
function SummaryLine({ label, detail, value }: { label: string; detail?: string; value: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-[0.875rem] text-ink-2">
        {label}
        {detail ? <span className="text-ink-4"> {detail}</span> : null}
      </span>
      <span className={`shrink-0 text-[0.875rem] tnum ${value ? 'text-ink' : 'text-ink-4'}`}>
        {value ?? 'a definir'}
      </span>
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
    writeSelection({ ...readSelection(), [addon.id]: Math.min(Math.max(cantidad, 1), max) })
  }

  const activeAddons = PRICING.agregados.filter((a) => (selection[a.id] ?? 0) > 0)
  const mantenimientoActivo = (selection.mantenimiento ?? 0) > 0

  const oneTimeRanges = useMemo(
    () => [
      { min: PRICING.base.min, max: PRICING.base.max },
      ...activeAddons
        .filter((a) => a.unidad !== 'por mes')
        .map((a) => {
          const qty = selection[a.id] ?? 1
          return {
            min: a.precio.min === null ? null : a.precio.min * qty,
            max: a.precio.max === null ? null : a.precio.max * qty,
          }
        }),
    ],
    [activeAddons, selection],
  )

  const monthlyRanges = useMemo(
    () =>
      activeAddons
        .filter((a) => a.unidad === 'por mes')
        .map((a) => ({ min: a.precio.min, max: a.precio.max })),
    [activeAddons],
  )

  const totalOnce = sumRange(oneTimeRanges)
  const totalMonthly = sumRange(monthlyRanges)
  const totalOnceLabel = formatRange(totalOnce)
  const totalMonthlyLabel = formatRange(totalMonthly)
  const oneTimeAddons = activeAddons.filter((a) => a.unidad !== 'por mes').length

  const summaryLines = activeAddons.map((a) => {
    const qty = selection[a.id] ?? 1
    return a.cantidad ? `${a.nombre} ×${qty}` : a.nombre
  })

  const budgetBody = [
    'Quiero pedir el presupuesto exacto para mi negocio.',
    '',
    'Agregados seleccionados:',
    ...(summaryLines.length ? summaryLines.map((l) => `- ${l}`) : ['- Ninguno, solo el sitio base']),
    '',
    `Inversión inicial estimada: ${rangeForEmail(totalOnce)}`,
    mantenimientoActivo ? `Mensual estimado: ${rangeForEmail(totalMonthly)}` : '',
  ]
    .filter(Boolean)
    .join('\n')

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
        monthly: mantenimientoActivo ? formatRange(totalMonthly) : null,
      },
    })

    setPending(false)
    if (result.ok) setSent(true)
    else setFailure(result.error.message)
  }

  const baseLabel = formatRange({ min: PRICING.base.min, max: PRICING.base.max })

  return (
    <div className="space-y-3">
      {/* Armador + resumen: un solo bloque en dos columnas. El total vive al lado de la
          selección, así queda siempre a la vista sin necesidad de nada pegajoso. */}
      <div className="grid gap-px overflow-hidden rounded-md border border-n-200 bg-n-200 lg:grid-cols-12">
        {/* Columna izquierda — punto de partida + agregados */}
        <div className="bg-surface p-5 sm:p-6 lg:col-span-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <div>
              <p className="text-xs leading-none tracking-[0.06em] uppercase font-medium text-ink-4">
                Punto de partida
              </p>
              <h3 className="mt-2 text-lg font-medium text-ink">Todo arranca con tu sitio web</h3>
            </div>
            <div className="sm:text-right">
              {baseLabel ? (
                <p className="text-2xl leading-none tracking-[-0.02em] font-semibold tnum text-ink">{baseLabel}</p>
              ) : (
                <p className="text-[0.9375rem] font-medium text-ink">Se cotiza según alcance</p>
              )}
              <p className="mt-1 text-[0.8125rem] text-ink-3">{PRICING.base.unidad}</p>
            </div>
          </div>

          <ul className="mt-4 grid gap-x-6 gap-y-1.5 text-[0.875rem] sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Diseño a medida',
              'Versión para celular',
              'Formulario de contacto',
              'Carga de contenidos inicial',
              'Publicación y dominio configurado',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="mt-0.5 size-3.5 shrink-0 text-brand" />
                <span className="text-ink-2">{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-[0.8125rem] text-ink-3 text-pretty">
            El rango depende de la cantidad de secciones, del contenido que ya tengas y de la complejidad del diseño.
            Te pasamos el número exacto después de charlar 15 minutos.
          </p>

          <div className="mt-5 border-t border-n-200 pt-5">
            <h3 className="text-lg font-medium text-ink">Armá tu presupuesto</h3>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {PRICING.agregados.map((addon) => {
                const active = (selection[addon.id] ?? 0) > 0
                const qty = selection[addon.id] ?? 1
                const precio = formatRange(addon.precio)
                return (
                  <div
                    key={addon.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={active}
                    onClick={() => toggle(addon)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggle(addon)
                      }
                    }}
                    className={`cursor-pointer rounded-sm border p-3 text-left transition-colors duration-150 ${
                      active ? 'border-brand bg-brand-soft' : 'border-n-200 bg-surface hover:bg-n-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[0.9375rem] font-medium text-ink">{addon.nombre}</p>
                      <span
                        aria-hidden="true"
                        className={`flex size-5 shrink-0 items-center justify-center rounded-sm border ${
                          active ? 'border-brand bg-brand text-paper' : 'border-n-300 bg-surface'
                        }`}
                      >
                        {active ? <Check className="size-3.5" /> : null}
                      </span>
                    </div>
                    <p className="mt-1 text-[0.8125rem] leading-[1.45] text-ink-2 text-pretty">{addon.descripcion}</p>

                    <p className="mt-2 text-[0.8125rem] tnum">
                      {precio ? (
                        <>
                          <span className="font-medium text-ink">{precio}</span>{' '}
                          <span className="text-ink-4">· {addon.unidad}</span>
                        </>
                      ) : (
                        <span className="text-ink-4">{addon.unidad}</span>
                      )}
                    </p>

                    {addon.cantidad ? (
                      <div
                        className="overflow-hidden transition-[max-height] duration-200 ease-out"
                        style={{ maxHeight: active ? '40px' : '0px' }}
                      >
                        <div
                          className="mt-2 flex w-fit items-center gap-2 rounded-sm border border-n-300 bg-surface px-1"
                          onClick={(e) => e.stopPropagation()}
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
                          <span className="min-w-4 text-center text-sm tnum text-ink">{qty}</span>
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
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Columna derecha — resumen y total. Sin sticky: acompaña a la selección por layout. */}
        <div className="flex flex-col bg-paper-2 p-5 sm:p-6 lg:col-span-4">
          <p className="text-xs leading-none tracking-[0.06em] uppercase font-medium text-ink-4">Tu presupuesto</p>

          <div aria-live="polite" className="mt-4 flex-1">
            <div className="divide-y divide-n-200 border-y border-n-200">
              <SummaryLine label="Sitio base" value={baseLabel} />
              {activeAddons.map((addon) => {
                const qty = selection[addon.id] ?? 1
                const precio = formatRange({
                  min: addon.precio.min === null ? null : addon.precio.min * qty,
                  max: addon.precio.max === null ? null : addon.precio.max * qty,
                })
                return (
                  <SummaryLine
                    key={addon.id}
                    label={addon.nombre}
                    detail={addon.cantidad ? `×${qty}` : undefined}
                    value={precio}
                  />
                )
              })}
              {activeAddons.length === 0 ? (
                <p className="py-1.5 text-[0.8125rem] text-ink-4">Sin agregados. Elegí lo que necesites.</p>
              ) : null}
            </div>

            <div className="mt-4">
              <p className="text-[0.8125rem] text-ink-3">Inversión inicial</p>
              {totalOnceLabel ? (
                <p className="mt-1 text-[1.75rem] leading-none tracking-[-0.02em] font-semibold tnum text-ink">
                  {totalOnceLabel}
                </p>
              ) : (
                <p className="mt-1 text-[1.25rem] leading-[1.2] tracking-[-0.02em] font-semibold text-ink text-balance">
                  Se cotiza según alcance
                </p>
              )}
              <p className="mt-1 text-[0.8125rem] text-ink-4">
                {oneTimeAddons > 0
                  ? `Sitio base + ${oneTimeAddons} agregado${oneTimeAddons > 1 ? 's' : ''} · pago único`
                  : 'Solo el sitio base · pago único'}
              </p>

              {mantenimientoActivo ? (
                <div className="mt-3 border-t border-n-200 pt-3">
                  <p className="text-[0.8125rem] text-ink-3">Mensual</p>
                  <p
                    className={`mt-1 tnum ${
                      totalMonthlyLabel
                        ? 'text-lg font-semibold tracking-[-0.02em] text-ink'
                        : 'text-[0.9375rem] font-medium text-ink'
                    }`}
                  >
                    {totalMonthlyLabel ?? 'Se cotiza según alcance'}
                  </p>
                  <p className="mt-1 text-[0.8125rem] text-ink-4">Mantenimiento mensual · por mes</p>
                </div>
              ) : null}
            </div>
          </div>

          <p className="mt-5 text-xs leading-[1.45] text-ink-4 text-pretty">
            Es una estimación para que te hagas una idea. Cada proyecto es distinto: el precio final sale después de
            entender qué necesitás.
          </p>
        </div>

        {/* Pedido del presupuesto exacto — fila a ancho completo dentro de la misma tarjeta,
            para que el total y el pedido se lean como un solo paso. */}
        <div className="bg-surface p-5 sm:p-6 lg:col-span-12">
        {sent ? (
          <Alert className="border-l-ok">
            <CircleCheckBig className="text-ok" />
            <AlertTitle>Nos llegó tu pedido</AlertTitle>
            <AlertDescription>
              Te mandamos una copia por mail y te respondemos en el día hábil.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <p className="text-[0.9375rem] text-ink-2">
              Dejanos tus datos y te mandamos el presupuesto exacto con esta configuración.
            </p>

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

            <ContactField id={`${formId}-message`} label="Algo que quieras contarnos (opcional)" error={errors.message}>
              <Textarea
                id={`${formId}-message`}
                name="message"
                rows={3}
                placeholder="Tenemos dos locales y queremos reservas en los dos."
              />
            </ContactField>

            <div className="absolute h-px w-px overflow-hidden" style={{ clip: 'rect(0,0,0,0)' }} aria-hidden="true">
              <label htmlFor={`${formId}-company_website`}>No completar este campo</label>
              <input id={`${formId}-company_website`} name="company_website" type="text" tabIndex={-1} autoComplete="off" />
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
            Sitio, panel de gestión, mantenimiento y todo lo que tu negocio necesite, trabajado como un solo proyecto
            a largo plazo. Cuando el proyecto es integral, el precio no sale de una lista: sale de entender tu negocio.
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
