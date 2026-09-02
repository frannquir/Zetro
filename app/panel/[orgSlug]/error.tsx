'use client'

import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/error-state'

export default function PanelError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState action={<Button onClick={reset}>Probar de nuevo</Button>} />
}
