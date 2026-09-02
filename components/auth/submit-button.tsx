'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SubmitButton({
  children,
  pendingLabel,
  className,
  variant,
}: {
  children: React.ReactNode
  pendingLabel?: string
  className?: string
  variant?: React.ComponentProps<typeof Button>['variant']
}) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className={className} variant={variant}>
      {pending ? <Loader2 className="animate-spin" /> : null}
      {pending ? (pendingLabel ?? children) : children}
    </Button>
  )
}
