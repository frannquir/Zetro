import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function PausedBanner({ status }: { status: string }) {
  if (status !== 'paused') return null

  return (
    <Alert variant="destructive">
      <TriangleAlert />
      <AlertTitle>Tu cuenta está pausada</AlertTitle>
      <AlertDescription>
        Podés entrar, pero los datos no se están actualizando. Escribinos a hola@zetro.com para reactivarla.
      </AlertDescription>
    </Alert>
  )
}
