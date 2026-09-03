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
            <p className="px-3 pt-2 pb-1.5 text-xs leading-none tracking-[0.06em] font-medium text-ink-4 uppercase">{group.label}</p>
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
                  'group relative flex h-10 items-center gap-2.5 rounded-sm px-3 text-[0.9375rem] font-medium transition-colors duration-[120ms]',
                  active
                    ? 'bg-surface text-ink before:absolute before:inset-y-2 before:-left-3 before:w-[3px] before:rounded-r-sm before:bg-brand before:content-[""]'
                    : 'text-ink-2 hover:bg-n-100 hover:text-ink',
                )}
              >
                <item.icon className="size-4 shrink-0 text-ink-3 group-aria-[current=page]:text-ink" />
                {item.label}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
