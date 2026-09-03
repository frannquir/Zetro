import Link from 'next/link'
import { Logo } from '@/components/marketing/logo'

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

        <div className="space-y-3 text-[0.9375rem]">
          <p className="font-medium text-ink">Producto</p>
          <ul className="space-y-2 text-ink-3">
            <li><Link href="/trabajos" className="hover:text-ink">Trabajos</Link></li>
            <li><Link href="/#como-funciona" className="hover:text-ink">Cómo funciona</Link></li>
            <li><Link href="/#precios" className="hover:text-ink">Precios</Link></li>
          </ul>
        </div>

        <div className="space-y-3 text-[0.9375rem]">
          <p className="font-medium text-ink">Empresa</p>
          <ul className="space-y-2 text-ink-3">
            <li><Link href="/contacto" className="hover:text-ink">Contacto</Link></li>
            <li><Link href="/login" className="hover:text-ink">Entrar al panel</Link></li>
          </ul>
        </div>

        <div className="space-y-3 text-[0.9375rem]">
          <p className="font-medium text-ink">Contacto</p>
          <ul className="space-y-2 text-ink-3">
            <li>hola@zetro.com</li>
            <li>Buenos Aires, Argentina</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-n-200">
        <div className="mx-auto w-full max-w-[75rem] px-5 py-5 text-xs text-ink-4 sm:px-8">
          © {new Date().getFullYear()} Zetro. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
