'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { SidebarNav, type NavContext } from '@/components/panel/sidebar-nav'
import { OrgSwitcher, type SwitcherOrg } from '@/components/panel/org-switcher'

export function MobileNav({
  context,
  orgs,
  isPlatformAdmin,
}: {
  context: NavContext
  orgs: SwitcherOrg[]
  isPlatformAdmin: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-sidebar">
        <SheetHeader>
          <SheetTitle className="sr-only">Navegación</SheetTitle>
          <OrgSwitcher orgs={orgs} current={context.orgSlug} isPlatformAdmin={isPlatformAdmin} />
        </SheetHeader>
        <div className="px-4 pb-6">
          <SidebarNav context={context} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
