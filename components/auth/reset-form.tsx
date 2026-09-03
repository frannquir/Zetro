'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormMessage } from '@/components/auth/form-message'
import { SubmitButton } from '@/components/auth/submit-button'
import { requestPasswordReset, setPassword } from '@/lib/auth/actions'
import { emptyState } from '@/lib/auth/form-state'

export function ResetForm({ mode }: { mode: 'request' | 'set' }) {
  const [state, action] = useActionState(mode === 'set' ? setPassword : requestPasswordReset, emptyState)

  return (
    <form action={action} className="space-y-5">
      <FormMessage error={state.error} notice={state.notice} />

      {mode === 'set' ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña nueva</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Repetila</Label>
            <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} />
          </div>
          <SubmitButton className="w-full" pendingLabel="Guardando">
            Guardar y entrar
          </SubmitButton>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">Mail</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="vos@tunegocio.com" />
          </div>
          <SubmitButton className="w-full" pendingLabel="Enviando">
            Enviarme el enlace
          </SubmitButton>
        </>
      )}
    </form>
  )
}
