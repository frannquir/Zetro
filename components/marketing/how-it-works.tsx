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
const STEP_VH = 60

function two(n: number) {
  return String(n).padStart(2, '0')
}

/**
 * Riel de progreso. El relleno va de punto a punto: su ancho se deriva del paso
 * activo (0 → 1/3 → 2/3 → 1), nunca del progreso continuo del scroll.
 */
function StepRail({ active }: { active: number }) {
  const filled = active / (steps.length - 1)
  return (
    <div className="relative">
      {/* Los puntos son el centro de cada columna de la grilla: 12.5%, 37.5%, 62.5% y 87.5%.
          El riel se recorta a esos extremos para que el relleno caiga exacto sobre cada punto. */}
      <div className="pointer-events-none absolute inset-x-[12.5%] top-1.5 h-0.5" aria-hidden="true">
        <div className="absolute inset-0 bg-n-200" />
        <div
          className="absolute inset-y-0 left-0 w-full origin-left bg-brand transition-transform duration-[450ms] ease-[var(--ease-in-out-quart)]"
          style={{ transform: `scaleX(${filled})` }}
        />
      </div>

      <ol aria-label="Pasos del proceso" className="relative grid grid-cols-4">
        {steps.map((s, index) => {
          const state = index === active ? 'active' : index < active ? 'done' : 'pending'
          return (
            <li
              key={s.label}
              className="flex flex-col items-center gap-2"
              aria-current={state === 'active' ? 'step' : undefined}
            >
              <span
                aria-hidden="true"
                className={`block size-3 rounded-full border-2 transition-transform duration-200 ease-[var(--ease-out-quart)] ${
                  state === 'pending' ? 'border-n-300 bg-paper' : 'border-brand bg-brand'
                } ${state === 'active' ? 'scale-125 shadow-[0_0_0_6px_var(--brand-soft)]' : ''}`}
              />
              <span className={`text-xs text-ink-3 ${state === 'active' ? 'font-medium text-ink' : ''}`}>{s.label}</span>
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

/** Un paso solo, en grande: numeral a la izquierda, texto a la derecha. */
function SingleStep({ index }: { index: number }) {
  const step = steps[index]
  return (
    <div className="grid gap-5 sm:grid-cols-12 sm:items-center sm:gap-8">
      <div className="sm:col-span-4">
        <p className="text-xs font-medium uppercase tracking-[0.06em] text-ink-4">{step.label}</p>
        <span className="mt-3 block text-[5rem] leading-[0.8] tracking-[-0.04em] font-semibold tnum text-brand lg:text-[6.5rem]">
          {two(index + 1)}
        </span>
      </div>
      <div className="sm:col-span-8 sm:border-l sm:border-n-200 sm:pl-8">
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

/** Cierre: los cuatro pasos a la vez, como índice editorial. */
function MergedSteps() {
  return (
    <ol className="divide-y divide-n-200 border-y border-n-200">
      {steps.map((s, index) => (
        <li key={s.title} className="grid grid-cols-12 items-baseline gap-x-4 gap-y-1 py-4">
          <span className="col-span-2 text-lg font-semibold tnum text-brand sm:col-span-1">{two(index + 1)}</span>
          <div className="col-span-10 sm:col-span-4">
            <p className="text-xs font-medium uppercase tracking-[0.06em] text-ink-4">{s.label}</p>
            <h3 className="mt-0.5 text-[1.0625rem] font-medium text-ink">{s.title}</h3>
          </div>
          <p className="col-span-12 text-[0.9375rem] leading-[1.55] text-ink-2 text-pretty sm:col-span-7">{s.body}</p>
        </li>
      ))}
    </ol>
  )
}

/** Versión con scroll pegado: los pasos avanzan mientras la sección queda fija en pantalla. */
function StickySteps() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [segment, setSegment] = useState(0)

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
      setSegment(Math.min(SEGMENTS - 1, Math.floor(p * SEGMENTS)))
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

  const merged = segment === SEGMENTS - 1
  const active = Math.min(segment, steps.length - 1)

  return (
    <div ref={trackRef} style={{ height: `${STEP_VH * SEGMENTS}vh` }} className="relative">
      <div className="sticky top-20 flex min-h-[calc(100svh-7rem)] flex-col justify-center gap-12">
        <StepRail active={active} />

        <div>
          {merged ? (
            <div key="merged" className="animate-step-in">
              <MergedSteps />
            </div>
          ) : (
            <div key={active} className="animate-step-in">
              <SingleStep index={active} />
            </div>
          )}
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
