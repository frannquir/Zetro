'use client'

import { useEffect, useRef } from 'react'
import { CircleCheckBig, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WhatsappLink } from '@/components/marketing/whatsapp-link'

const nextSteps = [
  'Te respondemos en el día hábil, por mail o por WhatsApp.',
  'Charlamos media hora sobre tu negocio, sin costo.',
  'Te mandamos la propuesta con alcance y precio cerrado.',
]

/**
 * Pantalla después de enviar un pedido. Dice qué pasa ahora, para que nadie se quede preguntándose si llegó.
 * Toma el foco al aparecer: el formulario desaparece y sin esto el foco se pierde y el lector de pantalla calla.
 */
export function LeadSuccess({ title, source }: { title: string; source: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <div ref={ref} tabIndex={-1} role="status" className="space-y-5 outline-none">
      <div className="flex items-start gap-3">
        <CircleCheckBig className="mt-0.5 size-5 shrink-0 text-ok" />
        <div className="space-y-1">
          <p className="text-lg font-medium text-ink">{title}</p>
          <p className="text-[0.9375rem] text-ink-3 text-pretty">Te mandamos una copia a tu mail.</p>
        </div>
      </div>

      <div className="border-t border-n-200 pt-4">
        <p className="text-xs leading-none tracking-[0.06em] uppercase font-medium text-ink-4">Qué sigue</p>
        <ol className="mt-3 space-y-2.5">
          {nextSteps.map((step, index) => (
            <li key={step} className="flex gap-3 text-[0.9375rem] text-ink-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-brand text-xs font-semibold tnum text-ink">
                {index + 1}
              </span>
              <span className="pt-0.5 text-pretty">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-n-200 pt-4">
        <p className="text-[0.9375rem] text-ink-3">¿Te quedó algo en el tintero?</p>
        <Button asChild variant="outline">
          <WhatsappLink source={`${source}-exito`}>
            <MessageCircle /> Escribinos por WhatsApp
          </WhatsappLink>
        </Button>
      </div>
    </div>
  )
}
