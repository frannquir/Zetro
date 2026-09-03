import type { Metadata } from 'next'
import { Clock, Mail, MessageCircle } from 'lucide-react'
import { ContactForm } from '@/components/marketing/contact-form'

export const metadata: Metadata = {
  title: 'Contacto — Zetro',
  description: 'Contanos qué necesita tu negocio y te respondemos en el día con una propuesta concreta.',
}

const channels = [
  { icon: Mail, label: 'hola@zetro.com', hint: 'Respondemos en el día hábil' },
  { icon: MessageCircle, label: 'WhatsApp 11 5555 5555', hint: 'Lunes a viernes, 9 a 19' },
  { icon: Clock, label: 'Primera charla: 30 minutos', hint: 'Sin costo y sin compromiso' },
]

export default function ContactoPage() {
  return (
    <div className="mx-auto grid w-full max-w-[75rem] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:py-20">
      <div className="space-y-8">
        <div className="space-y-3">
          <p className="text-xs leading-none tracking-[0.06em] uppercase font-medium text-ink-4">Contacto</p>
          <h1 className="text-[2.75rem] leading-[1.08] tracking-[-0.025em] font-semibold text-balance text-ink">Contanos qué necesitás.</h1>
          <p className="text-[1.0625rem] leading-[1.55] text-ink-2 text-pretty">
            No hace falta que tengas todo definido. Con saber qué hace tu negocio y qué te está costando, alcanza para
            armarte una propuesta.
          </p>
        </div>

        <ul className="space-y-4 border-t border-n-200 pt-6">
          {channels.map((channel) => (
            <li key={channel.label} className="flex items-start gap-2.5">
              <channel.icon className="mt-0.5 size-4 shrink-0 text-ink-3" />
              <span>
                <span className="block text-[0.9375rem] font-medium text-ink">{channel.label}</span>
                <span className="block text-[0.8125rem] text-ink-3">{channel.hint}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-md border border-n-200 bg-surface p-6 sm:p-8">
        <ContactForm />
      </div>
    </div>
  )
}
