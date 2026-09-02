import { Label } from '@/components/ui/label'

export function SettingsField({
  id,
  label,
  hint,
  children,
}: {
  id: string
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-3 sm:items-start sm:gap-4">
      <div>
        <Label htmlFor={id}>{label}</Label>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground text-pretty">{hint}</p> : null}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  )
}
