'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { bookingStatusOptions } from '@/lib/labels'
import type { Resource } from '@/lib/data'

export function BookingFilters({ resources }: { resources: Resource[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const status = params.get('estado') ?? 'all'
  const resourceId = params.get('recurso') ?? 'all'
  const query = params.get('q') ?? ''

  function update(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    startTransition(() => router.replace(`${pathname}?${next.toString()}`))
  }

  const dirty = status !== 'all' || resourceId !== 'all' || query !== ''

  return (
    <div className="flex flex-wrap items-center gap-2" data-pending={pending ? '' : undefined}>
      <div className="relative min-w-52 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={query}
          onChange={(event) => update('q', event.target.value)}
          placeholder="Buscar por nombre, mail o teléfono"
          className="pl-9"
          aria-label="Buscar"
        />
      </div>

      <Select value={status} onValueChange={(value) => update('estado', value)}>
        <SelectTrigger className="w-40" aria-label="Estado">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          {bookingStatusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={resourceId} onValueChange={(value) => update('recurso', value)}>
        <SelectTrigger className="w-44" aria-label="Recurso">
          <SelectValue placeholder="Recurso" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {resources.map((resource) => (
            <SelectItem key={resource.id} value={resource.id}>
              {resource.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {dirty ? (
        <Button variant="ghost" size="sm" onClick={() => startTransition(() => router.replace(pathname))}>
          <X /> Limpiar
        </Button>
      ) : null}
    </div>
  )
}
