'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { settingsNav } from '@/lib/nav'
import { cn } from '@/lib/utils'

export function SettingsTabs({ orgSlug, role }: { orgSlug: string; role: string }) {
  const pathname = usePathname()
  const items = settingsNav(orgSlug, role)

  return (
    <div className="border-b">
      <nav className="-mb-px flex gap-1 overflow-x-auto">
        {items.map((item) => {
          const active = 'exact' in item && item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
