'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'

type Feature = {
  title: string
  body: string
  icon: React.ReactNode
  span: 'lead' | 'medium' | 'small'
}

const iconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function SiteIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-6" aria-hidden="true">
      <rect x="4" y="6" width="24" height="20" rx="2.5" {...iconProps} />
      <path d="M4 12h24" {...iconProps} />
      <circle cx="8" cy="9" r="0.9" fill="currentColor" />
      <circle cx="11.5" cy="9" r="0.9" fill="currentColor" />
      <path d="M9 18h10M9 22h6" {...iconProps} />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" {...iconProps} />
      <path d="M3 10h18M8 3v4M16 3v4" {...iconProps} />
      <path d="M8.5 14.5l2 2 4-4" {...iconProps} />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path d="M4 20V10M11 20V4M18 20v-7" {...iconProps} />
      <path d="M3 20h18" {...iconProps} />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <rect x="7" y="2.5" width="10" height="19" rx="2" {...iconProps} />
      <path d="M11 18h2" {...iconProps} />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path d="M4 20l1-4L16 5l3 3L8 19l-4 1Z" {...iconProps} />
      <path d="M14 7l3 3" {...iconProps} />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" {...iconProps} />
      <path d="M12 7v5l3.5 2" {...iconProps} />
    </svg>
  )
}

/**
 * Esquema del producto para la tarjeta principal: el sitio en una ventana y el panel en un celular.
 * Son bloques y líneas, sin datos: muestra la forma, no inventa números ni clientes.
 */
function ProductSketch() {
  return (
    <svg viewBox="0 0 360 150" className="w-full max-w-md text-n-300" aria-hidden="true">
      <rect x="1" y="6" width="250" height="140" rx="6" fill="var(--paper-2)" stroke="currentColor" />
      <path d="M1 26h250" stroke="currentColor" />
      <circle cx="13" cy="16" r="2.5" fill="currentColor" />
      <circle cx="22" cy="16" r="2.5" fill="currentColor" />
      <circle cx="31" cy="16" r="2.5" fill="currentColor" />
      <rect x="18" y="42" width="120" height="10" rx="2" fill="var(--ink)" opacity="0.8" />
      <rect x="18" y="58" width="90" height="6" rx="2" fill="currentColor" />
      <rect x="18" y="70" width="104" height="6" rx="2" fill="currentColor" />
      <rect x="18" y="86" width="56" height="16" rx="3" fill="var(--brand)" />
      <rect x="152" y="42" width="82" height="60" rx="4" fill="var(--surface)" stroke="currentColor" />
      <rect x="18" y="116" width="216" height="16" rx="3" fill="var(--surface)" stroke="currentColor" />

      <rect x="272" y="1" width="86" height="148" rx="12" fill="var(--surface)" stroke="currentColor" />
      <rect x="284" y="18" width="40" height="6" rx="2" fill="var(--ink)" opacity="0.8" />
      {[34, 56, 78, 100].map((y, i) => (
        <g key={y}>
          <rect x="284" y={y} width="62" height="16" rx="3" fill={i === 1 ? 'var(--brand-soft)' : 'var(--paper-2)'} />
          <rect
            x="289"
            y={y + 5}
            width={i === 1 ? 30 : 22}
            height="6"
            rx="2"
            fill={i === 1 ? 'var(--brand)' : 'currentColor'}
          />
        </g>
      ))}
      <rect x="302" y="132" width="26" height="4" rx="2" fill="currentColor" />
    </svg>
  )
}

const features: Feature[] = [
  {
    span: 'lead',
    icon: <SiteIcon />,
    title: 'Tu sitio, hecho bien',
    body: 'Carga rápido, se ve bien en el celular —que es donde te miran— y no depende de plugins que se rompen solos. Hosting y dominio ya configurados.',
  },
  {
    span: 'medium',
    icon: <CalendarIcon />,
    title: 'Reservas que no se pisan',
    body: 'Entran directo a tu agenda. Nunca dos personas, la misma mesa.',
  },
  {
    span: 'medium',
    icon: <ChartIcon />,
    title: 'Números que sirven',
    body: 'Quién entró, de dónde vino y cuántos reservaron. Una sola pantalla.',
  },
  {
    span: 'small',
    icon: <PhoneIcon />,
    title: 'Se maneja del celular',
    body: 'Pensado para usarse parado atrás de la barra, no en una oficina.',
  },
  {
    span: 'small',
    icon: <PencilIcon />,
    title: 'Tu contenido, sin depender de nosotros',
    body: 'Cambiás carta y precios desde el panel, al toque.',
  },
  {
    span: 'small',
    icon: <ClockIcon />,
    title: 'En línea en unas dos semanas',
    body: 'Es lo habitual. Si tu proyecto es más grande, te damos el plazo en la propuesta.',
  },
]

const spanClass: Record<Feature['span'], string> = {
  lead: 'sm:col-span-2 lg:col-span-4 lg:row-span-2',
  medium: 'lg:col-span-2',
  small: 'lg:col-span-2',
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [intersected, setIntersected] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const visible = intersected || reducedMotion

  useEffect(() => {
    const node = ref.current
    if (!node || reducedMotion) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIntersected(true)
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [reducedMotion])

  return (
    <div
      ref={ref}
      className={`relative flex flex-col gap-3 rounded-md border border-n-200 bg-surface p-6 ${feature.span === 'lead' ? 'lg:justify-end' : ''} ${spanClass[feature.span]}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transitionProperty: 'opacity, transform',
        transitionDuration: '420ms',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${Math.min(index, 7) * 60}ms`,
      }}
    >
      {feature.span === 'lead' ? (
        <div className="mb-auto hidden pb-6 lg:block">
          <ProductSketch />
        </div>
      ) : null}
      <span className="w-fit text-brand">{feature.icon}</span>
      <h3
        className={
          feature.span === 'lead' ? 'text-xl font-semibold tracking-[-0.01em] text-ink' : 'font-medium text-ink'
        }
      >
        {feature.title}
      </h3>
      <p className="text-[0.9375rem] leading-[1.55] text-ink-2 text-pretty">{feature.body}</p>
    </div>
  )
}

export function FeaturesBento() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:auto-rows-[minmax(0,auto)]">
      {features.map((feature, index) => (
        <FeatureCard key={feature.title} feature={feature} index={index} />
      ))}
    </div>
  )
}
