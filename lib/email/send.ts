export const contactEmail = 'contacto@zetro.app'

const from = `Zetro <${contactEmail}>`
const endpoint = 'https://api.resend.com/emails'

type Mail = {
  to: string
  subject: string
  text: string
  replyTo?: string
}

export type MailResult = { ok: true } | { ok: false; reason: string }

export async function sendMail({ to, subject, text, replyTo }: Mail): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY
  if (!key) return { ok: false, reason: 'RESEND_API_KEY is not set' }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to, subject, text, reply_to: replyTo }),
    })

    if (!response.ok) return { ok: false, reason: `resend ${response.status} ${await response.text()}` }
    return { ok: true }
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) }
  }
}
