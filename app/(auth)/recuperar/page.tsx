import Link from 'next/link'
import type { Metadata } from 'next'
import { AuthCard } from '@/components/auth/auth-card'
import { ResetForm } from '@/components/auth/reset-form'

export const metadata: Metadata = { title: 'Recuperar contraseña — Zetro' }

export default async function RecuperarPage({ searchParams }: PageProps<'/recuperar'>) {
  const { code, token_hash } = await searchParams
  const inSession = Boolean(code || token_hash)

  return (
    <AuthCard
      title={inSession ? 'Elegí una contraseña nueva' : 'Recuperar contraseña'}
      description={
        inSession
          ? 'Con esto ya entrás al panel.'
          : 'Poné tu mail y te mandamos un enlace para volver a entrar.'
      }
      footer={
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Volver a entrar
        </Link>
      }
    >
      <ResetForm mode={inSession ? 'set' : 'request'} />
    </AuthCard>
  )
}
