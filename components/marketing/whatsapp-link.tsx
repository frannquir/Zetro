'use client'

import { track } from '@vercel/analytics'
import { whatsappHref } from '@/lib/contact'

/** Link a WhatsApp que registra el clic en Vercel Analytics con el lugar de la página de donde vino. */
export function WhatsappLink({
  source,
  text,
  onClick,
  ...props
}: Omit<React.ComponentProps<'a'>, 'href'> & { source: string; text?: string }) {
  return (
    <a
      {...props}
      href={whatsappHref(text)}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => {
        track('whatsapp_click', { source })
        onClick?.(event)
      }}
    />
  )
}
