import { getMembership, getViewer } from '@/lib/data'
import { SidebarNav } from '@/components/panel/sidebar-nav'
import { OrgSwitcher } from '@/components/panel/org-switcher'
import { UserMenu } from '@/components/panel/user-menu'
import { MobileNav } from '@/components/panel/mobile-nav'
import { PausedBanner } from '@/components/panel/paused-banner'

export default async function PanelLayout({ children, params }: LayoutProps<'/panel/[orgSlug]'>) {
  const { orgSlug } = await params
  const [viewer, membership] = await Promise.all([getViewer(), getMembership(orgSlug)])
  const { org, role } = membership

  const context = { orgSlug, vertical: org.vertical, settings: org.settings, role }
  const orgs = viewer.memberships.map((item) => ({
    slug: item.org.slug,
    name: item.org.name,
    vertical: item.org.vertical,
    role: item.role,
  }))

  return (
    <div className="flex min-h-dvh bg-paper">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-n-200 bg-paper-2 lg:flex">
        <div className="flex h-14 items-center border-b border-n-200 px-3">
          <OrgSwitcher orgs={orgs} current={orgSlug} isPlatformAdmin={viewer.isPlatformAdmin} />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav context={context} />
        </div>
        <div className="border-t border-n-200 px-4 py-3 text-[0.8125rem] text-ink-4">Zetro</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-n-200 bg-paper px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <MobileNav context={context} orgs={orgs} isPlatformAdmin={viewer.isPlatformAdmin} />
            <span className="truncate font-medium text-[0.9375rem] lg:hidden">{org.name}</span>
          </div>
          <UserMenu
            fullName={viewer.fullName}
            email={viewer.email}
            settingsHref={`/panel/${orgSlug}/ajustes`}
          />
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8">
          <PausedBanner status={org.status} />
          {children}
        </main>
      </div>
    </div>
  )
}
