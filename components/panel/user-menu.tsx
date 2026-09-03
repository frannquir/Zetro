'use client'

import Link from 'next/link'
import { LogOut, Settings, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/lib/auth/actions'

export function UserMenu({
  fullName,
  email,
  settingsHref,
}: {
  fullName: string
  email: string
  settingsHref?: string
}) {
  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map((part) => part.slice(0, 1))
    .join('')
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex size-9 items-center justify-center rounded-full bg-n-100 text-[0.8125rem] font-semibold text-ink transition-colors duration-[120ms] hover:bg-n-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
        {initials || <User className="size-4" />}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-[0.9375rem] font-medium text-ink">{fullName}</span>
          <span className="block truncate text-[0.8125rem] text-ink-3">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {settingsHref ? (
          <DropdownMenuItem asChild>
            <Link href={settingsHref} className="flex items-center gap-2">
              <Settings className="size-4" /> Ajustes
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild variant="destructive">
          <form action={signOut}>
            <button type="submit" className="flex w-full items-center gap-2">
              <LogOut className="size-4" /> Cerrar sesión
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
