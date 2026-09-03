import { errorCodes, type ErrorCode } from '@/lib/supabase/errors'

export type ApiFailure = { code: ErrorCode; message: string; details: Record<string, unknown> }
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiFailure }

const fallback: ApiFailure = {
  code: 'server_error',
  message: 'Algo salió mal de nuestro lado',
  details: {},
}

function readFailure(body: unknown): ApiFailure {
  if (!body || typeof body !== 'object' || !('error' in body)) return fallback
  const error = (body as { error: unknown }).error
  if (!error || typeof error !== 'object') return fallback
  const { code, message, details } = error as Record<string, unknown>
  if (typeof code !== 'string' || !(errorCodes as readonly string[]).includes(code)) return fallback
  return {
    code: code as ErrorCode,
    message: typeof message === 'string' ? message : fallback.message,
    details: (details && typeof details === 'object' ? details : {}) as Record<string, unknown>,
  }
}

export async function postJson<T>(path: string, payload: unknown): Promise<ApiResult<T>> {
  let response: Response
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    return { ok: false, error: fallback }
  }

  const body = await response.json().catch(() => null)
  if (!response.ok) return { ok: false, error: readFailure(body) }
  return { ok: true, data: body as T }
}
