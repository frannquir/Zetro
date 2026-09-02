'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Logo } from '@/components/marketing/logo'

const links = [
  { href: '/trabajos', label: 'Trabajos' },
  { href: '/#como-funciona', label: 'Cómo funciona' },
  { href: '/#precios', label: 'Precios' },
  { href: '/contacto', label: 'Contacto' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-n-200 bg-paper">
      <div className="mx-auto flex h-14 w-full max-w-[75rem] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          <Logo className="size-7" />
          <span className="text-lg font-semibold tracking-tight text-ink">Zetro</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm px-3 py-2 text-[0.9375rem] text-ink-2 transition-colors duration-[120ms] hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/contacto">Pedir presupuesto</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menú</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {[...links, { href: '/login', label: 'Entrar' }].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-sm px-3 py-2.5 text-[0.9375rem] font-medium text-ink hover:bg-n-100"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
