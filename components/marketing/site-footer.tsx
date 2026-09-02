import Link from 'next/link'
import { Logo } from '@/components/marketing/logo'

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Logo className="size-6" />
            <span className="font-semibold tracking-tight">Zetro</span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground text-pretty">
            Sitios web para negocios que necesitan estar en línea la semana que viene, no el año que viene.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium">Producto</p>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link href="/trabajos" className="hover:text-foreground">Trabajos</Link></li>
            <li><Link href="/#como-funciona" className="hover:text-foreground">Cómo funciona</Link></li>
            <li><Link href="/#precios" className="hover:text-foreground">Precios</Link></li>
          </ul>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium">Empresa</p>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link href="/contacto" className="hover:text-foreground">Contacto</Link></li>
            <li><Link href="/login" className="hover:text-foreground">Entrar al panel</Link></li>
          </ul>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium">Contacto</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>hola@zetro.com</li>
            <li>Buenos Aires, Argentina</li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto w-full max-w-6xl px-5 py-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Zetro. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
