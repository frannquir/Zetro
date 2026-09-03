import Link from 'next/link'
import type { Metadata } from 'next'
import { AuthCard } from '@/components/auth/auth-card'
import { FormMessage } from '@/components/auth/form-message'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Entrar — Zetro' }

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const { next, error } = await searchParams
  const target = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/panel'

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
      {error === 'link' ? (
        <div className="mb-5">
          <FormMessage error="Ese enlace ya no sirve. Pedí uno nuevo o entrá con tu contraseña." />
        </div>
      ) : null}
      <LoginForm next={target} />
    </AuthCard>
  )
}
