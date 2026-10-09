import Link from 'next/link'
import { Logo } from '@/components/marketing/logo'
import { works } from '@/content/works'
import { WhatsappLink } from '@/components/marketing/whatsapp-link'
import { CONTACT_EMAIL, WHATSAPP_LABEL } from '@/lib/contact'

// py-1.5 + inline-block: en celular el área táctil de cada link pasa de 20px a 32px sin abrir más la columna
const linkClass = 'inline-block py-1.5 hover:text-ink'

export function SiteFooter() {
  return (
    <footer className="border-t border-n-200 bg-paper-2">
      <div className="mx-auto grid w-full max-w-[75rem] gap-8 px-5 py-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Logo className="size-6" />
            <span className="font-semibold tracking-tight text-ink">Zetro</span>
          </div>
          <p className="max-w-xs text-[0.9375rem] text-ink-3 text-pretty">
            Sitios web para negocios que necesitan estar en línea la semana que viene, no el año que viene.
          </p>
        </div>

        <div className="space-y-1.5 text-[0.9375rem]">
          <p className="font-medium text-ink">Producto</p>
          <ul className="text-ink-3">
            {works.length > 0 ? (
              <li>
                <Link href="/trabajos" className={linkClass}>
                  Trabajos
                </Link>
              </li>
            ) : null}
            <li>
              <Link href="/#como-funciona" className={linkClass}>
                Cómo funciona
              </Link>
            </li>
            <li>
              <Link href="/#precios" className={linkClass}>
                Precios
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-1.5 text-[0.9375rem]">
          <p className="font-medium text-ink">Empresa</p>
          <ul className="text-ink-3">
            <li>
              <Link href="/contacto" className={linkClass}>
                Contacto
              </Link>
            </li>
            <li>
              <Link href="/login" className={linkClass}>
                Entrar al panel
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-1.5 text-[0.9375rem]">
          <p className="font-medium text-ink">Contacto</p>
          <ul className="text-ink-3">
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              <WhatsappLink source="footer" className={linkClass}>
                WhatsApp {WHATSAPP_LABEL}
              </WhatsappLink>
            </li>
            <li className="py-1.5">Buenos Aires, Argentina</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-n-200">
        <div className="mx-auto w-full max-w-[75rem] px-5 pt-5 pb-24 text-xs text-ink-4 sm:px-8 md:pb-5">
          © {new Date().getFullYear()} Zetro. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
