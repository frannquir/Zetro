'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CONTACT_EMAIL = 'contacto@zetro.app'
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

function loadSelection(): Selection {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed as Selection
    return {}
  } catch {
    return {}
  }
}

function saveSelection(selection: Selection) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selection))
  } catch {
    // localStorage no disponible: la selección simplemente no persiste
  }
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
  const [selection, setSelection] = useState<Selection>(loadSelection)

  useEffect(() => {
    saveSelection(selection)
  }, [selection])

  function toggle(addon: Addon) {
    setSelection((prev) => {
      const active = (prev[addon.id] ?? 0) > 0
      const next = { ...prev }
      if (active) delete next[addon.id]
      else next[addon.id] = 1
      return next
    })
  }

  function setCantidad(addon: Addon, cantidad: number) {
    const max = addon.maxCantidad ?? 5
    const clamped = Math.min(Math.max(cantidad, 1), max)
    setSelection((prev) => ({ ...prev, [addon.id]: clamped }))
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

  const budgetSubject = `Presupuesto - consulta`
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

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(budgetSubject)}&body=${encodeURIComponent(budgetBody)}`
  const whatsappHref = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(budgetBody)}`
    : null

  return (
    <div className="space-y-8">
      {/* Bloque 1 — Punto de partida */}
      <div className="rounded-md border border-n-200 bg-surface p-6 sm:p-8">
        <h3 className="text-lg font-medium text-ink">Todo arranca con tu sitio web</h3>
        <p className="mt-3 text-2xl leading-none tracking-[-0.02em] font-semibold tnum text-ink sm:text-3xl">
          Desde {formatMoney(PRICING.base.min)} a {formatMoney(PRICING.base.max)}
        </p>
        <p className="text-[0.8125rem] text-ink-3">pago único · [[PENDIENTE: definir tratamiento de IVA]]</p>

        <ul className="mt-5 grid gap-2.5 text-[0.9375rem] sm:grid-cols-2">
          {[
            'Diseño a medida',
            'Versión para celular',
            'Formulario de contacto',
            'Carga de contenidos inicial',
            'Publicación y dominio configurado',
          ].map((item) => (
            <li key={item} className="flex gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-brand" />
              <span className="text-ink-2">{item}</span>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-[0.9375rem] text-ink-3 text-pretty">
          El rango depende de la cantidad de secciones, del contenido que ya tengas y de la complejidad del diseño.
          Te pasamos el número exacto después de charlar 15 minutos.
        </p>
      </div>

      {/* Bloque 2 — Armador */}
      <div>
        <h3 className="text-lg font-medium text-ink">Armá tu presupuesto</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                className={`cursor-pointer rounded-md border p-5 text-left transition-colors duration-150 ${
                  active ? 'border-brand bg-brand-soft' : 'border-n-200 bg-surface hover:bg-n-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{addon.nombre}</p>
                    <p className="mt-1 text-[0.875rem] text-ink-2 text-pretty">{addon.descripcion}</p>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`flex size-5 shrink-0 items-center justify-center rounded-sm border ${
                      active ? 'border-brand bg-brand text-paper' : 'border-n-300 bg-surface'
                    }`}
                  >
                    {active ? <Check className="size-3.5" /> : null}
                  </span>
                </div>

                <p className="mt-3 text-[0.9375rem] font-medium tnum text-ink">
                  {formatRange(addon.precio)} <span className="font-normal text-ink-4">· {addon.unidad}</span>
                </p>

                {addon.cantidad ? (
                  <div
                    className="mt-3 overflow-hidden transition-[max-height] duration-200 ease-out"
                    style={{ maxHeight: active ? '48px' : '0px' }}
                  >
                    <div
                      className="flex w-fit items-center gap-3 rounded-sm border border-n-300 px-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        aria-label={`Restar ${addon.nombre}`}
                        onClick={() => setCantidad(addon, qty - 1)}
                        disabled={qty <= 1}
                        className="flex size-8 items-center justify-center text-ink-2 disabled:opacity-40"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="min-w-4 text-center text-sm tnum text-ink">{qty}</span>
                      <button
                        type="button"
                        aria-label={`Sumar ${addon.nombre}`}
                        onClick={() => setCantidad(addon, qty + 1)}
                        disabled={qty >= (addon.maxCantidad ?? 5)}
                        className="flex size-8 items-center justify-center text-ink-2 disabled:opacity-40"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
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

          <div className="flex flex-wrap gap-2">
            {whatsappHref ? (
              <Button asChild variant="outline" size="lg">
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  Por WhatsApp
                </a>
              </Button>
            ) : null}
            <Button asChild size="lg">
              <a href={mailtoHref}>Pedir presupuesto exacto</a>
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-4">
          Es una estimación para que te hagas una idea. Cada proyecto es distinto: el precio final sale después de
          entender qué necesitás.
        </p>
      </div>

      {/* Bloque 3 — Proyecto completo */}
      <div className="rounded-md border-2 border-brand bg-ink p-6 text-paper sm:p-8">
        <h3 className="text-lg font-medium">Proyecto completo</h3>
        <p className="mt-2 max-w-lg text-[0.9375rem] text-paper/80 text-pretty">
          Sitio, panel de gestión, mantenimiento y todo lo que tu negocio necesite, trabajado como un solo proyecto a
          largo plazo.
        </p>
        <p className="mt-4 text-xl font-semibold tracking-[-0.02em]">Lo armamos con vos</p>
        <p className="mt-2 text-[0.8125rem] text-paper/70 text-pretty">
          Cuando el proyecto es integral, el precio no sale de una lista: sale de entender tu negocio.
        </p>
        <Button asChild size="lg" variant="outline" className="mt-5 border-paper/30 bg-transparent text-paper hover:bg-paper/10">
          <Link href="/contacto">Hablemos de tu proyecto</Link>
        </Button>
      </div>
    </div>
  )
}
