'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'
import { useMediaQuery } from '@/lib/use-media-query'

type Step = { title: string; body: string; label: string }

const steps: Step[] = [
  {
    label: 'Charla',
    title: 'Charlamos media hora',
    body: 'Nos contás tu negocio. Salimos con alcance y precio cerrado.',
  },
  {
    label: 'Sitio',
    title: 'Armamos el sitio',
    body: 'Revisás una versión en línea antes de que la vea nadie más.',
  },
  {
    label: 'Panel',
    title: 'Conectamos el panel',
    body: 'Cargamos mesas y horarios. Te mostramos cómo se usa en 20 minutos.',
  },
  {
    label: 'Producción',
    title: 'Salimos a producción',
    body: 'Tu dominio, tu sitio, tus reservas. Lo mantenemos andando.',
  },
]

// Un segmento por paso + uno final para el cierre con los cuatro juntos.
const SEGMENTS = steps.length + 1
// vh de scroll dedicados a cada segmento dentro del riel pegado
const STEP_VH = 30

function two(n: number) {
  return String(n).padStart(2, '0')
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

/**
 * Visibilidad de un tramo según la posición del scroll (en segmentos). Llega a 1 en el centro del tramo
 * y se funde en los bordes, así un paso se va mientras entra el siguiente.
 */
function fade(pos: number, center: number) {
  return clamp01(1 - (Math.abs(pos - center) - 0.28) / 0.22)
}

/**
 * Riel de progreso. El relleno sigue al scroll de forma continua y toca cada punto
 * justo cuando su paso queda en el centro.
 */
function StepRail({ pos }: { pos: number }) {
  const filled = clamp01((pos - 0.5) / (steps.length - 1))
  const active = Math.min(Math.floor(pos), steps.length - 1)
  return (
    <div className="relative">
      {/* Los puntos son el centro de cada columna de la grilla: 12.5%, 37.5%, 62.5% y 87.5%.
          El riel se recorta a esos extremos para que el relleno caiga exacto sobre cada punto. */}
      <div className="pointer-events-none absolute inset-x-[12.5%] top-1.5 h-0.5" aria-hidden="true">
        <div className="absolute inset-0 bg-n-200" />
        <div
          className="absolute inset-y-0 left-0 w-full origin-left bg-brand will-change-transform"
          style={{ transform: `scaleX(${filled})` }}
        />
      </div>

      <ol aria-label="Pasos del proceso" className="relative grid grid-cols-4">
        {steps.map((s, index) => {
          const reached = pos >= index + 0.5 || index === 0
          const isActive = index === active && pos < steps.length
          return (
            <li key={s.label} className="flex flex-col items-center gap-2" aria-current={isActive ? 'step' : undefined}>
              <span
                aria-hidden="true"
                className={`block size-3 rounded-full border-2 transition-[transform,background-color,border-color,box-shadow] duration-300 ease-[var(--ease-out-quart)] ${
                  reached ? 'border-brand bg-brand' : 'border-n-300 bg-paper'
                } ${isActive ? 'scale-125 shadow-[0_0_0_6px_var(--brand-soft)]' : ''}`}
              />
              <span
                className={`text-xs transition-colors duration-300 ${isActive ? 'font-medium text-ink' : 'text-ink-3'}`}
              >
                {s.label}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** Versión estática: apilada, sin scroll pegado. Se usa en mobile y con prefers-reduced-motion. */
function StaticSteps() {
  return (
    <ol className="space-y-6">
      {steps.map((s, index) => (
        <li key={s.title} className="flex gap-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-brand text-sm font-semibold tnum text-ink">
            {index + 1}
          </span>
          <div className="space-y-1 pt-0.5">
            <p className="text-xs font-medium uppercase tracking-[0.06em] text-ink-4">{s.label}</p>
            <h3 className="font-medium text-ink">{s.title}</h3>
            <p className="text-[0.9375rem] leading-[1.55] text-ink-2 text-pretty">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/**
 * Un paso solo, en grande: numeral a la izquierda, texto a la derecha. Se desliza con el scroll;
 * el numeral se mueve más que el texto para dar profundidad.
 */
function SingleStep({ index, pos }: { index: number; pos: number }) {
  const step = steps[index]
  // El primer paso ya está a la vista al entrar en la sección: no se funde hacia arriba.
  const d = index === 0 ? Math.max(0, pos - 0.5) : pos - (index + 0.5)
  const opacity = fade(index + 0.5 + d, index + 0.5)
  return (
    <div
      aria-hidden={opacity < 0.5}
      className="grid gap-5 [grid-area:1/1] sm:grid-cols-12 sm:items-center sm:gap-8"
      style={{ opacity, visibility: opacity === 0 ? 'hidden' : undefined }}
    >
      <div className="sm:col-span-4 will-change-transform" style={{ transform: `translateY(${-d * 90}px)` }}>
        <p className="text-xs font-medium uppercase tracking-[0.06em] text-ink-4">{step.label}</p>
        <span className="mt-3 block text-[5rem] leading-[0.8] tracking-[-0.04em] font-semibold tnum text-brand lg:text-[6.5rem]">
          {two(index + 1)}
        </span>
      </div>
      <div
        className="sm:col-span-8 sm:border-l sm:border-n-200 sm:pl-8 will-change-transform"
        style={{ transform: `translateY(${-d * 40}px)` }}
      >
        <h3 className="text-[1.75rem] leading-[1.15] tracking-[-0.02em] font-semibold text-balance text-ink lg:text-[2rem]">
          {step.title}
        </h3>
        <p className="mt-3 max-w-lg text-[1.0625rem] leading-[1.55] text-ink-2 text-pretty lg:text-[1.125rem]">
          {step.body}
        </p>
      </div>
    </div>
  )
}

/** Cierre: los cuatro pasos a la vez, como índice editorial. Las filas entran escalonadas. */
function MergedSteps({ pos }: { pos: number }) {
  const t = clamp01((pos - (SEGMENTS - 1)) / 0.45)
  return (
    <ol
      aria-hidden={t < 0.5}
      className="divide-y divide-n-200 border-y border-n-200 [grid-area:1/1]"
      style={{ visibility: t === 0 ? 'hidden' : undefined }}
    >
      {steps.map((s, index) => {
        const row = clamp01(t * 1.6 - index * 0.2)
        return (
          <li
            key={s.title}
            className="grid grid-cols-12 items-baseline gap-x-4 gap-y-1 py-4 will-change-transform"
            style={{ opacity: row, transform: `translateY(${(1 - row) * 24}px)` }}
          >
            <span className="col-span-2 text-lg font-semibold tnum text-brand sm:col-span-1">{two(index + 1)}</span>
            <div className="col-span-10 sm:col-span-4">
              <p className="text-xs font-medium uppercase tracking-[0.06em] text-ink-4">{s.label}</p>
              <h3 className="mt-0.5 text-[1.0625rem] font-medium text-ink">{s.title}</h3>
            </div>
            <p className="col-span-12 text-[0.9375rem] leading-[1.55] text-ink-2 text-pretty sm:col-span-7">{s.body}</p>
          </li>
        )
      })}
    </ol>
  )
}

/** Versión con scroll pegado: los pasos avanzan mientras la sección queda fija en pantalla. */
function StickySteps() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(0.5)

  useEffect(() => {
    let ticking = false

    function update() {
      ticking = false
      const track = trackRef.current
      if (!track) return
      const rect = track.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      const scrolled = -rect.top
      const p = scrollable > 0 ? Math.min(1, Math.max(0, scrolled / scrollable)) : 0
      setPos(p * SEGMENTS)
    }

    function onScrollOrResize() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [])

  return (
    <div ref={trackRef} style={{ height: `${STEP_VH * SEGMENTS}vh` }} className="relative">
      <div className="sticky top-20 flex min-h-[calc(100svh-7rem)] flex-col justify-center gap-12">
        <StepRail pos={pos} />

        <div className="grid items-center">
          {steps.map((s, index) => (
            <SingleStep key={s.label} index={index} pos={pos} />
          ))}
          <MergedSteps pos={pos} />
        </div>
      </div>
    </div>
  )
}

export function HowItWorks() {
  const reducedMotion = usePrefersReducedMotion()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const useScrollEffect = isDesktop && !reducedMotion

  return useScrollEffect ? <StickySteps /> : <StaticSteps />
}
