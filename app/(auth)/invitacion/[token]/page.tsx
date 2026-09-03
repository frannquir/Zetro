import type { Metadata } from 'next'
import { AuthCard } from '@/components/auth/auth-card'
import { InviteForm } from '@/components/auth/invite-form'

export const metadata: Metadata = { title: 'Aceptar invitación — Zetro' }

export default async function InvitacionPage({ params }: PageProps<'/invitacion/[token]'>) {
  const { token } = await params

  return (
    <AuthCard
      title="Te invitaron al panel"
      description="Elegí una contraseña y ya podés entrar."
    >
      <InviteForm token={token} />
    </AuthCard>
  )
}
