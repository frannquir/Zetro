import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowRight, Shield } from 'lucide-react'
import { getViewer } from '@/lib/data'
import { memberRoleLabel, verticalLabel } from '@/lib/labels'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/marketing/logo'

export const metadata: Metadata = { title: 'Tus negocios — Zetro' }

export default async function PanelIndexPage() {
  const viewer = await getViewer()

  if (viewer.memberships.length === 1) redirect(`/panel/${viewer.memberships[0].org.slug}`)

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-5 py-14">
      <div className="flex items-center gap-2">
        <Logo className="size-7" />
        <span className="text-lg font-semibold tracking-tight">Zetro</span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">¿Con cuál trabajamos hoy?</h1>
        <p className="text-sm text-muted-foreground">Tenés acceso a más de un negocio.</p>
      </div>

      {viewer.memberships.length === 0 ? (
        <EmptyState
          title="Todavía no te sumaron a ningún negocio"
          description="Pedile al dueño de la cuenta que te mande una invitación al mail con el que entraste."
        />
      ) : (
        <ul className="space-y-2">
          {viewer.memberships.map(({ org, role }) => (
            <li key={org.slug}>
              <Link
                href={`/panel/${org.slug}`}
                className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                  {org.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{org.name}</span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {verticalLabel(org.vertical)} · {memberRoleLabel(role)}
                  </span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {viewer.isPlatformAdmin ? (
        <Button asChild variant="outline">
          <Link href="/admin">
            <Shield /> Ir a la consola de Zetro
          </Link>
        </Button>
      ) : null}
    </div>
  )
}
