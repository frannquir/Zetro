import Link from 'next/link'
import type { Metadata } from 'next'
import { AuthCard } from '@/components/auth/auth-card'
import { FormMessage } from '@/components/auth/form-message'
import { GoogleButton } from '@/components/auth/google-button'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Entrar — Zetro' }

const errors: Record<string, string> = {
  link: 'Ese enlace ya no sirve. Pedí uno nuevo o entrá con tu contraseña.',
  google: 'No pudimos entrar con Google. Probá con tu contraseña.',
  sin_cuenta: 'Ese mail no tiene cuenta en Zetro. Pedile una invitación a alguien de tu equipo.',
}

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const { next, error } = await searchParams
  const target = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/panel'
  const message = typeof error === 'string' ? errors[error] : null

  return (
    <AuthCard
      title="Entrá a tu panel"
      description="Con el mail que nos diste cuando armamos tu sitio."
      footer={
        <>
          ¿Todavía no trabajás con nosotros?{' '}
          <Link href="/contacto" className="font-medium text-ink hover:underline">
            Pedí un presupuesto
          </Link>
        </>
      }
    >
      {message ? (
        <div className="mb-5">
          <FormMessage error={message} />
        </div>
      ) : null}

      <GoogleButton next={target} />

      <div className="my-5 flex items-center gap-3 text-[0.8125rem] text-ink-4">
        <span className="h-px flex-1 bg-n-200" />o<span className="h-px flex-1 bg-n-200" />
      </div>

      <LoginForm next={target} />
    </AuthCard>
  )
}
