'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'
import { track } from '@vercel/analytics'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { LeadSuccess } from '@/components/marketing/lead-success'
import { postJson } from '@/lib/api'

const schema = z.object({
  name: z.string().trim().min(2, 'Poné tu nombre'),
  email: z.email('Revisá el mail'),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(10, 'Contanos un poco más, aunque sean dos renglones'),
})

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>

const fieldOrder: (keyof Errors)[] = ['name', 'email', 'phone', 'message']

export function ContactForm() {
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [failure, setFailure] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFailure(null)

    const formElement = event.currentTarget
    const form = new FormData(formElement)

    // honeypot: un humano no ve este campo, un bot lo completa
    if (form.get('company_website')) {
      setDone(true)
      return
    }

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
      const first = fieldOrder.find((key) => next[key])
      if (first) formElement.querySelector<HTMLElement>(`#${first}`)?.focus()
      return
    }

    setErrors({})
    setPending(true)
    const result = await postJson<{ ok: true }>('/api/public/leads', {
      ...parsed.data,
      source_path: window.location.pathname,
    })
    setPending(false)

    if (result.ok) {
      track('lead_submitted', { source: 'contacto' })
      setDone(true)
    } else setFailure(result.error.message)
  }

  if (done) return <LeadSuccess title="Nos llegó tu consulta" source="contacto" />

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {failure ? (
        <Alert variant="destructive" role="alert">
          <AlertTitle>No pudimos enviarlo</AlertTitle>
          <AlertDescription>{failure}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Nombre" error={errors.name}>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Camila Sosa"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
        </Field>
        <Field id="email" label="Mail" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="camila@barchelo.com.ar"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </Field>
      </div>

      <Field id="phone" label="WhatsApp" hint="Opcional, si preferís que te escribamos por ahí" error={errors.phone}>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="11 5555 5555"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
      </Field>

      <Field
        id="message"
        label="Contanos del negocio"
        hint="Con el rubro y qué querés resolver alcanza"
        error={errors.message}
      >
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Tenemos una parrilla en Villa Crespo, tomamos reservas por WhatsApp y se nos superponen las mesas."
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
      </Field>

      <div className="absolute h-px w-px overflow-hidden" style={{ clip: 'rect(0,0,0,0)' }} aria-hidden="true">
        <label htmlFor="company_website">No completar este campo</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? <Loader2 className="animate-spin" /> : null}
        {pending ? 'Enviando' : 'Enviar consulta'}
      </Button>

      <p className="text-xs text-ink-4">Usamos tus datos solo para responderte. No los compartimos con nadie.</p>
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
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
        <Label htmlFor={id}>{label}</Label>
        {hint ? <span className="text-xs text-ink-4">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-err">
          {error}
        </p>
      ) : null}
    </div>
  )
}
