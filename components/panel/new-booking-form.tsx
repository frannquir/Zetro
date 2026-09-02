'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { Org, Service, Slot } from '@/lib/data'
import { createBooking } from '@/lib/data/actions'
import { formatMoney, formatTime } from '@/lib/format'
import { formatDuration } from '@/lib/format'
import { vocabularyFor } from '@/lib/vertical'

export function NewBookingForm({
  org,
  services,
  initialDate,
  getSlots,
}: {
  org: Org
  services: Service[]
  initialDate: string
  getSlots: (serviceId: string, date: string) => Promise<Slot[]>
}) {
  const router = useRouter()
  const words = vocabularyFor(org.vertical)
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '')
  const [date, setDate] = useState(initialDate)
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [loadingSlots, startSlotLoad] = useTransition()
  const [selected, setSelected] = useState<Slot | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const service = useMemo(() => services.find((item) => item.id === serviceId) ?? null, [services, serviceId])

  function loadSlots(nextService: string, nextDate: string) {
    setSelected(null)
    startSlotLoad(async () => {
      setSlots(await getSlots(nextService, nextDate))
    })
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) {
      setError('Elegí un horario')
      return
    }
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError(null)

    const result = await createBooking(org.slug, {
      resource_id: selected.resourceId,
      service_id: serviceId,
      starts_at: selected.startsAt,
      party_size: Number(form.get('party_size') ?? 1),
      customer: {
        full_name: form.get('full_name'),
        email: form.get('email') || undefined,
        phone: form.get('phone') || undefined,
      },
      notes: form.get('notes') || undefined,
    })

    setPending(false)
    if (result.ok) router.push(`/panel/${org.slug}/reservas`)
    else setError('No pudimos crear la reserva')
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="service">{words.service}</Label>
          <Select
            value={serviceId}
            onValueChange={(value) => {
              setServiceId(value)
              loadSlots(value, date)
            }}
          >
            <SelectTrigger id="service" className="w-full">
              <SelectValue placeholder="Elegí un servicio" />
            </SelectTrigger>
            <SelectContent>
              {services.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name} · {formatDuration(item.durationMinutes)}
                  {item.priceCents ? ` · ${formatMoney(item.priceCents, org.currency)}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Input
            id="date"
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(event) => {
              setDate(event.target.value)
              loadSlots(serviceId, event.target.value)
            }}
          />
        </div>

        {words.showParty ? (
          <div className="space-y-2">
            <Label htmlFor="party_size">{words.party}</Label>
            <Input id="party_size" name="party_size" type="number" min={1} defaultValue={2} />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label>Horario</Label>
          {!slots ? (
            <Button type="button" variant="outline" onClick={() => loadSlots(serviceId, date)} disabled={!serviceId}>
              Buscar horarios
            </Button>
          ) : loadingSlots ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Buscando
            </p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay horarios libres ese día. Probá otra fecha.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => (
                <button
                  key={`${slot.startsAt}-${slot.resourceId}`}
                  type="button"
                  onClick={() => setSelected(slot)}
                  className={
                    selected?.startsAt === slot.startsAt && selected.resourceId === slot.resourceId
                      ? 'rounded-md border-2 border-primary bg-primary/10 px-2 py-1.5 text-sm font-medium'
                      : 'rounded-md border px-2 py-1.5 text-sm hover:border-primary/50'
                  }
                >
                  {formatTime(slot.startsAt, { timeZone: org.timeZone })}
                </button>
              ))}
            </div>
          )}
          {selected ? (
            <p className="text-sm text-muted-foreground">
              {selected.resourceName} · {formatTime(selected.startsAt, { timeZone: org.timeZone })}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre</Label>
            <Input id="full_name" name="full_name" required placeholder="Nombre del cliente" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" name="phone" type="tel" placeholder="11 5555 5555" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Mail</Label>
          <Input id="email" name="email" type="email" placeholder="opcional" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Nota</Label>
          <Textarea id="notes" name="notes" rows={3} placeholder="Alergias, pedidos especiales, lo que haga falta" />
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>No se pudo crear</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="submit" disabled={pending || !service} className="w-full sm:w-auto">
          {pending ? <Loader2 className="animate-spin" /> : null}
          {pending ? 'Creando' : words.newBooking}
        </Button>
      </div>
    </form>
  )
}
