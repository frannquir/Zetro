'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function SearchBox({ paramKey = 'q', placeholder }: { paramKey?: string; placeholder: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  return (
    <div className="relative max-w-sm flex-1">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        defaultValue={params.get(paramKey) ?? ''}
        onChange={(event) => {
          const next = new URLSearchParams(params)
          if (event.target.value) next.set(paramKey, event.target.value)
          else next.delete(paramKey)
          startTransition(() => router.replace(`${pathname}?${next.toString()}`))
        }}
        placeholder={placeholder}
        className="pl-9"
        aria-label={placeholder}
      />
    </div>
  )
}
