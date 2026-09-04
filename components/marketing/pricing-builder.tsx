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

function formatMoney(value: number | null) {
  return value === null ? '[[PENDIENTE: precio]]' : money.format(value)
}

function formatRange(range: Money) {
  if (range.min === null && range.max === null) return '[[PENDIENTE: precio]]'
  return `${formatMoney(range.min)} — ${formatMoney(range.max)}`
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

export function PricingBuilder() {
  const selection = useSyncExternalStore(subscribeSelection, readSelection, serverSelection)
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [failure, setFailure] = useState<string | null>(null)
  const formId = useId()

  function toggle(addon: Addon) {
    const next = { ...selection }
    if ((next[addon.id] ?? 0) > 0) delete next[addon.id]
    else next[addon.id] = 1
    writeSelection(next)
  }

  function setCantidad(addon: Addon, cantidad: number) {
    const max = addon.maxCantidad ?? 5
    writeSelection({ ...selection, [addon.id]: Math.min(Math.max(cantidad, 1), max) })
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
    `Inversión inicial estimada: ${formatRange(totalOnce)}`,
    mantenimientoActivo ? `Mensual estimado: ${formatRange(totalMonthly)}` : '',
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

  return (
    <div className="space-y-5">
      {/* Bloque 1 — Punto de partida */}
      <div className="rounded-md border border-n-200 bg-surface p-5 sm:p-6">
        <div className="sm:flex sm:items-start sm:justify-between sm:gap-8">
          <div className="sm:max-w-xs">
            <h3 className="text-lg font-medium text-ink">Todo arranca con tu sitio web</h3>
            <p className="mt-2 text-2xl leading-none tracking-[-0.02em] font-semibold tnum text-ink">
              Desde {formatMoney(PRICING.base.min)} a {formatMoney(PRICING.base.max)}
            </p>
            <p className="mt-1 text-[0.8125rem] text-ink-3">pago único · [[PENDIENTE: definir tratamiento de IVA]]</p>
          </div>

          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-2 text-[0.875rem] sm:mt-0 sm:shrink-0 lg:grid-cols-3">
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
        </div>

        <p className="mt-4 border-t border-n-200 pt-3 text-[0.8125rem] text-ink-3 text-pretty">
          El rango depende de la cantidad de secciones, del contenido que ya tengas y de la complejidad del diseño.
          Te pasamos el número exacto después de charlar 15 minutos.
        </p>
      </div>

      {/* Bloque 2 — Armador */}
      <div>
        <h3 className="text-lg font-medium text-ink">Armá tu presupuesto</h3>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {PRICING.agregados.map((addon) => {
            const active = (selection[addon.id] ?? 0) > 0
            const qty = selection[addon.id] ?? 1
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
                className={`cursor-pointer rounded-md border p-3.5 text-left transition-colors duration-150 ${
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
                <p className="mt-1 text-[0.8125rem] text-ink-2 text-pretty">{addon.descripcion}</p>

                <p className="mt-2 text-[0.8125rem] font-medium tnum text-ink">
                  {formatRange(addon.precio)} <span className="font-normal text-ink-4">· {addon.unidad}</span>
                </p>

                {addon.cantidad ? (
                  <div
                    className="overflow-hidden transition-[max-height] duration-200 ease-out"
                    style={{ maxHeight: active ? '40px' : '0px' }}
                  >
                    <div
                      className="mt-2 flex w-fit items-center gap-2 rounded-sm border border-n-300 px-1"
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

      {/* Bloque 3 — Proyecto completo */}
      <div className="rounded-md border-2 border-brand bg-ink p-5 text-paper sm:p-6">
        <div className="sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h3 className="text-lg font-medium">Proyecto completo</h3>
            <p className="mt-1.5 max-w-md text-[0.875rem] text-paper/80 text-pretty">
              Sitio, panel de gestión, mantenimiento y todo lo que tu negocio necesite, trabajado como un solo
              proyecto a largo plazo.
            </p>
          </div>
          <div className="mt-4 shrink-0 sm:mt-0 sm:text-right">
            <p className="text-lg font-semibold tracking-[-0.02em]">Lo armamos con vos</p>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="mt-2.5 border-paper/30 bg-transparent text-paper hover:bg-paper/10"
            >
              <Link href="/contacto">Hablemos de tu proyecto</Link>
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-paper/70 text-pretty">
          Cuando el proyecto es integral, el precio no sale de una lista: sale de entender tu negocio.
        </p>
      </div>

      {/* Resumen pegajoso */}
      <div
        aria-live="polite"
        className="sticky bottom-0 z-10 -mx-5 border-t border-n-200 bg-surface/95 px-5 py-4 backdrop-blur sm:mx-0 sm:rounded-md sm:border sm:px-6 lg:bottom-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[0.9375rem] tnum text-ink">
              Inversión inicial estimada: <span className="font-semibold">{formatRange(totalOnce)}</span>
            </p>
            {mantenimientoActivo ? (
              <p className="text-[0.9375rem] tnum text-ink">
                Mensual estimado: <span className="font-semibold">{formatRange(totalMonthly)}</span>
              </p>
            ) : null}
            {summaryLines.length ? (
              <p className="text-[0.8125rem] text-ink-3">{summaryLines.join(' · ')}</p>
            ) : (
              <p className="text-[0.8125rem] text-ink-3">Solo el sitio base, sin agregados.</p>
            )}
          </div>

        </div>

        {sent ? (
          <Alert className="mt-6 border-l-ok">
            <CircleCheckBig className="text-ok" />
            <AlertTitle>Nos llegó tu pedido</AlertTitle>
            <AlertDescription>
              Te mandamos una copia por mail y te respondemos en el día hábil.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4 border-t border-n-200 pt-6">
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

        <p className="mt-3 text-xs text-ink-4">
          Es una estimación para que te hagas una idea. Cada proyecto es distinto: el precio final sale después de
          entender qué necesitás.
        </p>
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
