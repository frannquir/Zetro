import { MessageCircle } from 'lucide-react'
import { WhatsappLink } from '@/components/marketing/whatsapp-link'

/**
 * Acceso directo a WhatsApp, solo en celular. Se esconde mientras la barra del armador de presupuesto
 * está a la vista (la barra marca <html data-pricing-bar="on">) para que no se pisen.
 */
export function WhatsappFab() {
  return (
    <WhatsappLink
      source="flotante"
      aria-label="Escribinos por WhatsApp"
      className="fixed right-4 bottom-4 z-30 flex size-14 items-center justify-center rounded-full bg-ink text-paper shadow-overlay transition-[opacity,transform] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:hidden in-data-[pricing-bar=on]:pointer-events-none in-data-[pricing-bar=on]:translate-y-4 in-data-[pricing-bar=on]:opacity-0 motion-reduce:transition-none"
    >
      <MessageCircle className="size-6" />
    </WhatsappLink>
  )
}
