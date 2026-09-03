import { cn } from '@/lib/utils'

type VerticalIllustrationProps = {
  vertical: string
  className?: string
}

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function RestaurantArt() {
  return (
    <svg viewBox="0 0 96 96" className="size-16" aria-hidden="true">
      <circle cx="48" cy="48" r="26" {...strokeProps} />
      <circle cx="48" cy="48" r="16" {...strokeProps} />
      <path d="M20 30v18M20 30q0 6 5 6M25 30v18" {...strokeProps} />
      <path d="M76 30v36M76 30q-6 1-6 9t6 8" {...strokeProps} />
    </svg>
  )
}

function CafeArt() {
  return (
    <svg viewBox="0 0 96 96" className="size-16" aria-hidden="true">
      <path d="M24 38h40v18a20 20 0 0 1-40 0z" {...strokeProps} />
      <path d="M64 42h6a8 8 0 0 1 0 16h-6" {...strokeProps} />
      <path d="M32 30q3-5 0-10M42 30q3-5 0-10M52 30q3-5 0-10" {...strokeProps} />
      <path d="M18 68h52" {...strokeProps} />
    </svg>
  )
}

function GymArt() {
  return (
    <svg viewBox="0 0 96 96" className="size-16" aria-hidden="true">
      <path d="M18 48h60" {...strokeProps} />
      <rect x="10" y="38" width="10" height="20" rx="2" {...strokeProps} />
      <rect x="76" y="38" width="10" height="20" rx="2" {...strokeProps} />
      <rect x="24" y="32" width="8" height="32" rx="2" {...strokeProps} />
      <rect x="64" y="32" width="8" height="32" rx="2" {...strokeProps} />
    </svg>
  )
}

function BarbershopArt() {
  return (
    <svg viewBox="0 0 96 96" className="size-16" aria-hidden="true">
      <circle cx="30" cy="30" r="8" {...strokeProps} />
      <circle cx="30" cy="66" r="8" {...strokeProps} />
      <path d="M74 24 34 66M40 30l34 36" {...strokeProps} />
    </svg>
  )
}

function GenericArt() {
  return (
    <svg viewBox="0 0 96 96" className="size-16" aria-hidden="true">
      <path d="M24 34h48l4 42H20z" {...strokeProps} />
      <path d="M34 34v-6a14 14 0 0 1 28 0v6" {...strokeProps} />
    </svg>
  )
}

const artByVertical: Record<string, () => React.JSX.Element> = {
  restaurant: RestaurantArt,
  cafe: CafeArt,
  gym: GymArt,
  barbershop: BarbershopArt,
  generic: GenericArt,
}

export function VerticalIllustration({ vertical, className }: VerticalIllustrationProps) {
  const Art = artByVertical[vertical] ?? GenericArt
  return (
    <div className={cn('flex items-center justify-center text-ink-3', className)}>
      <Art />
    </div>
  )
}
