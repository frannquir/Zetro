'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormMessage } from '@/components/auth/form-message'
import { SubmitButton } from '@/components/auth/submit-button'
import { setPassword } from '@/lib/auth/actions'
import { emptyState } from '@/lib/auth/form-state'

export function InviteForm({ token }: { token: string }) {
  const [state, action] = useActionState(setPassword, emptyState)

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <FormMessage error={state.error} notice={state.notice} />

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">Repetila</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} />
      </div>

      <SubmitButton className="w-full" pendingLabel="Entrando">
        Aceptar invitación
      </SubmitButton>

      <p className="text-xs text-ink-4">
        Las invitaciones vencen a los 7 días. Si esta ya venció, pedile al dueño de la cuenta que te mande otra.
      </p>
    </form>
  )
}
