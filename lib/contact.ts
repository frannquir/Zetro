// Canales de contacto públicos. Un solo lugar para que la landing, /contacto y el armador no se desincronicen.

export const CONTACT_EMAIL = 'contacto@zetro.app'

// Formato internacional sin signos, como lo pide wa.me
export const WHATSAPP_NUMBER = '5492236971636'
export const WHATSAPP_LABEL = '+54 9 223 697-1636'

export const WHATSAPP_DEFAULT_TEXT = 'Hola, quiero consultar por un sitio para mi negocio.'

export function whatsappHref(text: string = WHATSAPP_DEFAULT_TEXT) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}
