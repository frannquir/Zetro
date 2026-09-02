'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function AdminNav({ items }: { items: { href: string; label: string; exact?: boolean }[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex h-10 items-center rounded-sm px-3 text-[0.9375rem] font-medium transition-colors duration-[120ms]',
              active
                ? 'bg-surface text-ink before:absolute before:inset-y-2 before:-left-3 before:w-[3px] before:rounded-r-sm before:bg-brand before:content-[""]'
                : 'text-ink-2 hover:bg-n-100 hover:text-ink',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
