'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FormMessage } from '@/components/auth/form-message'
import { SubmitButton } from '@/components/auth/submit-button'
import { emptyState, sendMagicLink, signIn } from '@/lib/auth/actions'

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<'password' | 'link'>('password')
  const [passwordState, passwordAction] = useActionState(signIn, emptyState)
  const [linkState, linkAction] = useActionState(sendMagicLink, emptyState)

  if (mode === 'link') {
    return (
      <form action={linkAction} className="space-y-5">
        <input type="hidden" name="next" value={next} />
        <FormMessage error={linkState.error} notice={linkState.notice} />

        <div className="space-y-2">
          <Label htmlFor="email">Mail</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="vos@tunegocio.com" />
        </div>

        <SubmitButton className="w-full" pendingLabel="Enviando">
          Enviarme un enlace
        </SubmitButton>

        <Button type="button" variant="ghost" className="w-full" onClick={() => setMode('password')}>
          Entrar con contraseña
        </Button>
      </form>
    )
  }

  return (
    <form action={passwordAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <FormMessage error={passwordState.error} notice={passwordState.notice} />

      <div className="space-y-2">
        <Label htmlFor="email">Mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="vos@tunegocio.com" />
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <Link href="/recuperar" className="text-xs text-muted-foreground hover:text-foreground">
            ¿La olvidaste?
          </Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>

      <SubmitButton className="w-full" pendingLabel="Entrando">
        Entrar
      </SubmitButton>

      <Button type="button" variant="ghost" className="w-full" onClick={() => setMode('link')}>
        Entrar con un enlace por mail
      </Button>
    </form>
  )
}
