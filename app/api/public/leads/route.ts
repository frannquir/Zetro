import { createHash } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { apiError } from '@/lib/supabase/errors'
import { contactEmail, sendMail } from '@/lib/email/send'

const maxBody = 4096
const perIpLimit = 5
const perIpWindowSeconds = 3600

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(160),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(10).max(2000),
  source_path: z.string().max(200).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
  company_website: z.string().optional(),
})

function clientIp(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}

function bucketFor(request: NextRequest) {
  const digest = createHash('sha256')
    .update(`${process.env.ANALYTICS_SALT ?? ''}:${clientIp(request)}`)
    .digest('hex')
  return `leads:${digest.slice(0, 32)}`
}

function summarise(meta: Record<string, unknown> | undefined) {
  if (!meta) return ''
  const lines = Array.isArray(meta.selection) ? (meta.selection as unknown[]).map((line) => `- ${String(line)}`) : []
  return [
    '',
    'Presupuesto armado en el sitio:',
    ...(lines.length > 0 ? lines : ['- Solo el sitio base, sin agregados']),
    meta.once ? `Inversión inicial estimada: ${String(meta.once)}` : '',
    meta.monthly ? `Mensual estimado: ${String(meta.monthly)}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (origin && new URL(origin).host !== request.nextUrl.host) return apiError('forbidden')

  const raw = await request.text()
  if (raw.length > maxBody) return apiError('validation_failed', { limit: maxBody })

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return apiError('validation_failed')
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return apiError('validation_failed')

  // honeypot: answer like a success so the bot stops retrying
  if (parsed.data.company_website) return NextResponse.json({ ok: true })

  const { name, email, phone, message, source_path, meta } = parsed.data
  const supabase = createServiceClient()

  const { data: allowed } = await supabase.rpc('check_rate_limit', {
    p_bucket: bucketFor(request),
    p_limit: perIpLimit,
    p_window_seconds: perIpWindowSeconds,
  })
  if (allowed === false) return apiError('rate_limited')

  const { error } = await supabase.from('leads').insert({
    name,
    email,
    phone: phone ?? null,
    message,
    source_path: source_path ?? null,
    meta: (meta ?? {}) as never,
  })
  if (error) {
    console.error('lead insert failed', error.code, error.message)
    return apiError('server_error', { pg: error.code })
  }

  const budget = summarise(meta)

  // the lead is already stored, a resend outage must not cost us the response
  const notify = await sendMail({
    to: contactEmail,
    replyTo: email,
    subject: budget ? `Pedido de presupuesto — ${name}` : `Consulta — ${name}`,
    text: [
      `Nombre: ${name}`,
      `Email: ${email}`,
      phone ? `Teléfono o WhatsApp: ${phone}` : '',
      source_path ? `Vino de: ${source_path}` : '',
      '',
      message,
      budget,
    ]
      .filter(Boolean)
      .join('\n'),
  })
  if (!notify.ok) console.error('lead notification failed', notify.reason)

  const ack = await sendMail({
    to: email,
    subject: 'Recibimos tu consulta — Zetro',
    text: [
      `Hola ${name.split(' ')[0]},`,
      '',
      'Nos llegó tu mensaje. Te respondemos por este mismo medio dentro del día hábil.',
      budget ? `${budget}\n` : '',
      'Si mientras tanto querés agregar algo, respondé este mail.',
      '',
      'Zetro',
      contactEmail,
    ]
      .filter(Boolean)
      .join('\n'),
  })
  if (!ack.ok) console.error('lead acknowledgement failed', ack.reason)

  return NextResponse.json({ ok: true })
}
