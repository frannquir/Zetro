import { execSync } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { defaultSettings } from '../lib/org/defaults.ts'

const intakeDir = 'supabase/intake'

const usage = `
usage: node scripts/import-org.ts [--dry-run] [--local] [--yes] <file.json | --all>

  --dry-run   validate and print what would be created, write nothing
  --all       every *.json in ${intakeDir}
  --local     target the local stack instead of whatever .env points at
  --yes       required when the target is not the local stack

one file per client. every required field has to be answered on the call:
a null in a required field fails the file by name instead of guessing a default.

  org      name, slug, vertical, timezone, currency, phone, address   (whatsapp nullable)
  site     name, domain
  settings booking { slot_minutes, lead_time_minutes, max_days_ahead,
                     auto_confirm, require_phone, max_party_size }
           modules { menu, events, classes }
  resources[]  name, kind, capacity                                   (zone nullable)
  services[]   name, duration_minutes, buffer_before_minutes,
               buffer_after_minutes, is_public                        (price_cents nullable)
  service_resources[]  service, resources[]    names, not ids. leave a service out to mean "any resource"
  availability_rules[] resource|null, weekday, opens_at, closes_at    0 = sunday, split shift = two rows
  availability_exceptions[] date, is_closed                           (note, opens_at, closes_at nullable)
`

const text = z.string().trim().min(1)
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

const schema = z.strictObject({
  org: z.strictObject({
    name: text,
    slug: z.string().regex(/^[a-z0-9-]+$/),
    vertical: z.enum(['restaurant', 'cafe', 'gym', 'barbershop', 'generic']),
    timezone: text,
    currency: z.string().length(3),
    phone: text,
    whatsapp: text.nullable(),
    address: text,
  }),
  site: z.strictObject({
    name: text,
    domain: z.string().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/),
  }),
  owner_email: z.string().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/),
  settings: z.strictObject({
    booking: z.strictObject({
      slot_minutes: z.number().int().positive(),
      lead_time_minutes: z.number().int().min(0),
      max_days_ahead: z.number().int().positive(),
      auto_confirm: z.boolean(),
      require_phone: z.boolean(),
      max_party_size: z.number().int().positive(),
    }),
    modules: z.strictObject({
      menu: z.boolean(),
      events: z.boolean(),
      classes: z.boolean(),
    }),
  }),
  resources: z
    .array(
      z.strictObject({
        name: text,
        kind: z.enum(['table', 'chair', 'room', 'court', 'staff', 'equipment']),
        capacity: z.number().int().positive(),
        zone: text.nullable(),
      }),
    )
    .min(1),
  services: z
    .array(
      z.strictObject({
        name: text,
        duration_minutes: z.number().int().positive(),
        buffer_before_minutes: z.number().int().min(0),
        buffer_after_minutes: z.number().int().min(0),
        price_cents: z.number().int().min(0).nullable(),
        is_public: z.boolean(),
      }),
    )
    .min(1),
  service_resources: z.array(z.strictObject({ service: text, resources: z.array(text).min(1) })),
  availability_rules: z
    .array(
      z.strictObject({
        resource: text.nullable(),
        weekday: z.number().int().min(0).max(6),
        opens_at: time,
        closes_at: time,
      }),
    )
    .min(1),
  availability_exceptions: z.array(
    z.strictObject({
      date: day,
      is_closed: z.boolean(),
      note: text.nullable(),
      opens_at: time.nullable().default(null),
      closes_at: time.nullable().default(null),
    }),
  ),
})

type Intake = z.infer<typeof schema>

function duplicates(values: string[]) {
  const seen = new Set<string>()
  return [...new Set(values.filter((value) => seen.size === seen.add(value).size))]
}

