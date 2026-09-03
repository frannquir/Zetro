'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { settingsNav } from '@/lib/nav'
import { cn } from '@/lib/utils'

export function SettingsTabs({ orgSlug, role }: { orgSlug: string; role: string }) {
  const pathname = usePathname()
  const items = settingsNav(orgSlug, role)

  return (
    <div className="border-b border-n-200">
      <nav className="-mb-px flex gap-1 overflow-x-auto">
        {items.map((item) => {
          const active = 'exact' in item && item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-10 shrink-0 items-center border-b-2 px-3 text-[0.9375rem] font-medium transition-colors duration-[120ms]',
                active ? 'border-brand text-ink' : 'border-transparent text-ink-3 hover:text-ink',
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
