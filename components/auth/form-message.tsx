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
      <Alert className="border-success/30 bg-success/5">
        <CircleCheckBig className="text-success" />
        <AlertDescription>{notice}</AlertDescription>
      </Alert>
    )
  }
  return null
}
