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
      <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left transition-colors duration-[120ms] hover:bg-n-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-[0.8125rem] font-semibold text-paper">
          {active?.name.slice(0, 1).toUpperCase() ?? '?'}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.9375rem] font-medium text-ink">{active?.name ?? 'Elegí un negocio'}</span>
          <span className="block truncate text-[0.8125rem] text-ink-3">
            {active ? `${verticalLabel(active.vertical)} · ${memberRoleLabel(active.role)}` : ''}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-ink-3" />
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
