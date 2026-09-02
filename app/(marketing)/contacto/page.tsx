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
    <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[1fr_1.15fr] lg:py-20">
      <div className="space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-medium text-primary">Contacto</p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance">Contanos qué necesitás.</h1>
          <p className="text-muted-foreground text-pretty">
            No hace falta que tengas todo definido. Con saber qué hace tu negocio y qué te está costando, alcanza para
            armarte una propuesta.
          </p>
        </div>

        <ul className="space-y-4">
          {channels.map((channel) => (
            <li key={channel.label} className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <channel.icon className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-medium">{channel.label}</span>
                <span className="block text-sm text-muted-foreground">{channel.hint}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border bg-card p-6 sm:p-8">
        <ContactForm />
      </div>
    </div>
  )
}
