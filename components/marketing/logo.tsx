import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('text-ink', className)} aria-hidden="true">
      <rect width="32" height="32" rx="6" fill="currentColor" />
      <path
        d="M10 10.5h12L13 21.5h9"
        fill="none"
        stroke="var(--paper)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
