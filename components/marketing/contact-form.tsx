'use client'

import { useState } from 'react'
import { CircleCheckBig, Loader2 } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { postJson } from '@/lib/api'

const schema = z.object({
  name: z.string().trim().min(2, 'Poné tu nombre'),
  email: z.email('Revisá el mail'),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(10, 'Contanos un poco más, aunque sean dos renglones'),
})

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>

export function ContactForm() {
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [failure, setFailure] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFailure(null)

    const form = new FormData(event.currentTarget)
    const parsed = schema.safeParse({
      name: form.get('name'),
      email: form.get('email'),
      phone: form.get('phone') || undefined,
      message: form.get('message'),
    })

    if (!parsed.success) {
      const next: Errors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors
        if (!next[key]) next[key] = issue.message
      }
      setErrors(next)
      return
    }

    setErrors({})
    setPending(true)
    const result = await postJson<{ ok: true }>('/api/public/leads', {
      ...parsed.data,
      source_path: window.location.pathname,
    })
    setPending(false)

    if (result.ok) setDone(true)
    else setFailure(result.error.message)
  }

  if (done) {
    return (
      <Alert className="border-l-ok">
        <CircleCheckBig className="text-ok" />
        <AlertTitle>Nos llegó</AlertTitle>
        <AlertDescription>Te respondemos en el día hábil. Si es urgente, escribinos a contacto@zetro.app.</AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {failure ? (
        <Alert variant="destructive">
          <AlertTitle>No pudimos enviarlo</AlertTitle>
          <AlertDescription>{failure}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Nombre" error={errors.name}>
          <Input id="name" name="name" autoComplete="name" placeholder="Camila Sosa" aria-invalid={!!errors.name} />
        </Field>
        <Field id="email" label="Mail" error={errors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="camila@barchelo.com.ar" aria-invalid={!!errors.email} />
        </Field>
      </div>

      <Field id="phone" label="Teléfono" hint="Opcional" error={errors.phone}>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="11 5555 5555" />
      </Field>

      <Field id="message" label="Contanos del negocio" error={errors.message}>
        <Textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Tenemos una parrilla en Villa Crespo, tomamos reservas por WhatsApp y se nos superponen las mesas."
          aria-invalid={!!errors.message}
        />
      </Field>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : null}
        {pending ? 'Enviando' : 'Enviar consulta'}
      </Button>

      <p className="text-xs text-ink-4">
        Usamos tus datos solo para responderte. No los compartimos con nadie.
      </p>
    </form>
  )
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {hint ? <span className="text-xs text-ink-4">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-xs text-err">{error}</p> : null}
    </div>
  )
}
