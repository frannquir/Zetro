'use client'

import Link from 'next/link'
import { Check, ChevronsUpDown, Shield } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { memberRoleLabel, verticalLabel } from '@/lib/labels'
import { cn } from '@/lib/utils'

export type SwitcherOrg = { slug: string; name: string; vertical: string; role: string }

export function OrgSwitcher({
  orgs,
  current,
  isPlatformAdmin,
}: {
  orgs: SwitcherOrg[]
  current: string
  isPlatformAdmin: boolean
}) {
  const active = orgs.find((org) => org.slug === current)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
          {active?.name.slice(0, 1).toUpperCase() ?? '?'}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{active?.name ?? 'Elegí un negocio'}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {active ? `${verticalLabel(active.vertical)} · ${memberRoleLabel(active.role)}` : ''}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Tus negocios</DropdownMenuLabel>
        {orgs.map((org) => (
          <DropdownMenuItem key={org.slug} asChild>
            <Link href={`/panel/${org.slug}`} className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate">{org.name}</span>
              <Check className={cn('size-4', org.slug === current ? 'opacity-100' : 'opacity-0')} />
            </Link>
          </DropdownMenuItem>
        ))}

        {isPlatformAdmin ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center gap-2">
                <Shield className="size-4" /> Consola Zetro
              </Link>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
