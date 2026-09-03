'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'

type Step = { title: string; body: string; label: string }

const AUTOPLAY = false

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

export function HowItWorks() {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const reducedMotion = usePrefersReducedMotion()
  const [minHeight, setMinHeight] = useState<number>()
  const contentRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    function measure() {
      const node = contentRef.current
      if (!node) return
      const prevMin = node.style.minHeight
      node.style.minHeight = '0px'
      const height = node.scrollHeight
      node.style.minHeight = prevMin
      setMinHeight((prev) => Math.max(prev ?? 0, height))
    }
    measure()

    let timeout: ReturnType<typeof setTimeout>
    function onResize() {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        setMinHeight(undefined)
        requestAnimationFrame(measure)
      }, 150)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(timeout)
    }
  }, [active])

  function goTo(index: number) {
    if (index === active || index < 0 || index >= steps.length) return
    setDirection(index > active ? 1 : -1)
    setActive(index)
  }

  function next() {
    if (active < steps.length - 1) goTo(active + 1)
  }

  function prev() {
    if (active > 0) goTo(active - 1)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      next()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      prev()
    } else if (event.key === 'Home') {
      event.preventDefault()
      goTo(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      goTo(steps.length - 1)
    }
  }

  function onTouchStart(event: React.TouchEvent) {
    const touch = event.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }

  function onTouchEnd(event: React.TouchEvent) {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const touch = event.changedTouches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) < 50 || Math.abs(dy) > 30) return
    if (dx < 0) next()
    else prev()
  }

  const progress = steps.length > 1 ? active / (steps.length - 1) : 0

  return (
    <div onKeyDown={onKeyDown}>
      {/* Riel */}
      <div className="relative mb-10">
        <div
          role="tablist"
          aria-label="Pasos del proceso"
          className="relative flex items-center justify-between"
        >
          <div className="absolute inset-x-0 top-1.5 h-0.5 bg-n-200" aria-hidden="true" />
          <div
            className="absolute left-0 top-1.5 h-0.5 origin-left bg-brand"
            aria-hidden="true"
            style={{
              width: '100%',
              transform: `scaleX(${progress})`,
              transitionProperty: reducedMotion ? 'none' : 'transform',
              transitionDuration: '500ms',
              transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)',
            }}
          />
          {steps.map((s, index) => {
            const state = index === active ? 'active' : index < active ? 'done' : 'pending'
            return (
              <button
                key={s.label}
                type="button"
                role="tab"
                id={`step-tab-${index}`}
                aria-selected={index === active}
                aria-controls={`step-panel-${index}`}
                onClick={() => goTo(index)}
                className="group relative flex flex-col items-center gap-2"
              >
                <span
                  className={`block size-3 rounded-full border-2 transition-transform duration-150 ease-out group-hover:scale-[1.15] ${
                    state === 'pending' ? 'border-n-300 bg-paper' : 'border-brand bg-brand'
                  } ${state === 'active' ? 'scale-125 shadow-[0_0_0_6px_var(--brand-soft)]' : ''}`}
                />
                <span
                  className={`text-xs text-ink-3 ${index === active ? 'block' : 'hidden sm:block'} ${
                    state === 'active' ? 'font-medium text-ink' : ''
                  }`}
                >
                  {s.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Contenido + flechas */}
      <div className="flex items-center gap-3 sm:gap-6">
        <button
          type="button"
          onClick={prev}
          disabled={active === 0}
          aria-label="Paso anterior"
          className="hidden size-10 shrink-0 items-center justify-center rounded-full border border-n-300 text-ink-2 transition-[background-color,color,transform] duration-[180ms] hover:bg-brand hover:text-paper hover:scale-[1.06] disabled:pointer-events-none disabled:opacity-40 sm:flex"
        >
          <ChevronLeft className="size-5" />
        </button>

        <div
          ref={contentRef}
          className="relative flex-1 overflow-hidden"
          style={{ minHeight: minHeight ? `${minHeight}px` : undefined }}
        >
          {steps.map((s, index) => {
            const isActive = index === active
            if (!isActive && reducedMotion) return null
            return (
              <div
                key={s.title}
                id={`step-panel-${index}`}
                role="tabpanel"
                aria-live="polite"
                aria-hidden={!isActive}
                aria-labelledby={`step-tab-${index}`}
                className={`space-y-2 ${isActive ? 'relative' : 'pointer-events-none absolute inset-0'}`}
                style={
                  reducedMotion
                    ? undefined
                    : {
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? 'translateX(0)' : `translateX(${direction * 24}px)`,
                        transitionProperty: 'opacity, transform',
                        transitionDuration: '380ms',
                        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                      }
                }
              >
                <span className="block text-[1.75rem] leading-none tracking-[-0.02em] font-semibold tnum text-ink">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-medium text-ink">{s.title}</h3>
                <p className="text-[0.9375rem] leading-[1.55] text-ink-2 text-pretty">{s.body}</p>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={next}
          disabled={active === steps.length - 1}
          aria-label="Paso siguiente"
          className="hidden size-10 shrink-0 items-center justify-center rounded-full border border-n-300 text-ink-2 transition-[background-color,color,transform] duration-[180ms] hover:bg-brand hover:text-paper hover:scale-[1.06] disabled:pointer-events-none disabled:opacity-40 sm:flex"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Controles mobile: flechas + contador debajo del texto */}
      <div
        className="mt-4 flex items-center justify-center gap-4 sm:hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          onClick={prev}
          disabled={active === 0}
          aria-label="Paso anterior"
          className="flex size-11 items-center justify-center rounded-full border border-n-300 text-ink-2 disabled:opacity-40"
        >
          <ChevronLeft className="size-5" />
        </button>
        <span className="text-sm tnum text-ink-3">
          {active + 1} / {steps.length}
        </span>
        <button
          type="button"
          onClick={next}
          disabled={active === steps.length - 1}
          aria-label="Paso siguiente"
          className="flex size-11 items-center justify-center rounded-full border border-n-300 text-ink-2 disabled:opacity-40"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
      {AUTOPLAY ? null : null}
    </div>
  )
}