function crossCheck(file: Intake) {
  const problems: string[] = []
  const resources = file.resources.map((resource) => resource.name)
  const services = file.services.map((service) => service.name)

  for (const name of duplicates(resources)) problems.push(`resources: "${name}" appears twice, the name is the join key`)
  for (const name of duplicates(services)) problems.push(`services: "${name}" appears twice, the name is the join key`)

  file.service_resources.forEach((link, i) => {
    if (!services.includes(link.service)) {
      problems.push(`service_resources[${i}].service: no service named "${link.service}"`)
    }
    for (const name of link.resources) {
      if (!resources.includes(name)) problems.push(`service_resources[${i}].resources: no resource named "${name}"`)
    }
  })

  file.availability_rules.forEach((rule, i) => {
    if (rule.resource !== null && !resources.includes(rule.resource)) {
      problems.push(`availability_rules[${i}].resource: no resource named "${rule.resource}"`)
    }
    if (rule.closes_at <= rule.opens_at) {
      problems.push(
        `availability_rules[${i}]: closes_at ${rule.closes_at} is not after opens_at ${rule.opens_at}. past midnight is not supported, spec #13.3`,
      )
    }
  })

  file.availability_exceptions.forEach((exception, i) => {
    if (exception.is_closed && (exception.opens_at || exception.closes_at)) {
      problems.push(`availability_exceptions[${i}]: is_closed with hours on it, closed or open but not both`)
    }
    if (!exception.is_closed) {
      if (!exception.opens_at || !exception.closes_at) {
        problems.push(`availability_exceptions[${i}]: is_closed false needs opens_at and closes_at, it replaces the whole day`)
      } else if (exception.closes_at <= exception.opens_at) {
        problems.push(`availability_exceptions[${i}]: closes_at ${exception.closes_at} is not after opens_at ${exception.opens_at}`)
      }
    }
  })

  for (const date of duplicates(file.availability_exceptions.map((exception) => exception.date))) {
    problems.push(`availability_exceptions: ${date} listed twice, one exception per date`)
  }

  return problems
}

function parse(path: string) {
  let raw: unknown
  try {
    raw = JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    return { problems: [`not valid json: ${(error as Error).message}`] }
  }

  const result = schema.safeParse(raw)
  if (!result.success) {
    return {
      problems: result.error.issues.map(
        (issue) => `${issue.path.join('.') || '<root>'}: ${issue.message.toLowerCase()}`,
      ),
    }
  }

  const problems = crossCheck(result.data)
  return problems.length > 0 ? { problems } : { file: result.data }
}

async function insertRows(supabase: SupabaseClient, table: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return
  const { error } = await supabase.from(table).insert(rows)
  if (error) throw new Error(`${table}: ${error.message}`)
}

async function insertNamed(supabase: SupabaseClient, table: string, rows: Record<string, unknown>[]) {
  const { data, error } = await supabase.from(table).insert(rows).select('id, name')
  if (error) throw new Error(`${table}: ${error.message}`)
  return (data ?? []) as { id: string; name: string }[]
}

async function importOrg(supabase: SupabaseClient, file: Intake) {
  const existing = await supabase.from('orgs').select('id').eq('slug', file.org.slug).maybeSingle()
  if (existing.data) throw new Error(`slug ${file.org.slug} already exists as ${existing.data.id}`)

  const settings = {
    ...defaultSettings,
    booking: { ...defaultSettings.booking, ...file.settings.booking },
    modules: { ...defaultSettings.modules, ...file.settings.modules },
  }

  const org = await supabase.from('orgs').insert({ ...file.org, settings }).select('id').single()
  if (org.error) throw new Error(`orgs: ${org.error.message}`)

  const orgId = org.data.id as string

  try {
    const site = await supabase
      .from('sites')
      .insert({ org_id: orgId, name: file.site.name, domain: file.site.domain })
      .select('public_key')
      .single()
    if (site.error) throw new Error(`sites: ${site.error.message}`)

    const resources = await insertNamed(
      supabase,
      'resources',
      file.resources.map((resource, i) => ({
        org_id: orgId,
        name: resource.name,
        kind: resource.kind,
        capacity: resource.capacity,
        sort_order: i,
        metadata: resource.zone ? { zone: resource.zone } : {},
      })),
    )

    const services = await insertNamed(
      supabase,
      'services',
      file.services.map((service, i) => ({
        org_id: orgId,
        name: service.name,
        duration_minutes: service.duration_minutes,
        buffer_before_minutes: service.buffer_before_minutes,
        buffer_after_minutes: service.buffer_after_minutes,
        price_cents: service.price_cents,
        currency: service.price_cents === null ? null : file.org.currency,
        is_public: service.is_public,
        sort_order: i,
      })),
    )

    const resourceId = new Map(resources.map((row) => [row.name, row.id]))
    const serviceId = new Map(services.map((row) => [row.name, row.id]))

    await insertRows(
      supabase,
      'service_resources',
      file.service_resources.flatMap((link) =>
        link.resources.map((name) => ({
          org_id: orgId,
          service_id: serviceId.get(link.service),
          resource_id: resourceId.get(name),
        })),
      ),
    )

    await insertRows(
      supabase,
      'availability_rules',
      file.availability_rules.map((rule) => ({
        org_id: orgId,
        resource_id: rule.resource === null ? null : resourceId.get(rule.resource),
        weekday: rule.weekday,
        opens_at: rule.opens_at,
        closes_at: rule.closes_at,
      })),
    )

    await insertRows(
      supabase,
      'availability_exceptions',
      file.availability_exceptions.map((exception) => ({
        org_id: orgId,
        date: exception.date,
        is_closed: exception.is_closed,
        opens_at: exception.opens_at,
        closes_at: exception.closes_at,
        note: exception.note,
      })),
    )

    // same shape as private.new_token / private.hash_token, the raw token is printed once and never stored
    const token = (randomUUID() + randomUUID()).replaceAll('-', '')
    const invite = await supabase.from('invites').insert({
      org_id: orgId,
      email: file.owner_email,
      role: 'owner',
      token_hash: createHash('sha256').update(token, 'utf8').digest('hex'),
      expires_at: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
    })
    if (invite.error) throw new Error(`invites: ${invite.error.message}`)

    return {
      orgId,
      siteKey: site.data.public_key as string,
      token,
      resources: resources.length,
      services: services.length,
    }
  } catch (error) {
    await supabase.from('orgs').delete().eq('id', orgId)
    throw error
  }
}

