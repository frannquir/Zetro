'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { OrgSettings } from '@/lib/org/defaults'
import { panelNav } from '@/lib/nav'
import { cn } from '@/lib/utils'

export type NavContext = {
  orgSlug: string
  vertical: string
  settings: OrgSettings
  role: string
}

export function SidebarNav({ context, onNavigate }: { context: NavContext; onNavigate?: () => void }) {
  const pathname = usePathname()
  const groups = panelNav(context)

  return (
    <nav className="flex flex-col gap-5">
      {groups.map((group, index) => (
        <div key={group.label ?? index} className="space-y-1">
          {group.label ? (
            <p className="px-3 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">{group.label}</p>
          ) : null}
          {group.items.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground',
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
