import { getViewer } from '@/lib/data'
import { adminNav } from '@/lib/nav'
import { AdminNav } from '@/components/admin/admin-nav'
import { UserMenu } from '@/components/panel/user-menu'
import { Logo } from '@/components/marketing/logo'

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  const viewer = await getViewer()

  return (
    <div className="flex min-h-dvh bg-paper">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-n-200 bg-paper-2 lg:flex">
        <div className="flex h-14 items-center gap-2 border-b border-n-200 px-3">
          <Logo className="size-6" />
          <span className="text-[0.9375rem] font-semibold tracking-tight text-ink">Consola Zetro</span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AdminNav items={adminNav} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-n-200 bg-paper px-4 sm:px-6">
          <span className="font-medium text-[0.9375rem] text-ink lg:hidden">Consola Zetro</span>
          <div className="ml-auto">
            <UserMenu fullName={viewer.fullName} email={viewer.email} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  )
}
