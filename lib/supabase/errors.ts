import { NextResponse } from 'next/server'
import type { PostgrestError } from '@supabase/supabase-js'

export const errorCodes = [
  'unauthorized',
  'forbidden',
  'not_found',
  'validation_failed',
  'slot_taken',
  'capacity_full',
  'rate_limited',
  'integration_error',
  'server_error',
] as const

export type ErrorCode = (typeof errorCodes)[number]

export type ApiErrorBody = {
  error: { code: ErrorCode; message: string; details: Record<string, unknown> }
}

const messages: Record<ErrorCode, string> = {
  unauthorized: 'Necesitás iniciar sesión',
  forbidden: 'No tenés permiso para hacer esto',
  not_found: 'No encontramos lo que buscabas',
  validation_failed: 'Revisá los datos e intentá de nuevo',
  slot_taken: 'Ese horario ya no está disponible',
  capacity_full: 'No quedan lugares disponibles',
  rate_limited: 'Demasiados intentos, esperá un momento',
  integration_error: 'No pudimos conectar con el servicio externo',
  server_error: 'Algo salió mal de nuestro lado',
}

const statuses: Record<ErrorCode, number> = {
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  validation_failed: 422,
  slot_taken: 409,
  capacity_full: 409,
  rate_limited: 429,
  integration_error: 502,
  server_error: 500,
}

export class ApiError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly details: Record<string, unknown>

  constructor(code: ErrorCode, details: Record<string, unknown> = {}) {
    super(messages[code])
    this.name = 'ApiError'
    this.code = code
    this.status = statuses[code]
    this.details = details
  }
}

export function errorBody(code: ErrorCode, details: Record<string, unknown> = {}): ApiErrorBody {
  return { error: { code, message: messages[code], details } }
}

export function apiError(code: ErrorCode, details: Record<string, unknown> = {}) {
  return NextResponse.json(errorBody(code, details), { status: statuses[code] })
}

function isErrorCode(value: string): value is ErrorCode {
  return (errorCodes as readonly string[]).includes(value)
}

const sqlstates: Record<string, ErrorCode> = {
  '23P01': 'slot_taken',
  '23505': 'validation_failed',
  '23503': 'validation_failed',
  '23514': 'validation_failed',
  '42501': 'forbidden',
  PGRST116: 'not_found',
  PGRST301: 'unauthorized',
}

export function fromPostgrest(error: PostgrestError): ApiError {
  // rpcs raise with the #7.0 code as the exception message
  const raised = error.message.trim()
  if (isErrorCode(raised)) return new ApiError(raised)

  const mapped = sqlstates[error.code]
  if (mapped) return new ApiError(mapped, { pg: error.code })

  return new ApiError('server_error', { pg: error.code })
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    return fromPostgrest(error as PostgrestError)
  }
  return new ApiError('server_error')
}
