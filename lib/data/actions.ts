'use server'

import { revalidatePath } from 'next/cache'

// the write path lands when the rpcs in #7.2 exist; until then these only bounce the cache
async function touch(orgSlug: string, path = '') {
  revalidatePath(`/panel/${orgSlug}${path}`)
  return { ok: true as const }
}

export async function setBookingStatus(orgSlug: string, _bookingId: string, _status: string) {
  return touch(orgSlug, '/reservas')
}

export async function cancelBooking(orgSlug: string, _bookingId: string, _reason: string) {
  return touch(orgSlug, '/reservas')
}

export async function rescheduleBooking(orgSlug: string, _bookingId: string, _startsAt: string, _resourceId: string) {
  return touch(orgSlug, '/reservas')
}

export async function createBooking(orgSlug: string, _payload: Record<string, unknown>) {
  return touch(orgSlug, '/reservas')
}
