import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const tables = [
  'resources',
  'services',
  'service_resources',
  'availability_rules',
  'availability_exceptions',
  'customers',
  'bookings',
  'booking_events',
]

const required = ['RLS_CHECK_OWNER', 'RLS_CHECK_STAFF', 'RLS_CHECK_OUTSIDER', 'RLS_CHECK_PASSWORD']

if (existsSync('.env')) process.loadEnvFile()

const missing = required.filter((key) => !process.env[key])
if (missing.length > 0) {
  console.error(`missing ${missing.join(', ')}`)
  console.error('set them in .env: two logins in one org (owner + staff) and one in another org')
  process.exit(1)
}

function localStack() {
  const raw = execSync('npx supabase status -o json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  const json = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
  if (!json) throw new Error('supabase status returned no json, is the local stack up?')

  const status = JSON.parse(json) as Record<string, string>
  const url = status.API_URL

  // .env points at the remote project and this script writes rows
  if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(url)) {
    throw new Error(`refusing to run against ${url}, this script only runs on the local stack`)
  }

  return { url, anonKey: status.ANON_KEY ?? status.PUBLISHABLE_KEY }
}

const { url, anonKey } = localStack()

let failures = 0
let skipped = 0

function check(label: string, ok: boolean, detail?: string) {
  if (!ok) failures += 1
  console.log(`${ok ? 'pass' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`)
}

function skip(label: string, why: string) {
  skipped += 1
  console.log(`skip  ${label}  (${why})`)
}

function client() {
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function signIn(email: string) {
  const supabase = client()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: process.env.RLS_CHECK_PASSWORD as string,
  })
  if (error) throw new Error(`${email}: ${error.message}`)
  return { supabase, userId: data.user.id }
}

async function memberships(session: { supabase: SupabaseClient; userId: string }) {
  const { data, error } = await session.supabase
    .from('memberships')
    .select('org_id, role')
    .eq('user_id', session.userId)
  if (error) throw new Error(`memberships: ${error.message}`)
  return (data ?? []) as { org_id: string; role: string }[]
}

async function rows(supabase: SupabaseClient, table: string, orgId?: string) {
  const query = supabase.from(table).select('org_id')
  const { data, error } = orgId ? await query.eq('org_id', orgId) : await query
  const orgIds = ((data ?? []) as { org_id: string }[]).map((row) => row.org_id)
  return { count: orgIds.length, orgIds, error: error?.code ?? null }
}

const owner = await signIn(process.env.RLS_CHECK_OWNER as string)
const staff = await signIn(process.env.RLS_CHECK_STAFF as string)
const outsider = await signIn(process.env.RLS_CHECK_OUTSIDER as string)
const anon = client()

const ownerRoles = await memberships(owner)
const home = ownerRoles.find((m) => m.role === 'owner')
if (!home) throw new Error(`${process.env.RLS_CHECK_OWNER} owns no org, RLS_CHECK_OWNER must be an owner`)

const orgId = home.org_id
const { data: org } = await owner.supabase.from('orgs').select('name').eq('id', orgId).single()
const orgName = (org?.name as string | undefined) ?? orgId

const staffRoles = await memberships(staff)
const staffHere = staffRoles.find((m) => m.org_id === orgId)
const outsiderHere = (await memberships(outsider)).some((m) => m.org_id === orgId)

console.log(`\nrls-check against ${url}`)
console.log(`org under test: ${orgName}\n`)

if (staffHere?.role !== 'staff') {
  throw new Error(`RLS_CHECK_STAFF must be a staff member of ${orgName}, got ${staffHere?.role ?? 'no membership'}`)
}
if (outsiderHere) {
  throw new Error(`RLS_CHECK_OUTSIDER must not be a member of ${orgName}`)
}

console.log(`1. ${process.env.RLS_CHECK_OUTSIDER} cannot see ${orgName}`)
for (const table of ['bookings', 'customers', 'resources']) {
  const theirs = await rows(outsider.supabase, table, orgId)
  const all = await rows(outsider.supabase, table)
  check(`${table}: rows from ${orgName} visible = ${theirs.count}`, theirs.count === 0, theirs.error ?? undefined)
  check(
    `${table}: unfiltered read carries no ${orgName} row`,
    all.orgIds.every((id) => id !== orgId),
    `${all.count} rows of their own`,
  )
}

const ownerBookings = await rows(owner.supabase, 'bookings', orgId)
if (ownerBookings.count === 0) {
  skip(`${orgName} owner reads its own bookings`, 'no bookings in this org, seed it to make this meaningful')
} else {
  check(`${orgName} owner reads its own bookings`, true, `${ownerBookings.count} rows`)
}

console.log('\n2. staff writes bookings, not resources or services')
const { data: resource } = await owner.supabase
  .from('resources')
  .select('id')
  .eq('org_id', orgId)
  .is('archived_at', null)
  .limit(1)
  .maybeSingle()
const { data: service } = await owner.supabase
  .from('services')
  .select('id')
  .eq('org_id', orgId)
  .is('archived_at', null)
  .limit(1)
  .maybeSingle()

let bookingId: string | undefined

if (!resource || !service) {
  skip('staff insert booking', `${orgName} has no resource or service to book`)
} else {
  const starts = new Date(Date.UTC(new Date().getUTCFullYear() + 5, 0, 1, 3))
  const booking = await staff.supabase
    .from('bookings')
    .insert({
      org_id: orgId,
      resource_id: resource.id,
      service_id: service.id,
      starts_at: starts.toISOString(),
      ends_at: new Date(starts.getTime() + 90 * 60_000).toISOString(),
      party_size: 1,
      status: 'confirmed',
    })
    .select('id')
    .single()
  check('staff insert booking', booking.error === null, booking.error?.code ?? booking.error?.message)
  bookingId = booking.data?.id

  if (bookingId) {
    const { data: trail } = await staff.supabase
      .from('booking_events')
      .select('to_status')
      .eq('booking_id', bookingId)
    check('trigger wrote the event under a staff session', (trail?.length ?? 0) === 1, `${trail?.length ?? 0} events`)
  }
}

const staffResource = await staff.supabase
  .from('resources')
  .insert({ org_id: orgId, name: 'rls-check', kind: 'table', capacity: 1 })
check('staff insert resource is denied', staffResource.error?.code === '42501', staffResource.error?.code ?? 'no error')

const staffService = await staff.supabase
  .from('services')
  .insert({ org_id: orgId, name: 'rls-check', duration_minutes: 30 })
check('staff insert service is denied', staffService.error?.code === '42501', staffService.error?.code ?? 'no error')

console.log('\n3. anon key reads nothing')
for (const table of tables) {
  const { count, error } = await rows(anon, table)
  check(`${table}: ${count} rows`, count === 0, error ?? undefined)
}

console.log('\n4. booking_events is trigger-only')
for (const [label, supabase] of [
  ['owner', owner.supabase],
  ['staff', staff.supabase],
  ['anon', anon],
] as const) {
  const { error } = await supabase
    .from('booking_events')
    .insert({ booking_id: bookingId ?? randomUUID(), org_id: orgId, to_status: 'confirmed' })
  check(`${label} insert into booking_events is denied`, error?.code === '42501', error?.code ?? 'no error')
}

if (bookingId) await staff.supabase.from('bookings').delete().eq('id', bookingId)

const tail = skipped > 0 ? `, ${skipped} skipped` : ''
console.log(failures === 0 ? `\nall assertions passed${tail}\n` : `\n${failures} assertion(s) failed${tail}\n`)
process.exit(failures === 0 ? 0 : 1)
