import { getMembership } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { SettingsTabs } from '@/components/panel/settings-tabs'

export default async function AjustesLayout({ children, params }: LayoutProps<'/panel/[orgSlug]/ajustes'>) {
  const { orgSlug } = await params
  const { org, role } = await getMembership(orgSlug)

  return (
    <div className="space-y-6">
      <PageHeader title="Ajustes" description={`Configuración de ${org.name}.`} />
      <SettingsTabs orgSlug={orgSlug} role={role} />
      {children}
    </div>
  )
}
