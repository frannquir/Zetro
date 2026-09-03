'use client'

import { useId, useState } from 'react'
import { CircleCheckBig, Loader2 } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const CONTACT_EMAIL = 'contacto@zetro.app'

const schema = z.object({
  business: z.string().trim().min(2, 'Contanos cómo se llama tu negocio'),
  handle: z.string().trim().min(2, 'Pasanos tu Instagram o tu sitio'),
  contact: z.string().trim().min(4, 'Dejanos un mail o un WhatsApp'),
})

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>

// [[PENDIENTE: definir backend del formulario]] — hoy arma un mailto: a contacto@zetro.app.
// Si el equipo conecta este formulario a un backend propio (o al mismo /api/public/leads,
// ajustando su esquema para aceptar estos tres campos), reemplazar el bloque de submit
// por esa llamada y mantener el resto del componente igual.
export function DiagnosticForm() {
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const formId = useId()

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)

    // Honeypot: si un bot completó este campo oculto, descartamos en silencio.
    if (form.get('company_website')) {
      setDone(true)
      return
    }

    const parsed = schema.safeParse({
      business: form.get('business'),
      handle: form.get('handle'),
      contact: form.get('contact'),
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

    const { business, handle, contact } = parsed.data
    const subject = `Diagnóstico gratis - ${business}`
    const body = [
      `Negocio: ${business}`,
      `Instagram o sitio: ${handle}`,
      `Email o WhatsApp: ${contact}`,
    ].join('\n')

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    setPending(false)
    setDone(true)
  }

  if (done) {
    return (
      <Alert className="border-l-ok">
        <CircleCheckBig className="text-ok" />
        <AlertTitle>Listo, ya tenés tu cliente de mail abierto</AlertTitle>
        <AlertDescription>
          Mandá el mensaje y te respondemos por el mismo medio, en el día hábil.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id={`${formId}-business`} label="Nombre del negocio" error={errors.business}>
          <Input
            id={`${formId}-business`}
            name="business"
            autoComplete="organization"
            placeholder="Bar Chelo"
            aria-invalid={!!errors.business}
            aria-describedby={errors.business ? `${formId}-business-error` : undefined}
          />
        </Field>
        <Field id={`${formId}-handle`} label="Instagram o sitio web" error={errors.handle}>
          <Input
            id={`${formId}-handle`}
            name="handle"
            placeholder="@tunegocio o tunegocio.com.ar"
            aria-invalid={!!errors.handle}
            aria-describedby={errors.handle ? `${formId}-handle-error` : undefined}
          />
        </Field>
        <Field id={`${formId}-contact`} label="Email o WhatsApp" error={errors.contact}>
          <Input
            id={`${formId}-contact`}
            name="contact"
            placeholder="camila@barchelo.com.ar"
            aria-invalid={!!errors.contact}
            aria-describedby={errors.contact ? `${formId}-contact-error` : undefined}
          />
        </Field>
      </div>

      {/* Honeypot anti-spam: oculto visualmente, presente para lectores de pantalla que no deben completarlo */}
      <div className="absolute h-px w-px overflow-hidden" style={{ clip: 'rect(0,0,0,0)' }} aria-hidden="true">
        <label htmlFor={`${formId}-company_website`}>No completar este campo</label>
        <input id={`${formId}-company_website`} name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="space-y-2">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          Pedir mi diagnóstico gratis
        </Button>
        <p className="text-xs text-ink-4">
          Te respondemos por el mismo medio. No te vamos a llamar por teléfono si no nos lo pedís.
        </p>
      </div>
    </form>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  const errorId = `${id}-error`
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={errorId} className="text-xs text-err">
          {error}
        </p>
      ) : null}
    </div>
  )
}
