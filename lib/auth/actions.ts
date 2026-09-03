'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { FormState } from './form-state'
const credentials = z.object({
  email: z.email('Revisá el mail'),
  password: z.string().min(1, 'Escribí tu contraseña'),
})

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Revisá los datos'
}

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === 'string' ? value : ''
  return next.startsWith('/') && !next.startsWith('//') ? next : '/panel'
}

export async function signIn(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = credentials.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: firstIssue(parsed.error), notice: null }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: 'Mail o contraseña incorrectos', notice: null }

  redirect(safeNext(formData.get('next')))
}

export async function sendMagicLink(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = z.email('Revisá el mail').safeParse(formData.get('email'))
  if (!parsed.success) return { error: 'Revisá el mail', notice: null }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/auth/callback?next=${encodeURIComponent(safeNext(formData.get('next')))}`,
    },
  })
  if (error) return { error: 'No pudimos enviar el enlace. Probá con tu contraseña.', notice: null }

  return { error: null, notice: 'Te mandamos un enlace para entrar. Revisá tu correo.' }
}

export async function signInWithGoogle(_state: FormState, formData: FormData): Promise<FormState> {
  const next = safeNext(formData.get('next'))
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: { prompt: 'select_account' },
    },
  })

  if (error || !data.url) return { error: 'No pudimos abrir Google. Entrá con tu contraseña.', notice: null }

  redirect(data.url)
}

export async function requestPasswordReset(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = z.email('Revisá el mail').safeParse(formData.get('email'))
  if (!parsed.success) return { error: 'Revisá el mail', notice: null }

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/auth/callback?next=/recuperar`,
  })

  // same answer either way, otherwise this endpoint enumerates accounts
  return { error: null, notice: 'Si ese mail tiene cuenta, le llega un enlace en un minuto.' }
}

const newPassword = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirm: z.string(),
  })
  .refine((value) => value.password === value.confirm, { message: 'Las contraseñas no coinciden' })

export async function setPassword(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = newPassword.safeParse({
    password: formData.get('password'),
    confirm: formData.get('confirm'),
  })
  if (!parsed.success) return { error: firstIssue(parsed.error), notice: null }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) return { error: 'No pudimos guardar la contraseña. Pedí un enlace nuevo.', notice: null }

  redirect('/panel')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
