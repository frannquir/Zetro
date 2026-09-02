import { CircleCheckBig, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function FormMessage({ error, notice }: { error?: string | null; notice?: string | null }) {
  if (error) {
    return (
      <Alert variant="destructive">
        <TriangleAlert />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }
  if (notice) {
    return (
      <Alert className="border-l-ok">
        <CircleCheckBig className="text-ok" />
        <AlertDescription>{notice}</AlertDescription>
      </Alert>
    )
  }
  return null
}
