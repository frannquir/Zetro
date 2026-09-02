import type { Metadata } from 'next'
import { getAvailability, getMembership, getServices } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { NewBookingForm } from '@/components/panel/new-booking-form'
import { todayIn } from '@/lib/booking/grid'
import { vocabularyFor } from '@/lib/vertical'

export const metadata: Metadata = { title: 'Nueva reserva — Zetro' }

export default async function NuevaReservaPage({ params }: PageProps<'/panel/[orgSlug]/reservas/nueva'>) {
  const { orgSlug } = await params
  const { org } = await getMembership(orgSlug)
  const services = await getServices(orgSlug)
  const words = vocabularyFor(org.vertical)

  async function getSlots(serviceId: string, date: string) {
    'use server'
    return getAvailability(orgSlug, serviceId, date)
  }

  return (
    <>
      <PageHeader title={words.newBooking} description="Elegí un servicio y un horario libre, y cargá los datos del cliente." />
      <NewBookingForm org={org} services={services} initialDate={todayIn(org.timeZone)} getSlots={getSlots} />
    </>
  )
}
