import type { Metadata } from 'next'
import { Clock, Mail, MessageCircle } from 'lucide-react'
import { ContactForm } from '@/components/marketing/contact-form'
import { WhatsappLink } from '@/components/marketing/whatsapp-link'
import { CONTACT_EMAIL, WHATSAPP_LABEL } from '@/lib/contact'

export const metadata: Metadata = {
  title: 'Contacto — Zetro',
  description: 'Contanos qué necesita tu negocio y te respondemos en el día hábil con una propuesta concreta.',
}

const channelClass =
  'group flex items-start gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

export default function ContactoPage() {
  return (
    <div className="mx-auto grid w-full max-w-[75rem] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:py-20">
      <div className="space-y-8">
        <div className="space-y-3">
          <p className="text-xs leading-none tracking-[0.06em] uppercase font-medium text-ink-4">Contacto</p>
          <h1 className="text-[2.75rem] leading-[1.08] tracking-[-0.025em] font-semibold text-balance text-ink">
            Contanos qué necesitás.
          </h1>
          <p className="text-[1.0625rem] leading-[1.55] text-ink-2 text-pretty">
            No hace falta que tengas todo definido. Con saber qué hace tu negocio y qué te está costando, alcanza para
            armarte una propuesta.
          </p>
        </div>

        <ul className="space-y-4 border-t border-n-200 pt-6">
          <li>
            <WhatsappLink source="contacto" className={channelClass}>
              <MessageCircle className="mt-0.5 size-4 shrink-0 text-brand" />
              <span>
                <span className="block text-[0.9375rem] font-medium text-ink group-hover:text-brand">
                  WhatsApp {WHATSAPP_LABEL}
                </span>
                <span className="block text-[0.8125rem] text-ink-3">La forma más rápida de hablar con nosotros</span>
              </span>
            </WhatsappLink>
          </li>
          <li>
            <a href={`mailto:${CONTACT_EMAIL}`} className={channelClass}>
              <Mail className="mt-0.5 size-4 shrink-0 text-ink-3" />
              <span>
                <span className="block text-[0.9375rem] font-medium text-ink group-hover:text-brand">
                  {CONTACT_EMAIL}
                </span>
                <span className="block text-[0.8125rem] text-ink-3">Respondemos en el día hábil</span>
              </span>
            </a>
          </li>
          <li className="flex items-start gap-2.5">
            <Clock className="mt-0.5 size-4 shrink-0 text-ink-3" />
            <span>
              <span className="block text-[0.9375rem] font-medium text-ink">Primera charla: 30 minutos</span>
              <span className="block text-[0.8125rem] text-ink-3">Sin costo y sin compromiso</span>
            </span>
          </li>
        </ul>
      </div>

      <div className="rounded-md border border-n-200 bg-surface p-6 sm:p-8">
        <ContactForm />
      </div>
    </div>
  )
}
