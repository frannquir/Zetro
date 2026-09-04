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

// vh de scroll dedicados a cada paso dentro del riel pegado
const STEP_VH = 65

function StepRail({ active, progress }: { active: number; progress: number }) {
  return (
    <div className="relative mb-10">
      <div role="list" aria-label="Pasos del proceso" className="relative flex items-center justify-between">
        <div className="absolute inset-x-0 top-1.5 h-0.5 bg-n-200" aria-hidden="true" />
        <div
          className="absolute left-0 top-1.5 h-0.5 origin-left bg-brand"
          aria-hidden="true"
          style={{ width: '100%', transform: `scaleX(${progress})` }}
        />
        {steps.map((s, index) => {
          const state = index === active ? 'active' : index < active ? 'done' : 'pending'
          return (
            <div key={s.label} className="relative flex flex-col items-center gap-2" aria-current={state === 'active' ? 'step' : undefined}>
              <span
                className={`block size-3 rounded-full border-2 transition-transform duration-150 ease-out ${
                  state === 'pending' ? 'border-n-300 bg-paper' : 'border-brand bg-brand'
                } ${state === 'active' ? 'scale-125 shadow-[0_0_0_6px_var(--brand-soft)]' : ''}`}
              />
              <span
                className={`text-xs text-ink-3 ${state === 'active' ? 'font-medium text-ink' : ''}`}
              >
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
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

/** Versión con scroll pegado: los pasos avanzan mientras la sección queda fija en pantalla. */
function StickySteps() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [merged, setMerged] = useState(false)
  const [progress, setProgress] = useState(0)

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
      const segment = Math.min(steps.length - 1, Math.floor(p * steps.length))
      setProgress(p)
      setActive(segment)
      setMerged(segment === steps.length - 1)
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

  const step = steps[active]

  return (
    <div ref={trackRef} style={{ height: `${STEP_VH * steps.length}vh` }} className="relative">
      <div className="sticky top-20 flex min-h-[24rem] flex-col justify-center">
        <StepRail active={active} progress={progress} />

        <div className="relative">
          {!merged ? (
            <div key={active} className="animate-step-in space-y-2">
              <span className="block text-[1.75rem] leading-none tracking-[-0.02em] font-semibold tnum text-ink">
                {String(active + 1).padStart(2, '0')}
              </span>
              <h3 className="text-lg font-medium text-ink">{step.title}</h3>
              <p className="max-w-md text-[0.9375rem] leading-[1.55] text-ink-2 text-pretty">{step.body}</p>
            </div>
          ) : (
            <div key="merged" className="animate-step-in grid grid-cols-4 gap-3 sm:gap-4">
              {steps.map((s, index) => (
                <div key={s.title} className="space-y-1.5 rounded-md border border-brand bg-brand-soft p-3 sm:p-4">
                  <span className="block text-base font-semibold tnum text-ink sm:text-lg">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h4 className="text-[0.8125rem] font-medium text-ink sm:text-sm">{s.title}</h4>
                  <p className="hidden text-xs leading-[1.5] text-ink-3 text-pretty sm:block">{s.body}</p>
                </div>
              ))}
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