const args = process.argv.slice(2)

if (args.length === 0 || args.includes('--help')) {
  console.log(usage)
  process.exit(args.length === 0 ? 1 : 0)
}

const dryRun = args.includes('--dry-run')
const confirmed = args.includes('--yes')

if (args.includes('--all') && !existsSync(intakeDir)) {
  console.error(`${intakeDir} does not exist yet, nothing to read`)
  process.exit(1)
}

const paths = args.includes('--all')
  ? readdirSync(intakeDir)
      .filter((name) => name.endsWith('.json'))
      .map((name) => join(intakeDir, name))
      .sort()
  : args.filter((arg) => !arg.startsWith('--'))

if (paths.length === 0) {
  console.error('no files to read')
  process.exit(1)
}

if (existsSync('.env')) process.loadEnvFile()

function localStack() {
  const raw = execSync('npx supabase status -o json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  const status = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)) as Record<string, string>
  return { url: status.API_URL, key: status.SERVICE_ROLE_KEY }
}

const target =
  !dryRun && args.includes('--local')
    ? localStack()
    : { url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY }

const url = target.url
const key = target.key
const local = /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(url ?? '')

if (!dryRun) {
  if (!url || !key) {
    console.error('missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  if (!local && !confirmed) {
    console.error(`${url} is not the local stack. re-run with --yes if that is really where these orgs go`)
    process.exit(1)
  }
}

const parsed = paths.map((path) => ({ path, ...parse(path) }))
const rejected = parsed.filter((entry) => entry.problems)

for (const entry of rejected) {
  console.log(`\n${entry.path}`)
  for (const problem of entry.problems ?? []) console.log(`  ${problem}`)
}

if (rejected.length > 0) {
  console.log(`\n${rejected.length} of ${parsed.length} file(s) rejected, nothing written\n`)
  process.exit(1)
}

if (dryRun) {
  console.log('')
  for (const entry of parsed) {
    const file = entry.file as Intake
    console.log(
      `${file.org.slug}  ${file.resources.length} resources · ${file.services.length} services · ` +
        `${file.availability_rules.length} rules · ${file.availability_exceptions.length} exceptions · owner ${file.owner_email}`,
    )
  }
  console.log(`\n${parsed.length} file(s) valid, nothing written\n`)
  process.exit(0)
}

const supabase = createClient(url as string, key as string, {
  auth: { persistSession: false, autoRefreshToken: false },
})

console.log(`\nimporting ${parsed.length} org(s) into ${url}\n`)

let failed = 0

for (const entry of parsed) {
  const file = entry.file as Intake
  try {
    const result = await importOrg(supabase, file)
    console.log(`${file.org.slug}  ${result.orgId}`)
    console.log(`  site key   ${result.siteKey}`)
    console.log(`  ${result.resources} resources · ${result.services} services`)
    console.log(`  invite     ${file.owner_email} → ${result.token}`)
  } catch (error) {
    failed += 1
    console.log(`${file.org.slug}  FAILED  ${(error as Error).message}`)
  }
}

console.log(failed === 0 ? `\n${parsed.length} org(s) imported\n` : `\n${failed} of ${parsed.length} failed\n`)
process.exitCode = failed === 0 ? 0 : 1
